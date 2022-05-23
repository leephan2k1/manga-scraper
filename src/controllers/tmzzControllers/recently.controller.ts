import { Request, Response, NextFunction } from 'express';

const getManga = async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ data: 'recently tmzz' });
};

export default getManga;
