export interface MangaPreview {
    newChapter: string | undefined;
    thumbnail: string | null | undefined;
    view: string | undefined;
    name: string;
    updatedAt: string | undefined;
    slug: string;
    status: string | null;
    author: string | null;
    genres: string[] | null;
    otherName?: string | null;
    review: string | null;
}

//nettruyen config: https://www.nettruyenco.com/tim-truyen?status=-1&sort=10
export enum MANGA_STATUS {
    'all' = -1,
    'completed' = 2,
    'ongoing' = 1,
}
//nettruyen config: https://www.nettruyenco.com/tim-truyen?status=-1&sort=10
export enum MANGA_SORT {
    'all' = 10,
    'month',
    'week',
    'day',
    'new' = 15,
    'chapter' = 30,
}

export interface NtDataList {
    mangaData: MangaPreview[];
    totalPages: number;
}

export type GENRES_NT =
    | 'action'
    | 'truong-thanh'
    | 'adventure'
    | 'anime'
    | 'chuyen-sinh-213'
    | 'comedy-99'
    | 'comic'
    | 'cooking'
    | 'co-dai-207'
    | 'doujinshi'
    | 'drama-103'
    | 'dam-my'
    | 'ecchi'
    | 'fantasy-105'
    | 'gender-bender'
    | 'harem-107'
    | 'historical'
    | 'horror'
    | 'josei'
    | 'live-action'
    | 'manga-112'
    | 'manhua'
    | 'manhwa-11400'
    | 'martial-arts'
    | 'mature'
    | 'mecha-117'
    | 'mystery'
    | 'ngon-tinh'
    | 'one-shot'
    | 'psychological'
    | 'romance-121'
    | 'school-life'
    | 'sci-fi'
    | 'seinen'
    | 'shoujo'
    | 'shoujo-ai-126'
    | 'shounen-127'
    | 'shounen-ai'
    | 'slice-of-life'
    | 'smut'
    | 'soft-yaoi'
    | 'soft-yuri'
    | 'sports'
    | 'supernatural'
    | 'tap-chi-truyen-tranh'
    | 'thieu-nhi'
    | 'tragedy-136'
    | 'trinh-tham'
    | 'truyen-scan'
    | 'truyen-mau'
    | 'viet-nam'
    | 'webtoon'
    | 'xuyen-khong-205'
    | '16';
