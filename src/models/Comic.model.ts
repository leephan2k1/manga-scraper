import mongoose from 'mongoose';
const { Schema } = mongoose;

const ComicSchema = new Schema(
    {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        latestChapter: {
            chapterTitle: { type: String, required: true },
            chapterNumber: { type: String },
            chapterId: { type: String },
        },
        cover: { type: String, required: true },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('comics', ComicSchema);

export interface ComicType {
    _id: string;
    latestChapter: {
        chapterTitle: string;
        chapterNumber: string;
        chapterId: string;
    };
    title: string;
    cover: string;
}
