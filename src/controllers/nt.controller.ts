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

    const search = async (req: Request, res: Response, next: NextFunction) => {
        const { q, limit } = req.query;
        let { page } = req.query;

        const { mangaData, totalPages } = await Nt.searchQuery(String(q));

        if (!mangaData.length) {
            return res.status(401).json({ success: false });
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

    return { getCompletedManga, getNewManga, search };
}

export default ntController;
