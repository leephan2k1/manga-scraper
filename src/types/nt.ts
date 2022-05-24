export interface NtDataList {
    mangaData: {
        newChapter: string | undefined;
        thumbnail: string | null | undefined;
        view: string | undefined;
        name: string;
        updatedAt: string | undefined;
        slug: string;
    }[];
    totalPages: number;
}
