import { Request, Response, NextFunction } from 'express';

export const getManga = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.status(200).json({ data: 'recently manga' });
};
