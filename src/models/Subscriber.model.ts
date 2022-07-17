import mongoose from 'mongoose';
const { Schema } = mongoose;

const SubscribersSchema = new Schema(
    {
        userId: {
            type: String,
            require: true,
            index: true,
            unique: true,
        },

        subComics: [
            {
                type: String,
                require: true,
                ref: 'comics',
            },
        ],

        identifications: [
            {
                endpoint: {
                    type: String,
                    required: true,
                },
                p256dh: {
                    type: String,
                    required: true,
                },
                auth: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('subscribers', SubscribersSchema);
