import Scraper from '../libs/Scraper';
import { JSDOM } from 'jsdom';
import { AxiosRequestConfig } from 'axios';

export default class NtModel extends Scraper {
    private static instance: NtModel;

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

    public async getNewManga() {
        const { data } = await this.client.get(this.baseUrl);
        const { window } = new JSDOM(data);
        const { document } = window;

        const mangaList = document.querySelectorAll('.manga-list');
        const newMangaDOM = mangaList[1].querySelectorAll('li');

        const newMangaData = [...newMangaDOM].map((manga) => {
            const newChapter = manga.querySelector('strong')?.innerHTML;
            const thumbnail = manga.querySelector('img')?.getAttribute('src');
            const view = manga.querySelector('.view-count span')?.innerHTML;
            const name = String(manga.querySelector('h4')?.innerHTML).replace(
                /(\r\n|\n|\r)/gm,
                '',
            );
            const updatedAt =
                manga.querySelector('.manga-meta span')?.innerHTML;
            const path = String(manga.querySelector('a')?.getAttribute('href'));
            const slug = path.substring(path.lastIndexOf('/') + 1);

            return { newChapter, thumbnail, view, name, updatedAt, slug };
        });

        return newMangaData;
    }

    public async getCompletedManga(page: number = 1) {
        const { data } = await this.client.get(
            `${this.baseUrl}/truyen-full?page=${page}`,
        );
        const { window } = new JSDOM(data);
        const { document } = window;

        const mangaList = document.querySelectorAll('.ModuleContent .item');

        const mangaData = [...mangaList].map((manga) => {
            const thumbnail = manga.querySelector('img')?.getAttribute('src');
            const newChapter = manga.querySelector('ul > li > a')?.innerHTML;
            const updatedAt = manga.querySelector('ul > li > i')?.innerHTML;
            const view = manga.querySelector('pull-left > i')?.innerHTML;
            const name = String(manga.querySelector('h3 a')?.innerHTML).replace(
                /(\r\n|\n|\r)/gm,
                '',
            );
            const path = String(
                manga.querySelector('h3 a')?.getAttribute('href'),
            );
            const slug = path.substring(path.lastIndexOf('/') + 1);

            return { newChapter, thumbnail, view, name, updatedAt, slug };
        });

        const totalPagesPath = String(
            document.querySelector('.pagination > li')?.innerHTML,
        ).trim();
        const totalPages = Number(
            totalPagesPath
                .substring(totalPagesPath.lastIndexOf('/') + 1)
                .trim(),
        );

        return { mangaData, totalPages };
    }
}
