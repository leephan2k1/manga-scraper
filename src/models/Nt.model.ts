import dotenv from 'dotenv';
dotenv.config();
import Scraper from '../libs/Scraper';
import { JSDOM } from 'jsdom';
import { AxiosRequestConfig } from 'axios';
import { NtDataList } from '../types/nt';
import { isExactMatch, normalizeString } from '../utils/stringHandler';
import { GENRES } from '../types/genres';
import { DEFAULT_EXPIRED_NEWMANGA_TIME } from '../constants/nt';

import Redis from '../libs/Redis';

const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisHost = process.env.REDIS_HOST || '127.0.0.1';

const cachingClient = Redis.Instance(redisPort, redisHost).getRedisClient();

interface QueryParams {
    sort?: number;
    status?: number;
    page?: number;
}

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
            const name = normalizeString(
                String(manga.querySelector('h3 a')?.innerHTML),
            );

            const tooltip = manga.querySelectorAll('.box_li .message_main p');
            let status: string | null = '';
            let author: string | null = '';
            let genres: string[] | null = [''];
            let otherName: string | null = '';
            tooltip.forEach((item) => {
                const title = item.querySelector('label')?.textContent;
                const str = normalizeString(
                    String(item.textContent).substring(
                        String(item.textContent).lastIndexOf(':') + 1,
                    ),
                );

                switch (title) {
                    case 'Thể loại:':
                        genres = str.split(', ');
                        break;
                    case 'Tác giả:':
                        author = str;
                        break;
                    case 'Tình trạng:':
                        status = str;
                        break;
                    case 'Tên khác:':
                        otherName = str;
                        break;
                }
            });

            const review = normalizeString(
                String(manga.querySelector('.box_li .box_text')?.textContent),
            );

            const path = String(
                manga.querySelector('h3 a')?.getAttribute('href'),
            );
            const slug = path.substring(path.lastIndexOf('/') + 1);

            return {
                status,
                author,
                genres,
                otherName,
                review,
                newChapter,
                thumbnail,
                view,
                name,
                updatedAt,
                slug,
            };
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

    public async getMangaAuthor(author: string) {
        const { data } = await this.client.get(`${this.baseUrl}/tim-truyen`, {
            params: { 'tac-gia': author },
        });
        const { window } = new JSDOM(data);
        const { document } = window;

        return this.parseSource(document);
    }

    public async searchParams(
        status: number,
        sort: number,
        genres?: string,
        page: number = 1,
    ) {
        const _genres = genres !== 'undefined' ? `/${genres}` : '';

        const queryParams = {
            status,
            sort,
            page,
        };

        console.log('page:: ', page);

        const key = `newManga?id=${_genres}${status}${sort}${page}`;

        const resultCache = await cachingClient.get(key);

        if (resultCache === 'null' || !resultCache) {
            console.log('cache miss');
            const { data } = await this.client.get(
                `${this.baseUrl}/tim-truyen${_genres}`,
                { params: queryParams },
            );
            const { window } = new JSDOM(data);
            const { document } = window;

            const { mangaData, totalPages } = this.parseSource(document);

            cachingClient.setEx(
                key,
                DEFAULT_EXPIRED_NEWMANGA_TIME,
                JSON.stringify({
                    mangaData,
                    totalPages,
                }),
            );

            return { mangaData, totalPages };
        } else {
            console.log('cache hit ');
            return JSON.parse(String(resultCache));
        }
    }

    public async filtersManga(
        genres: string | null,
        page?: number | null,
        sort?: number | null,
        status?: number | null,
    ) {
        const _genres = genres !== null ? `/${genres}` : '';

        const queryParams: QueryParams = {};

        if (sort) queryParams.sort = sort;
        if (status) queryParams.status = status;
        if (page) queryParams.page = page;

        // console.log('>>> ', queryParams);

        /*
        if all are null, default status: 'all', sort: 'new'
        see: https://www.nettruyenco.com/tim-truyen
        */

        const { data } = await this.client.get(
            `${this.baseUrl}/tim-truyen${_genres}`,
            { params: queryParams },
        );
        const { window } = new JSDOM(data);
        const { document } = window;

        return this.parseSource(document);
    }

    public async searchQuery(query: string) {
        const baseUrlSearch = `/Comic/Services/SuggestSearch.ashx`;
        const { data } = await this.client.get(
            `${this.baseUrl}${baseUrlSearch}`,
            { params: { q: query } },
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
        const { data } = await this.client.get(`${this.baseUrl}/truyen-full`, {
            params: { page: page },
        });
        const { window } = new JSDOM(data);
        const { document } = window;

        return this.parseSource(document);
    }

    public async getRanking(
        top: number,
        status: number = -1,
        page: number | undefined,
    ) {
        const queryParams = {
            status: status,
            sort: top,
            page: page,
        };

        // console.log('>>> ', queryParams);

        const { data } = await this.client.get(`${this.baseUrl}/tim-truyen`, {
            params: queryParams,
        });

        const { window } = new JSDOM(data);
        const { document } = window;

        return this.parseSource(document);
    }

    public async getMangaDetail(mangaSlug: string) {
        const baseUrlMangaDetail = 'truyen-tranh';

        const { data } = await this.client.get(
            `${this.baseUrl}/${baseUrlMangaDetail}/${mangaSlug}`,
        );
        const { window } = new JSDOM(data);
        const { document } = window;

        const rootSelector = '#item-detail';

        const title = normalizeString(
            String(document.querySelector(`${rootSelector} h1`)?.textContent),
        );
        const updatedAt = normalizeString(
            String(document.querySelector(`${rootSelector} time`)?.textContent),
        );
        const otherName = normalizeString(
            String(
                document.querySelector(
                    `${rootSelector} .detail-info .other-name`,
                )?.textContent,
            ),
        );

        const author = normalizeString(
            String(
                document.querySelectorAll(
                    `${rootSelector} .detail-info .author p`,
                )[1].textContent,
            ),
        );
        const status = normalizeString(
            String(
                document.querySelectorAll(
                    `${rootSelector} .detail-info .status p`,
                )[1].textContent,
            ),
        );
        const genresArrayRaw = document
            .querySelectorAll(`${rootSelector} .kind p`)[1]
            .querySelectorAll('a');
        const genres = [...genresArrayRaw].map((genre) => {
            const genreTitle = normalizeString(String(genre.textContent));
            const hrefString = String(genre.getAttribute('href'));
            const slug = hrefString.substring(hrefString.lastIndexOf('/') + 1);

            return { genreTitle, slug };
        });

        const lastChildUl = document.querySelectorAll(
            `${rootSelector} .detail-info .list-info .row`,
        )[4];
        const view = normalizeString(
            String(lastChildUl.querySelectorAll('p')[1].textContent),
        );
        const review = normalizeString(
            String(
                document.querySelector(`${rootSelector} .detail-content p`)
                    ?.textContent,
            ),
        );

        const chapterListRaw = document.querySelectorAll(
            `${rootSelector} #nt_listchapter ul .row`,
        );
        const chapterList = [...chapterListRaw].map((chapter) => {
            const chapterTitle = normalizeString(
                String(chapter.querySelector('a')?.textContent),
            );
            const chapterId = chapter
                .querySelector('a')
                ?.getAttribute('data-id');

            const updatedAt = normalizeString(
                String(chapter.querySelectorAll('div')[1].textContent),
            );

            const view = normalizeString(
                String(chapter.querySelectorAll('div')[2].textContent),
            );

            return { chapterId, chapterTitle, updatedAt, view };
        });

        return {
            title,
            updatedAt,
            otherName,
            author,
            status,
            genres,
            view,
            review,
            chapterList,
        };
    }

    public async getChapterSrc(
        mangaSlug: string,
        chapter: number,
        chapterId: string,
    ) {
        const { data } = await this.client.get(
            `${this.baseUrl}/truyen-tranh/${mangaSlug}/chap-${chapter}/${chapterId}`,
        );
        const { window } = new JSDOM(data);
        const { document } = window;
        const protocols = ['http', 'https'];

        const pagesRaw = document.querySelectorAll(
            '.reading-detail .page-chapter',
        );

        const pages = [...pagesRaw].map((page) => {
            const id = page.querySelector('img')?.dataset.index;

            const source = page.querySelector('img')?.dataset.original;
            const srcCDN = page.querySelector('img')?.dataset.cdn;

            const imgSrc = protocols.some((protocol) =>
                source?.includes(protocol),
            )
                ? source
                : `https:${source}`;
            const imgSrcCDN = protocols.some((protocol) =>
                srcCDN?.includes(protocol),
            )
                ? srcCDN
                : `https:${srcCDN}`;

            return { id, imgSrc, imgSrcCDN };
        });

        return pages;
    }

    // public async testModel() {
    //     const { data } = await this.client.get(`${this.baseUrl}/tim-truyen`);
    //     const { window } = new JSDOM(data);
    //     const { document } = window;

    //     const aTags = document.querySelectorAll(
    //         '.box.darkBox.genres .ModuleContent a',
    //     );

    //     const dataTest = [...aTags].map((a) => {
    //         const src = a.getAttribute('href');
    //         return String(src).substring(String(src).lastIndexOf('/') + 1);
    //     });

    //     return dataTest;
    // }
}
