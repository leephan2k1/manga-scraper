import dotenv from 'dotenv';
dotenv.config();

export const redisPort = Number(process.env.REDIS_PORT) || 6379;
export const redisHost = process.env.REDIS_HOST || '127.0.0.1';
export const redisUsername = String(process.env.REDIS_USER_NAME) || 'default';
export const redisPassword = String(process.env.REDIS_PASSWORD) || '';
