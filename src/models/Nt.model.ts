import { AxiosRequestConfig } from 'axios';
import { parse } from 'node-html-parser';

import {
    DEFAULT_EXPIRED_ADVANCED_SEARCH_MANGA,
    DEFAULT_EXPIRED_COMPLETED_MANGA_TIME,
    DEFAULT_EXPIRED_NEW_UPDATED_MANGA_TIME,
    DEFAULT_EXPIRED_NEWMANGA_TIME,
    DEFAULT_EXPIRED_RANKING_MANGA_TIME,
    KEY_CACHE_ADVANCED_MANGA,
    KEY_CACHE_COMPLETED_MANGA,
    KEY_CACHE_FILTERS_MANGA,
    KEY_CACHE_NEW_MANGA,
    KEY_CACHE_NEW_UPDATED_MANGA,
    KEY_CACHE_RANKING_MANGA,
} from '../constants/nt';
import Scraper from '../libs/Scraper';
import { cache } from '../services/cache.service';
import { GENRES } from '../types/genres';
import { GENRES_NT, NtDataList } from '../types/nt';
import { isExactMatch, normalizeString } from '../utils/stringHandler';

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

    private parseSource(document: HTMLElement): NtDataList {
        const mangaList = document.querySelectorAll('.item');

        const mangaData = [...mangaList].map((manga) => {
            const thumbnail = this.unshiftProtocol(
                String(
                    manga.querySelector('img')?.getAttribute('data-original'),
                ) || String(manga.querySelector('img')?.getAttribute('src')),
            );

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
        const totalPages =
            Number(
                totalPagesPath
                    .substring(totalPagesPath.lastIndexOf('/') + 1)
                    .trim(),
            ) || 1;

        return { mangaData, totalPages };
    }

    private unshiftProtocol(urlSrc: string) {
        const protocols = ['http', 'https'];

        return protocols.some((protocol) => urlSrc.includes(protocol))
            ? urlSrc
            : `https:${urlSrc}`;
    }

    public async getMangaAuthor(author: string) {
        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/tim-truyen`,
                {
                    params: { 'tac-gia': author },
                },
            );
            const document = parse(data);

            //@ts-ignore
            return this.parseSource(document);
        } catch (err) {
            console.log(err);
            return { mangaData: [], totalPages: 0 };
        }
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

        const key = `${KEY_CACHE_NEW_MANGA}${_genres}${status}${sort}${page}`;

        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/tim-truyen${_genres}`,
                { params: queryParams },
            );
            const document = parse(data);

            //@ts-ignore
            const { mangaData, totalPages } = this.parseSource(document);

            await cache(
                key,
                JSON.stringify({ mangaData, totalPages }),
                page,
                DEFAULT_EXPIRED_NEWMANGA_TIME,
            );

            return { mangaData, totalPages };
        } catch (err) {
            console.log(err);
            return { mangaData: [], totalPages: 0 };
        }
    }

    public async advancedSearch(
        genres: string,
        minchapter: number,
        top: number,
        page: number,
        status: number,
        gender: number,
    ) {
        const key = `${KEY_CACHE_ADVANCED_MANGA}${genres}${minchapter}${top}${page}${status}${gender}`;

        // console.log(
        //     `genres: ${genres}, minchapter: ${minchapter}, top: ${top}, page: ${page}, status: ${status}, gender: ${gender}`,
        // );

        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/tim-truyen-nang-cao`,
                {
                    params: {
                        genres,
                        gender,
                        minchapter,
                        sort: top,
                        page,
                        status,
                    },
                },
            );

            const document = parse(data);

            //@ts-ignore
            const { mangaData, totalPages } = this.parseSource(document);

            // console.log(':: ', document.querySelector('ModuleContent'));

            await cache(
                key,
                JSON.stringify({ mangaData, totalPages }),
                page,
                DEFAULT_EXPIRED_ADVANCED_SEARCH_MANGA,
            );

            return { mangaData, totalPages };
        } catch (err) {
            console.log(err);
            return { mangaData: [], totalPages: 0 };
        }
    }

    public async getNewUpdatedManga(page: number = 1) {
        const queryParams = {
            page,
        };

        const key = `${KEY_CACHE_NEW_UPDATED_MANGA}${page}`;

        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/tim-truyen`,
                {
                    params: queryParams,
                },
            );
            const document = parse(data);

            //@ts-ignore
            const { mangaData, totalPages } = this.parseSource(document);

            await cache(
                key,
                JSON.stringify({ mangaData, totalPages }),
                page,
                DEFAULT_EXPIRED_NEW_UPDATED_MANGA_TIME,
            );

            return { mangaData, totalPages };
        } catch (error) {
            console.log(error);
            return { mangaData: [], totalPages: 0 };
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
        /*
        if all are null, default status: 'all', sort: 'new'
        see: https://www.nettruyenco.com/tim-truyen
        */
        if (sort) queryParams.sort = sort;
        if (status) queryParams.status = status;
        if (page) queryParams.page = page;

        let key: string = '';

        if (genres === 'manga-112' && sort) {
            key = `${KEY_CACHE_FILTERS_MANGA}${
                page !== undefined ? page : 1
            }${genres}${sort}`;
        }

        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/tim-truyen${_genres}`,
                { params: queryParams },
            );
            const document = parse(data);

            //@ts-ignore
            const { mangaData, totalPages } = this.parseSource(document);

            await cache(
                key,
                JSON.stringify({ mangaData, totalPages }),
                page ? page : 1,
                DEFAULT_EXPIRED_NEW_UPDATED_MANGA_TIME,
            );

            return { mangaData, totalPages };
        } catch (error) {
            console.log(error);
            return { mangaData: [], totalPages: 0 };
        }
    }

    public async searchQuery(query: string) {
        const baseUrlSearch = `/Comic/Services/SuggestSearch.ashx`;

        try {
            const { data } = await this.client.get(
                `${this.baseUrl}${baseUrlSearch}`,
                { params: { q: query } },
            );
            const document = parse(data);

            const protocols = ['http', 'https'];

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

                // const thumbnail = manga
                //     .querySelector('img')
                //     ?.getAttribute('src');
                const rawThumbnail = manga
                    .querySelector('img')
                    ?.getAttribute('src');

                const thumbnail = protocols.some((protocol) =>
                    String(rawThumbnail).includes(protocol),
                )
                    ? String(rawThumbnail)
                    : `https:${String(rawThumbnail)}`;

                const name = manga.querySelector('h3')?.innerHTML;
                const path = String(
                    manga.querySelector('a')?.getAttribute('href'),
                ).trim();
                const slug = path.substring(path.lastIndexOf('/') + 1);

                return { thumbnail, name, slug, newChapter, genres };
            });

            const totalPages = mangaData.length;

            return { mangaData, totalPages };
        } catch (err) {
            console.log(err);
            return { mangaData: [], totalPages: 0 };
        }
    }

    public async getCompletedManga(page: number = 1) {
        const key = `${KEY_CACHE_COMPLETED_MANGA}${page}`;

        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/truyen-full`,
                {
                    params: { page: page },
                },
            );
            const document = parse(data);

            //@ts-ignore
            const { mangaData, totalPages } = this.parseSource(document);

            await cache(
                key,
                JSON.stringify({ mangaData, totalPages }),
                page,
                DEFAULT_EXPIRED_COMPLETED_MANGA_TIME,
            );

            return { mangaData, totalPages };
        } catch (error) {
            console.log('::: ', error);
            return { mangaData: [], totalPages: 0 };
        }
    }

    public async getRanking(
        top: number,
        status: number = -1,
        page: number | undefined,
        genres: GENRES_NT | string,
    ) {
        const queryParams = {
            status: status,
            sort: top,
            page: page,
        };
        const key = `${KEY_CACHE_RANKING_MANGA}${
            page ? page : ''
        }${top}${status}${genres}`;

        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/tim-truyen${genres && `/${genres}`}`,
                {
                    params: queryParams,
                },
            );

            const document = parse(data);

            //@ts-ignore
            const { mangaData, totalPages } = this.parseSource(document);

            cache(
                key,
                JSON.stringify({ mangaData, totalPages }),
                page !== undefined ? page : 1,
                DEFAULT_EXPIRED_RANKING_MANGA_TIME,
            );

            return { mangaData, totalPages };
        } catch (err) {
            console.log(err);
            return { mangaData: [], totalPages: 0 };
        }
    }

    public async getMangaDetail(mangaSlug: string) {
        const baseUrlMangaDetail = 'truyen-tranh';

        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/${baseUrlMangaDetail}/${mangaSlug}`,
            );
            const document = parse(data);

            const rootSelector = '#item-detail';

            const title = normalizeString(
                String(
                    document.querySelector(`${rootSelector} h1`)?.textContent,
                ),
            );

            const updatedAt = normalizeString(
                String(
                    document.querySelector(`${rootSelector} time`)?.textContent,
                ),
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
                const slug = hrefString.substring(
                    hrefString.lastIndexOf('/') + 1,
                );

                return { genreTitle, slug };
            });

            const lastChildUl = document.querySelectorAll(
                `${rootSelector} .detail-info .list-info .row`,
            );
            const view = normalizeString(
                String(
                    lastChildUl[lastChildUl.length - 1].querySelectorAll('p')[1]
                        .textContent,
                ),
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

                const arr = String(
                    chapter.querySelector('a')?.getAttribute('href'),
                ).split('/');

                const chapterStr = arr[arr.length - 2];

                const chapterNumber = chapterStr.slice(
                    chapterStr.indexOf('-') + 1,
                );

                const updatedAt = normalizeString(
                    String(chapter.querySelectorAll('div')[1].textContent),
                );

                const view = normalizeString(
                    String(chapter.querySelectorAll('div')[2].textContent),
                );

                return {
                    chapterId,
                    chapterNumber,
                    chapterTitle,
                    updatedAt,
                    view,
                };
            });

            const thumbnail = this.unshiftProtocol(
                String(
                    document
                        .querySelector(`${rootSelector} .col-image img`)
                        ?.getAttribute('src'),
                ),
            );

            return {
                title,
                updatedAt,
                thumbnail,
                otherName,
                author,
                status,
                genres,
                view,
                review,
                chapterList,
            };
        } catch (error) {
            // console.log(error);
            return {
                title: '',
                updatedAt: '',
                otherName: '',
                author: '',
                status: '',
                genres: '',
                view: '',
                review: '',
                chapterList: '',
            };
        }
    }

    public async getChapterSrc(
        mangaSlug: string,
        chapter: number,
        chapterId: string,
    ) {
        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/truyen-tranh/${mangaSlug}/chap-${chapter}/${chapterId}`,
            );
            const document = parse(data);

            //@ts-ignore

            const protocols = ['http', 'https'];

            const pagesRaw = document.querySelectorAll(
                '.reading-detail .page-chapter',
            );

            const pages = [...pagesRaw].map((page) => {
                const id = page
                    .querySelector('img')
                    ?.getAttribute('data-index');

                const source = page
                    .querySelector('img')
                    ?.getAttribute('data-original');
                const srcCDN = page
                    .querySelector('img')
                    ?.getAttribute('data-cdn');

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
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    // public async testModel() {
    //     const { data } = await this.client.get(
    //         `${this.baseUrl}/tim-truyen-nang-cao`,
    //     );
    //     const document = parse(data);

    //     const form = document.querySelectorAll(
    //         '.advsearch-form .form-group',
    //     )[1];

    //     const items = form?.querySelectorAll('.genre-item');

    //     if (items) {
    //         const dataTest = [...items].map((item) => {
    //             const title = normalizeString(String(item.textContent));
    //             const id = item.querySelector('span')?.getAttribute('data-id');

    //             return { title, id };
    //         });

    //         return dataTest;
    //     }
    // }
}
