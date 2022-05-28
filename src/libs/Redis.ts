import { createClient, RedisClientType } from 'redis';

export default class Redis {
    port: number;
    host: string;
    client: RedisClientType;

    private static instance: Redis;

    private constructor(port: number, host: string) {
        this.port = port;
        this.host = host;

        this.client = createClient({
            socket: {
                port: this.port,
                host: this.host,
            },
        });

        this.client.on('error', (err) =>
            console.log('Redis Client Error', err),
        );

        this.connect();
    }

    private async connect() {
        try {
            await this.client.connect();
        } catch (err) {
            console.log(err);
        }
    }

    public static Instance(port: number, host: string) {
        if (!this.instance) {
            this.instance = new this(port, host);
        }

        return this.instance;
    }

    public getRedisClient() {
        return this.client;
    }
}
