import Scraper from '../libs/Scraper';
import { parse } from 'node-html-parser';
import { AxiosRequestConfig } from 'axios';

export default class TmzzModel extends Scraper {
    private static instance: TmzzModel;

    private constructor(
        baseUrl: string,
        axiosConfig?: AxiosRequestConfig,
        timeout?: number,
    ) {
        super(baseUrl, axiosConfig, timeout);
    }

    public static Instance(
        baseUrl: string,
        axiosConfig?: AxiosRequestConfig,
        timeout?: number,
    ) {
        if (!this.instance) {
            this.instance = new this(baseUrl, axiosConfig, timeout);
        }

        return this.instance;
    }

    public async search(q: string) {
        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/action/search`,
                {
                    params: {
                        q,
                    },
                },
            );

            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async getManga(slug: string) {
        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/truyen-tranh/${slug}`,
            );

            const document = parse(data);

            const chapterList = document.querySelector('.list-chapters');

            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
