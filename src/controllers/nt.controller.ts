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

interface SearchQuery extends Pick<RankingQuery, 'page'> {
    q: string;
    limit?: number;
}

interface AuthorQuery {
    name: string;
}

interface NewMangaQuery extends Pick<RankingQuery, 'page'> {
    genres: string;
}

interface FiltersManga extends Partial<RankingQuery> {
    genres?: string;
}

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

    const filtersManga = async (
        req: Request<{}, {}, {}, FiltersManga>,
        res: Response,
        next: NextFunction,
    ) => {
        const { page, genres, top, status } = req.query;

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
    };

    const getCompletedManga = async (
        req: Request<{}, {}, {}, Pick<NewMangaQuery, 'page'>>,
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
        req: Request<{}, {}, {}, NewMangaQuery>,
        res: Response,
        next: NextFunction,
    ) => {
        const { page, genres } = req.query;

        const { mangaData, totalPages } = await Nt.searchParams(
            -1,
            15,
            String(genres),
        );

        res.status(200).json({
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
        const { top, page, status } = req.query;

        //nettruyen config: https://www.nettruyenco.com/tim-truyen?status=-1&sort=10

        const { mangaData, totalPages } = await Nt.getRanking(
            top !== undefined ? MANGA_SORT[top] : 10,
            status !== undefined ? MANGA_STATUS[status] : -1,
            page !== undefined ? page : undefined,
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
    };
}

export default ntController;
