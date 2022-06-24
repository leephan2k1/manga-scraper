import { NextFunction, Request, Response } from 'express';

import { getCache } from '../services/cache.service';

import {
    KEY_CACHE_ADVANCED_MANGA,
    KEY_CACHE_COMPLETED_MANGA,
    KEY_CACHE_FILTERS_MANGA,
    KEY_CACHE_NEW_MANGA,
    KEY_CACHE_NEW_UPDATED_MANGA,
    KEY_CACHE_RANKING_MANGA,
} from '../constants/nt';
import NtModel from '../models/Nt.model';
import { GENRES_NT, MANGA_SORT, MANGA_STATUS } from '../types/nt';

const baseUrl = process.env.NT_SOURCE_URL as string;
const Nt = NtModel.Instance(baseUrl);

interface RankingQuery {
    top: 'all' | 'month' | 'week' | 'day' | 'chapter' | undefined;
    page?: number;
    status?: 'all' | 'completed' | 'ongoing' | undefined;
    genres?: GENRES_NT;
}

interface SearchQuery extends Pick<RankingQuery, 'page'> {
    q: string;
    limit?: number;
}

interface AdvancedSearchQuery
    extends Pick<RankingQuery, 'top' | 'page' | 'status'> {
    minchapter: number;
    genres: string;
    gender: number;
}

interface AuthorQuery {
    name: string;
}

interface NewMangaQuery extends Pick<RankingQuery, 'page'> {
    genres: string;
}

interface FiltersManga extends Partial<RankingQuery> {}

interface MangaParams {
    mangaSlug: string;
}

interface ChapterParams extends MangaParams {
    chapter: number;
    chapterId: string;
}

function ntController() {
    // const testRoute = async (
    //     req: Request,
    //     res: Response,
    //     next: NextFunction,
    // ) => {
    //     const dataTest = await Nt.testModel();

    //     return res.status(200).json({
    //         data: dataTest,
    //     });
    // };

    const advancedSearch = async (
        req: Request<{}, {}, {}, AdvancedSearchQuery>,
        res: Response,
        next: NextFunction,
    ) => {
        const { genres, minchapter, top, page, status, gender } = req.query;

        const _genres = genres ? genres : '';
        const _gender = gender ? gender : -1;
        const _status = status ? MANGA_STATUS[status] : -1;
        const _top = top ? MANGA_SORT[top] : 0;
        const _minChapter = minchapter ? minchapter : 1;
        const _page = page ? page : 1;

        const key = `${KEY_CACHE_ADVANCED_MANGA}${_genres}${_minChapter}${_top}${_page}${_status}${_gender}`;

        const redisData = await getCache(key);

        if (!redisData) {
            const { mangaData, totalPages } = await Nt.advancedSearch(
                _genres,
                _minChapter,
                _top,
                _page,
                _status,
                _gender,
            );

            if (!mangaData.length) {
                return res.status(404).json({ success: false });
            }

            return res.status(200).json({
                success: true,
                data: mangaData,
                totalPages,
                hasPrevPage: Number(page) > 1 ? true : false,
                hasNextPage: Number(page) < Number(totalPages) ? true : false,
            });
        }

        const { mangaData, totalPages } = JSON.parse(String(redisData));

        if (!mangaData.length) return res.status(404).json({ success: false });

        return res.status(200).json({
            success: true,
            data: mangaData,
            totalPages: totalPages,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage: Number(page) < Number(totalPages) ? true : false,
        });
    };

    const getNewUpdatedManga = async (
        req: Request<{}, {}, {}, Pick<RankingQuery, 'page'>>,
        res: Response,
        next: NextFunction,
    ) => {
        const { page } = req.query;
        const _page = page !== undefined ? page : 1;

        const key = `${KEY_CACHE_NEW_UPDATED_MANGA}${_page}`;

        const redisData = await getCache(key);

        if (!redisData) {
            const { mangaData, totalPages } = await Nt.getNewUpdatedManga(
                _page,
            );

            if (!mangaData.length) {
                return res.status(404).json({ success: false });
            }

            return res.status(200).json({
                success: true,
                data: mangaData,
                totalPages,
                hasPrevPage: Number(page) > 1 ? true : false,
                hasNextPage: Number(page) < Number(totalPages) ? true : false,
            });
        }

        const { mangaData, totalPages } = JSON.parse(String(redisData));

        if (!mangaData.length) return res.status(404).json({ success: false });

        return res.status(200).json({
            success: true,
            data: mangaData,
            totalPages: totalPages,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage: Number(page) < Number(totalPages) ? true : false,
        });
    };

    const filtersManga = async (
        req: Request<{}, {}, {}, FiltersManga>,
        res: Response,
        next: NextFunction,
    ) => {
        const { page, genres, top, status } = req.query;
        let key: string = '';

        //cache data for home page:::
        if (genres === 'manga-112' && top) {
            key = `${KEY_CACHE_FILTERS_MANGA}${
                page !== undefined ? page : 1
            }${genres}${MANGA_SORT[top]}`;
        }

        const redisData = await getCache(key);

        if (!redisData) {
            const { mangaData, totalPages } = await Nt.filtersManga(
                genres !== undefined ? genres : null,
                page !== undefined ? page : null,
                top !== undefined ? MANGA_SORT[top] : null,
                status !== undefined ? MANGA_STATUS[status] : -1,
            );

            if (!mangaData.length) {
                return res.status(404).json({ success: false });
            }

            return res.status(200).json({
                success: true,
                data: mangaData,
                totalPages,
                hasPrevPage: Number(page) > 1 ? true : false,
                hasNextPage: Number(page) < Number(totalPages) ? true : false,
            });
        }

        const { mangaData, totalPages } = JSON.parse(String(redisData));

        if (!mangaData.length) return res.status(404).json({ success: false });

        return res.status(200).json({
            success: true,
            data: mangaData,
            totalPages: totalPages,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage: Number(page) < Number(totalPages) ? true : false,
        });
    };

    const getCompletedManga = async (
        req: Request<{}, {}, {}, Pick<NewMangaQuery, 'page'>>,
        res: Response,
        next: NextFunction,
    ) => {
        const { page } = req.query;

        const key = `${KEY_CACHE_COMPLETED_MANGA}${
            page !== undefined ? page : 1
        }`;

        const redisData = await getCache(key);

        if (!redisData) {
            console.log('cache miss');
            const { mangaData, totalPages } = await Nt.getCompletedManga(
                Number(page),
            );

            if (!mangaData.length) {
                return res.status(404).json({ success: false });
            }

            return res.status(200).json({
                success: true,
                data: mangaData,
                totalPages,
                hasPrevPage: Number(page) > 1 ? true : false,
                hasNextPage: Number(page) < Number(totalPages) ? true : false,
            });
        }
        console.log('cache hit');
        const { mangaData, totalPages } = JSON.parse(String(redisData));

        if (!mangaData.length) return res.status(404).json({ success: false });

        return res.status(200).json({
            success: true,
            data: mangaData,
            totalPages: totalPages,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage: Number(page) < Number(totalPages) ? true : false,
        });
    };

    const getNewManga = async (
        req: Request<{}, {}, {}, NewMangaQuery>,
        res: Response,
        next: NextFunction,
    ) => {
        const { page, genres } = req.query;
        const _genres = genres !== undefined ? `/${genres}` : '';

        const key = `${KEY_CACHE_NEW_MANGA}${_genres}${-1}${15}${
            page !== undefined ? page : 1
        }`;

        const redisData = await getCache(key);

        if (!redisData) {
            const { mangaData, totalPages } = await Nt.searchParams(
                -1,
                15,
                String(genres),
                page,
            );

            if (!mangaData.length)
                return res.status(404).json({ success: false });

            return res.status(200).json({
                success: true,
                data: mangaData,
                totalPages: totalPages,
                hasPrevPage: Number(page) > 1 ? true : false,
                hasNextPage: Number(page) < Number(totalPages) ? true : false,
            });
        }

        const { mangaData, totalPages } = JSON.parse(String(redisData));

        if (!mangaData.length) return res.status(404).json({ success: false });

        return res.status(200).json({
            success: true,
            data: mangaData,
            totalPages: totalPages,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage: Number(page) < Number(totalPages) ? true : false,
        });
    };

    const getRanking = async (
        req: Request<{}, {}, {}, RankingQuery>,
        res: Response,
        next: NextFunction,
    ) => {
        const { top, page, status, genres } = req.query;

        //nettruyen config: https://www.nettruyenco.com/tim-truyen?status=-1&sort=10

        const key = `${KEY_CACHE_RANKING_MANGA}${page ? page : ''}${
            top ? MANGA_SORT[top] : 10
        }${status ? MANGA_STATUS[status] : -1}${genres ? genres : ''}`;

        const redisData = await getCache(key);

        if (!redisData) {
            const { mangaData, totalPages } = await Nt.getRanking(
                top ? MANGA_SORT[top] : 10,
                status ? MANGA_STATUS[status] : -1,
                page ? page : undefined,
                genres ? genres : '',
            );

            if (!mangaData.length) {
                return res.status(404).json({ success: false });
            }

            return res.status(200).json({
                success: true,
                data: mangaData,
                hasPrevPage: Number(page) > 1 ? true : false,
                hasNextPage: Number(page) < Number(totalPages) ? true : false,
            });
        }

        const { mangaData, totalPages } = JSON.parse(redisData);

        if (!mangaData.length) {
            return res.status(404).json({ success: false });
        }

        return res.status(200).json({
            success: true,
            data: mangaData,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage: Number(page) < Number(totalPages) ? true : false,
        });
    };

    const search = async (
        req: Request<{}, {}, {}, SearchQuery>,
        res: Response,
        next: NextFunction,
    ) => {
        const { q, limit } = req.query;
        let { page } = req.query;

        const { mangaData, totalPages } = await Nt.searchQuery(String(q));

        if (!mangaData.length) {
            return res.status(404).json({ success: false });
        }

        let _mangaData = [...mangaData];
        let hasNextPage = false;
        if (limit) {
            if (!page) page = 1;

            _mangaData = _mangaData.slice(
                (Number(page) - 1) * Number(limit),
                Number(limit) * Number(page),
            );
            if (mangaData[Number(limit) * Number(page)]) {
                hasNextPage = true;
            }
        }

        res.status(200).json({
            success: true,
            data: _mangaData,
            totalPages,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage,
        });
    };

    const getManga = async (
        req: Request<MangaParams>,
        res: Response,
        next: NextFunction,
    ) => {
        const { mangaSlug } = req.params;

        const {
            title,
            updatedAt,
            thumbnail,
            otherName,
            author,
            status,
            genres,
            view,
            review,
            chapterList,
        } = await Nt.getMangaDetail(String(mangaSlug));

        // if (!title.length) return res.status(404).json({ sucess: false });

        res.status(200).json({
            success: true,
            data: {
                title,
                updatedAt,
                otherName,
                thumbnail,
                author,
                status,
                genres,
                view,
                review,
                chapterList,
            },
        });
    };

    const getChapter = async (
        req: Request<ChapterParams>,
        res: Response,
        next: NextFunction,
    ) => {
        const { mangaSlug, chapter, chapterId } = req.params;

        const chapterSrc = await Nt.getChapterSrc(
            String(mangaSlug),
            Number(chapter),
            String(chapterId),
        );

        if (!chapterSrc) return res.status(404).json({ success: false });

        res.json({
            success: true,
            data: chapterSrc,
        });
    };

    const getMangaAuthor = async (
        req: Request<{}, {}, {}, AuthorQuery>,
        res: Response,
        next: NextFunction,
    ) => {
        const { name } = req.query;

        const { mangaData, totalPages } = await Nt.getMangaAuthor(name.trim());

        if (!mangaData.length) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: mangaData,
            totalPages,
        });
    };

    return {
        getCompletedManga,
        getNewManga,
        getMangaAuthor,
        search,
        getManga,
        getChapter,
        getRanking,
        filtersManga,
        getNewUpdatedManga,
        advancedSearch,
    };
}

export default ntController;
