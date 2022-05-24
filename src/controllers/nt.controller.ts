import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import NtModel from '../models/Nt.model';

const baseUrl = process.env.NT_SOURCE_URL as string;
const Nt = NtModel.Instance(baseUrl);

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
            return res.status(401).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: mangaData,
            totalPages,
            hasPrevPage: Number(page) > 1 ? true : false,
            hasNextPage: Number(page) < Number(totalPages) ? true : false,
        });
    };

    return { getCompletedManga };
}

export default ntController;
