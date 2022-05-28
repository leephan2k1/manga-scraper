import express, { Request, Response, NextFunction } from 'express';
import { ErrorType } from '@/types/http';
import dotenv from 'dotenv';
import cors from 'cors';
import createError from 'http-errors';
import route from './routes';
import logger from 'morgan';
import tasks from './services/cron.service';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

//apply middleware
app.use(cors());
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

tasks.forEach((task) => task.start());
