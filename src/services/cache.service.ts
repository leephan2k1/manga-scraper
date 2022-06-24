import { redisHost, redisPassword, redisPort, redisUsername } from '../config';
import Redis from '../libs/Redis';

const cachingClient = Redis.Instance(
    redisPort,
    redisHost,
    redisUsername,
    redisPassword,
).getRedisClient();

export async function cache(
    key: string,
    value: string,
    page: number,
    expiredTime: number = 60, //60s, fallback
) {
    //just always storage page 1,2,3. Other pages just caching
    if (page === 1 || page === 2 || page === 3) {
        await cachingClient?.set(key, value);
    } else {
        await cachingClient?.setEx(key, expiredTime, value);
    }
}

export async function getCache(key: string) {
    return cachingClient.get(key);
}
