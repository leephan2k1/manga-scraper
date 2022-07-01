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

    public async getChapters(mangaSlug: string, chapterId: string) {
        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/truyen-tranh/${mangaSlug}/${chapterId}`,
            );

            const document = parse(data);

            const imagesList = document.querySelectorAll(
                '#chapter-content img',
            );

            const images = Array.from(imagesList).map((imageItem, index) => {
                const imgSrc = imageItem.getAttribute('data-src')?.trim();
                const imgSrcCDN = imageItem.getAttribute('src')?.trim();

                return {
                    id: index,
                    imgSrc,
                    imgSrcCDN,
                };
            });

            return images;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
