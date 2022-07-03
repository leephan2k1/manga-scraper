import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import lhModel from '../models/Lh.model';

const baseUrl = process.env.LH_SOURCE_URL as string;
const Lh = lhModel.Instance(baseUrl);

interface QuerySearch {
    q: string;
}

interface QueryManga {
    limit: string;
}

interface ChaptersParams {
    mangaSlug: string;
    chapterId: string;
}

function lhController() {
    const searchManga = async (
        req: Request<{}, {}, {}, QuerySearch>,
        res: Response,
    ) => {
        const { q } = req.query;
        const manga = await Lh.search(q);

        if (!manga) return res.status(404).json({ message: 'error' });

        res.status(200).json({ data: manga });
    };

    const getChapters = async (req: Request<ChaptersParams>, res: Response) => {
        const { mangaSlug, chapterId } = req.params;
        const manga = await Lh.getChapters(mangaSlug, chapterId);

        if (!manga) return res.status(404).json({ message: 'error' });

        res.status(200).json({ success: true, data: manga });
    };

    const getManga = async (
        req: Request<Pick<ChaptersParams, 'mangaSlug'>, {}, {}, QueryManga>,
        res: Response,
    ) => {
        const { mangaSlug } = req.params;
        const { limit } = req.query;
        const manga = await Lh.getComic(mangaSlug, +limit);

        if (!manga) return res.status(404).json({ message: 'error get manga' });

        res.status(200).json({ success: true, data: manga });
    };

    return { searchManga, getChapters, getManga };
}

export default lhController;
