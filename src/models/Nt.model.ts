import Scraper from '../libs/Scraper';
import { JSDOM } from 'jsdom';
import { AxiosRequestConfig } from 'axios';
import { NtDataList } from '../types/nt';
import { isExactMatch } from '../utils/stringHandler';
import { GENRES } from '../types/genres';

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

    private parseSource(document: Document): NtDataList {
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

    public async searchParams(
        status: number,
        sort: number,
        genres?: string,
        page: number = 1,
    ) {
        const _genres = genres !== 'undefined' ? `/${genres}` : '';

        const { data } = await this.client.get(
            `${this.baseUrl}/tim-truyen${_genres}?status=${status}&sort=${sort}&page=${page}`,
        );
        const { window } = new JSDOM(data);
        const { document } = window;

        return this.parseSource(document);
    }

    public async searchQuery(query: string) {
        const baseUrlSearch = `/Comic/Services/SuggestSearch.ashx?q=${encodeURIComponent(
            query,
        )}`;
        const { data } = await this.client.get(
            `${this.baseUrl}${baseUrlSearch}`,
        );
        const { window } = new JSDOM(data);
        const { document } = window;

        const searchResultList = document.querySelectorAll('li');
        const mangaData = [...searchResultList].map((manga) => {
            const iTagList = manga.querySelectorAll('h4 i');
            const newChapter = iTagList[0].innerHTML;

            const genres = GENRES.filter((genre) => {
                let flag = false;

                iTagList.forEach((tag) => {
                    const str = String(tag.innerHTML);
                    if (isExactMatch(str, genre)) {
                        flag = true;
                        return;
                    }
                });

                if (flag) return genre;
            });

            const thumbnail = manga.querySelector('img')?.getAttribute('src');
            const name = manga.querySelector('h3')?.innerHTML;
            const path = String(
                manga.querySelector('a')?.getAttribute('href'),
            ).trim();
            const slug = path.substring(path.lastIndexOf('/') + 1);

            return { thumbnail, name, slug, newChapter, genres };
        });

        const totalPages = mangaData.length;

        return { mangaData, totalPages };
    }

    public async getCompletedManga(page: number = 1) {
        const { data } = await this.client.get(
            `${this.baseUrl}/truyen-full?page=${page}`,
        );
        const { window } = new JSDOM(data);
        const { document } = window;

        return this.parseSource(document);
    }
}
