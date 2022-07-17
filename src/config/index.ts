import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

export const redisPort = Number(process.env.REDIS_PORT) || 6379;
export const redisHost = process.env.REDIS_HOST || '127.0.0.1';
export const redisUsername = String(process.env.REDIS_USER_NAME) || 'default';
export const redisPassword = String(process.env.REDIS_PASSWORD) || '';

//web push config:
export const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string;
export const privateVapidKey = process.env.SECRET_VAPID_KEY as string;

const mongodbUri = process.env.MONGODB_URI as string;

export async function connectDb() {
    try {
        await mongoose.connect(mongodbUri);
        console.log('connect success!');
    } catch (err) {
        console.error(err);
    }
}
