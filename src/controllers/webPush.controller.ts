import { NextFunction, Request, Response } from 'express';
import webPush from 'web-push';

import Comic from '../models/Comic.model';
import NtModel from '../models/Nt.model';
import Subscriber from '../models/Subscriber.model';
import { Subscription } from '../types/notify';

const baseUrl = process.env.NT_SOURCE_URL as string;
const Nt = NtModel.Instance(baseUrl);

export default function webPushController() {
    return {
        subscribe: async (req: Request, res: Response, next: NextFunction) => {
            const { userId, comicId, endpoint, p256dh, auth } = req.body;

            //validate body
            if (!userId || !comicId || !endpoint || !p256dh || !auth) {
                return res.status(400).json({
                    message: 'missing payload',
                });
            }

            //avoid to duplicate identifications
            const existingIdentifications = await Subscriber.findOne({
                userId,
                identifications: { $elemMatch: { endpoint, p256dh, auth } },
            });

            if (comicId !== 'just_push_new_subscribe') {
                //check exist comic in db:
                const existingComic = await Comic.findById(comicId);

                //missing comic -> get comic -> insert
                if (!existingComic) {
                    const comic = await Nt.getLatestChapter(comicId);

                    //check comic data get successful
                    if (
                        comic &&
                        Object.keys(comic).length === 0 &&
                        Object.getPrototypeOf(comic) === Object.prototype
                    ) {
                        console.error('missing comic');
                        return res.status(404).json({
                            success: false,
                            message: 'can not found comic',
                        });
                    }

                    await Comic.create({
                        _id: comicId,
                        title: comic.title,
                        latestChapter: comic.latestChapter,
                        cover: comic.cover,
                    });
                }

                if (!existingIdentifications) {
                    //update user to subscribers
                    await Subscriber.updateOne(
                        { userId },
                        {
                            userId,
                            $addToSet: {
                                identifications: {
                                    endpoint,
                                    p256dh,
                                    auth,
                                },
                                subComics: comicId,
                            },
                        },
                        { upsert: true },
                    );
                } else {
                    await Subscriber.updateOne(
                        { userId },
                        {
                            userId,
                            $addToSet: {
                                subComics: comicId,
                            },
                        },
                        { upsert: true },
                    );
                }

                return res.status(200).json({
                    success: true,
                });
            }

            //don't need to push comic for new device/browser case:
            if (!existingIdentifications) {
                await Subscriber.updateOne(
                    { userId },
                    {
                        userId,
                        $push: {
                            identifications: {
                                endpoint,
                                p256dh,
                                auth,
                            },
                        },
                    },
                    { upsert: true },
                );
            }

            return res.status(201).json({
                success: true,
            });
        },

        unsubscribe: async (
            req: Request,
            res: Response,
            next: NextFunction,
        ) => {
            const { comicId, userId } = req.body;

            //validate body
            if (!comicId || !userId) {
                return res.status(400).json({
                    success: false,
                    message: 'missing payload',
                });
            }

            const existingSubscriber = await Subscriber.findOne({
                userId,
                subComics: { $elemMatch: { $in: comicId } },
            });

            if (!existingSubscriber) {
                return res.status(404).json({
                    success: false,
                    message: 'can not found subscriber or comicId!',
                });
            }

            const { subComics } = existingSubscriber;
            existingSubscriber.subComics = subComics.filter(
                (comic) => comic !== comicId,
            );
            await existingSubscriber.save();

            return res.status(200).json({
                success: true,
            });
        },

        update: async (req: Request, res: Response, next: NextFunction) => {
            const subscribers = await Subscriber.find(
                {},
                { __v: 0, createdAt: 0, updatedAt: 0 },
            ).populate('subComics');

            const grouped = subscribers.reduce(
                (acc, current) => {
                    current.subComics.forEach((item) => {
                        if (
                            //@ts-ignore
                            !acc.find((i) => i?.comicId === String(item?._id))
                        ) {
                            acc.push({
                                //@ts-ignore
                                comicId: String(item?._id),
                                latestChapterTitle:
                                    //@ts-ignore
                                    item?.latestChapter?.chapterTitle,
                                subscriptions: [],
                            });
                        }
                    });

                    current.subComics.forEach((item) => {
                        const res = acc.find(
                            //@ts-ignore
                            (i) => i?.comicId === String(item?._id),
                        );
                        //@ts-ignore
                        res?.subscriptions.push(...current.identifications);
                    });

                    return acc;
                },
                [] as {
                    comicId: string;
                    latestChapterTitle: string;
                    subscriptions: Subscription[];
                }[],
            );

            await Promise.allSettled(
                grouped.map(async (item) => {
                    try {
                        const existingComic = await Nt.getLatestChapter(
                            item.comicId,
                        );

                        if (
                            existingComic.latestChapter?.chapterTitle !==
                            item.latestChapterTitle
                        ) {
                            await Comic.updateOne(
                                {
                                    _id: item.comicId,
                                },
                                {
                                    latestChapter: existingComic.latestChapter,
                                },
                            );

                            await Promise.allSettled(
                                item.subscriptions.map(async (sub) => {
                                    try {
                                        await webPush.sendNotification(
                                            {
                                                endpoint: sub.endpoint,
                                                keys: {
                                                    auth: sub.auth,
                                                    p256dh: sub.p256dh,
                                                },
                                            },
                                            JSON.stringify({
                                                title: `${existingComic?.title} đã có chap mới`,
                                                body: existingComic
                                                    .latestChapter
                                                    ?.chapterTitle,
                                                badge: 'https://res.cloudinary.com/lee1002/image/upload/v1658088029/personal/xykwxyxuhnmpg3nxgvrv.png',
                                                icon: 'https://res.cloudinary.com/lee1002/image/upload/v1658088029/personal/xykwxyxuhnmpg3nxgvrv.png',
                                                image: existingComic.cover,
                                                data: {
                                                    url: `https://kyotomanga.live/manga/details/${item.comicId}`,
                                                },
                                            }),
                                        );
                                    } catch (error: any) {
                                        if (
                                            error?.body?.includes('expire') ||
                                            error?.body?.includes('unsubscribe')
                                        ) {
                                            console.log(':: ', error);

                                            await Subscriber.deleteOne({
                                                identifications: {
                                                    $elemMatch: {
                                                        endpoint: sub?.endpoint,
                                                        p256dh: sub?.p256dh,
                                                        auth: sub?.auth,
                                                    },
                                                },
                                            });
                                        }
                                    }
                                }),
                            );
                        }
                    } catch (err) {
                        console.log(':: ', err);
                    }
                }),
            );

            return res.status(200).json({
                message: 'Ok',
            });
        },
    };
}
