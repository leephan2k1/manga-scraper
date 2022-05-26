import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import NtModel from '../models/Nt.model';
import { MANGA_SORT, MANGA_STATUS } from '../types/nt';

const baseUrl = process.env.NT_SOURCE_URL as string;
const Nt = NtModel.Instance(baseUrl);

interface RankingQuery {
    top: 'all' | 'month' | 'week' | 'day' | 'chapter' | undefined;
    page?: number;
    status?: 'all' | 'completed' | 'ongoing' | undefined;
}

interface AuthorQuery {
    name: string;
}

function ntController() {
    const getCompletedManga = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { page } = req.query;

        const { mangaData, totalPages } = await Nt.getCompletedManga(
            Number(page),
        );

        if (!mangaData.length) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: mangaData,
            totalPages,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage: Number(page) < Number(totalPages) ? true : false,
        });
    };

    const getNewManga = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { page, genres } = req.query;

        const { mangaData, totalPages } = await Nt.searchParams(
            -1,
            15,
            String(genres),
        );

        if (!mangaData.length) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: mangaData,
            totalPages,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage: Number(page) < Number(totalPages) ? true : false,
        });
    };

    const getRanking = async (
        req: Request<{}, {}, {}, RankingQuery>,
        res: Response,
        next: NextFunction,
    ) => {
        const { top, page, status } = req.query;

        //nettruyen config: https://www.nettruyenco.com/tim-truyen?status=-1&sort=10

        const { mangaData, totalPages } = await Nt.gerRanking(
            top !== undefined ? MANGA_SORT[top] : 10,
            status !== undefined ? MANGA_STATUS[status] : -1,
            page !== undefined ? page : 1,
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
    };

    const search = async (req: Request, res: Response, next: NextFunction) => {
        const { q, limit } = req.query;
        let { page } = req.query;

        const { mangaData, totalPages } = await Nt.searchQuery(String(q));

        if (!mangaData.length) {
            return res.status(404).json({ success: false });
        }

        let _mangaData = [...mangaData];
        let hasNextPage = false;
        if (limit) {
            if (!page) page = '1';

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
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage,
        });
    };

    const getManga = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { mangaSlug } = req.params;

        const {
            title,
            updatedAt,
            otherName,
            author,
            status,
            genres,
            view,
            review,
            chapterList,
        } = await Nt.getMangaDetail(String(mangaSlug));

        res.status(200).json({
            success: true,
            data: {
                title,
                updatedAt,
                otherName,
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
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { mangaSlug, chapter, chapterId } = req.params;

        const chapterSrc = await Nt.getChapterSrc(
            String(mangaSlug),
            Number(chapter),
            String(chapterId),
        );

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

        const { mangaData, totalPages } = await Nt.getMangaAuthor(
            name.trim().replace(/\s/g, '+'),
        );

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
    };
}

export default ntController;
