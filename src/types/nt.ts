export interface MangaPreview {
    newChapter: string | undefined;
    thumbnail: string | null | undefined;
    view: string | undefined;
    name: string;
    updatedAt: string | undefined;
    slug: string;
}

export interface NtDataList {
    mangaData: MangaPreview[];
    totalPages: number;
}

export const GENRES_NT = [
    'Action',
    'Adult',
    'Adventure',
    'Anime',
    'chuyen-sinh-213',
    'Comedy',
    'Comic',
    'Cooking',
    'co-dai-207',
    'Doujinshi',
    'drama-103',
    'dam-my',
    'Ecchi',
    'Fantasy',
    'Gender Bender',
    'Harem',
    'Historical',
    'Horror',
    'Josei',
    'live-action',
    'Manga',
    'Manhua',
    'Manhwa',
    'martial-arts',
    'Mature',
    'Mecha',
    'Mystery',
    'ngon-tinh',
    'One shot',
    'Psychological',
    'Romance',
    'school-life',
    'Sci-fi',
    'Seinen',
    'Shoujo',
    'shoujo-ai-126',
    'Shounen',
    'shounen-ai',
    'slice-of-life',
    'Smut',
    'soft-yaoi',
    'soft-yuri',
    'Sports',
    'Supernatural',
    'tap-chi-truyen-tranh',
    'thieu-nhi',
    'Tragedy',
    'trinh-tham',
    'truyen-scan',
    'truyen-mau',
    'viet-nam',
    'Webtoon',
    'xuyen-khong-205',
    '16',
];
