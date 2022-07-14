import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import logger from 'morgan';

import { ErrorType } from '@/types/http';

import route from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

//remove this if you don't need to protect your host
const whitelist = ['http://localhost:3000', 'https://kyotomanga.live'];
//and this
const corsOptions: CorsOptions = {
    origin: whitelist,
    preflightContinue: false,
};

//apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger('dev'));

//router
route(app);

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ success: true });
});

//catch 404
app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404, '404 Not Found!'));
});

//error handler
app.use((err: ErrorType, req: Request, res: Response, next: NextFunction) => {
    const error: ErrorType =
        app.get('env') === 'development' ? err : ({} as ErrorType);
    const status: number = err.status || 500;

    console.log(
        `${req.url} --- ${req.method} --- ${JSON.stringify({
            message: error.message,
        })}`,
    );
    return res.status(status).json({
        status,
        message: error.message,
    });
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at ${port}`);
});
