import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

function proxyController() {
    const corsAnywhere = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { src, url } = req.query;

        const options = {
            responseType: 'stream',
            headers: {
                referer: String(url),
            },
        } as const;

        const response = await axios.get(String(src), options);

        return response.data.pipe(res);
    };

    return { corsAnywhere };
}

export default proxyController;
