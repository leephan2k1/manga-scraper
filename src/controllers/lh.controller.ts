import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import lhModel from '../models/Lh.model';

const baseUrl = process.env.LH_SOURCE_URL as string;
const Lh = lhModel.Instance(baseUrl);

interface QuerySearch {
    q: string;
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

    return { searchManga, getChapters };
}

export default lhController;
