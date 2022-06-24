import Scraper from '../libs/Scraper';
import { parse } from 'node-html-parser';
import { AxiosRequestConfig } from 'axios';
import { MangaTmzzSection } from '../types/tmzz';

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

    public async getNewManga(Section: MangaTmzzSection) {
        const { data } = await this.client.get(this.baseUrl);

        const document = parse(data);

        const mangaList = document.querySelectorAll('.manga-list');
        const newMangaDOM = mangaList[Section].querySelectorAll('li');

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
}
