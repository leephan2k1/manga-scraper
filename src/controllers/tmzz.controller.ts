import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import TmzzModel from '../models/Tmzz.model';
import { MangaTmzzSection } from '../types/tmzz';

const baseUrl = process.env.TMZZ_SOURCE_URL as string;
const Tmzz = TmzzModel.Instance(baseUrl);

function tmzzController() {
    const getNewManga = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const manga = await Tmzz.getNewManga(MangaTmzzSection.NewManga);

        res.status(200).json({ data: manga });
    };

    const getNewMangaUpdated = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const manga = await Tmzz.getNewManga(MangaTmzzSection.NewMangaUpdated);

        return res.status(200).json({ data: manga });
    };

    return { getNewManga, getNewMangaUpdated };
}

export default tmzzController;
