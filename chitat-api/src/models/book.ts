import mongoose from "mongoose";
import { CommentModel } from "./comment";
import { universalTags } from "tags";

const additionalInfoSchema = new mongoose.Schema({
    lang: {
        type: String,
        about: "Язык",
        required: true
    },
    publisher: {
        type: String,
        about: "Издатель",
        required: false
    },
    fact: {
        type: String,
        about: "Факт",
        required: false
    },
    themes: {
        type: [String],
        about: "Темы",
        required: false
    },
    names: {
        type: [String],
        about: "Имена главных героев",
        required: false
    },
    year: {
        type: Number,
        about: "Год выпуска",
        required: false
    }
}, { _id: false })

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        about: "Название",
        required: true,
    },
    tags: {
        type: [String],
        enum: universalTags,
        about: "Жанры/теги",
        required: true,
    },
    description: {
        type: String,
        about: "Описание",
        required: true,
    },
    series: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
        required: false,
    },
    author: {
        type: mongoose.Types.ObjectId,
        ref: "Author",
        requiered: true,
    },
    agelimit: {
        type: Number,
        about: "Возрастной лимит",
        required: true
    },
    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        required: true,
    },
    additional: additionalInfoSchema,
    adapts: {
        type: [String],
        about: "Ссылки на адаптации",
        required: false
    },
    bookfile: {
        type: String,
        file: 'File',
        about: "Файл книги"
    },
    cover: {
        type: String,
        file: 'Image',
        about: "Обложка книги"
    },
    basecost: {
        type: Number,
        about: "Базовая цена",
        required: true
    },
    buys: {
        type: Number,
        about: "Число покупок/добавлений",
        required: true,
        default: 0
    },
    bookmarks: {
        type: Number,
        about: "Число добавдений в закладки",
        required: true,
        default: 0
    },
    rating: {
        type: String,
        enum: ['Наилучшие', 'Положительные', 'Смешанные', 'Отрицательные', 'Наихудшие', 'Отсутствуют'],
        requred: false,
        default: 'Отсутствуют'
    },
    comments: {
        type: [mongoose.Types.ObjectId],
        ref: 'Comment',
        about: "Комментарии под книгой",
        required: false,
        default: []
    },
    _autocomplete: {
        type: [String],
        select: false
    }
})
    .index({
        _autocomplete: 'text',
        description: 'text',
        tags: 'text'
    }, { weights: { _autocomplete: 10, tags: 7, description: 5 }, default_language: 'none' })
    .pre('save', async function () {
        if (this.title) {
            const chars = this.title.split('');
            const limit = Math.min(chars.length, 20);
            this._autocomplete = [];
            for (let i = 0; i < limit; i++) {
                this._autocomplete.push(this.title.slice(0, i + 1).toLowerCase());
            }
        }
        if (this.comments) {
            const comments = await CommentModel.find({ _id: this.comments }, 'score -_id')
            if (comments) {
                const comRates = comments.map(c => c.score);
                const ratings: Record<string, number> = {};

                if (comRates && comRates.length > 0) {

                    comRates.forEach(score => {
                        ratings[score] = (ratings[score] || 0) + 1;
                    })

                    const total = ratings.like + ratings.dislike + ratings.flat;

                    if (total === 0) {
                        this.rating = 'Отсутствуют';
                    }

                    const likesRatio = ratings.like / total;
                    const dislikesRatio = ratings.dislike / total;
                    const differenceRatio = Math.abs(ratings.like - ratings.dislike) / total;

                    if (likesRatio > 0.8) {
                        this.rating = 'Наилучшие';
                    } else if (likesRatio > 0.5) {
                        this.rating = 'Положительные';
                    } else if (dislikesRatio > 0.8) {
                        this.rating = 'Наихудшие';
                    } else if (dislikesRatio > 0.5) {
                        this.rating = 'Отрицательные';
                    } else if (differenceRatio < 0.2) {
                        this.rating = 'Смешанные';
                    } else {
                        this.rating = 'Смешанные'; // По умолчанию, если ни одно условие не выполнено
                    }
                } else {
                    this.rating = 'Отсутствуют'
                }
            }
        }
    })

const BookModel = mongoose.model('Book', BookSchema);

const bookBuilders = {
    'book-search': (args: any, filter: any) => {
        const DEFAULT_LIMIT = 3
        const { prompt, limit } = args
        filter.$pipe = [
            {
                $match: {
                    $text: { $search: prompt }
                }
            },
            { $limit: limit ?? DEFAULT_LIMIT }
        ]
    },
    'book-filtered-search': (args: any, filter: any) => {
        const DEFAULT_LIMIT = 3
        const { prompt, limit, tags, author } = args;
        const matchStage: Record<string, any> = {};
        if (prompt && prompt.trim()) {
            matchStage.$text = { $search: prompt.trim() };
        }
        if (tags && tags.length > 0) {
            matchStage.tags = { $in: tags };
        }
        if (author) {
            matchStage.author = new mongoose.Types.ObjectId(author);
        }
        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        pipeline.push({ $limit: limit ?? DEFAULT_LIMIT });
        filter.$pipe = pipeline;
    },
    'book-tag-search': (args: any, filter: any) => {
        const DEFAULT_LIMIT = 3
        const { prompt, limit } = args
        filter.$pipe = [
            { $unwind: "$tags" },
            { $match: { tags: { $regex: prompt, $options: "i" } } },
            { $group: { _id: null, tags: { $addToSet: "$tags" } } },
            { $project: { _id: 0, tags: 1 } },
            { $limit: limit ?? DEFAULT_LIMIT }
        ];
    },
    'book-most-rate': (args: any, filter: any) => {
        filter.$pipe = [
            {
                $addFields: {
                    totalRating: { $add: ['$buys', '$bookmarks'] }
                }
            },
            { $sort: { totalRating: -1 } },
            { $limit: 6 }
        ]
    },
    'book-most-tags': (args: any, filter: any) => {
        filter.$pipe = [
            {
                $addFields: {
                    totalRating: { $add: ['$buys', '$bookmarks'] }
                }
            },
            { $sort: { totalRating: -1 } },
            { $limit: 3 },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    tag: '$_id',
                    count: 1
                }
            }
        ]
    },
    'book-most-authors': (args: any, filter: any) => {
        filter.$pipe = [
            {
                $addFields: {
                    totalRating: { $add: ['$buys', '$bookmarks'] }
                }
            },
            { $group: { _id: '$author', totalAuthorRating: { $sum: '$totalRating' } } },
            { $sort: { totalAuthorRating: -1 } },
            { $limit: 3 },
            {
                $project: {
                    _id: 0,
                    author: '$_id',
                    totalAuthorRating: 1
                }
            }
        ]
    }
}

BookModel.syncIndexes();

export { BookModel, bookBuilders };