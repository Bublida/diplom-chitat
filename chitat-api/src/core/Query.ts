import schemas from "@config/schema";
import { RequestConfig, FinalQuery, BuildFunctionMap, IParseRequestOptions } from "@config/types";
import mongoose, { Model, ProjectionType } from "mongoose";
import SendData from "./SendData";
import { UploadedFile } from "express-fileupload";
import path from "path";
import fs from "fs/promises";
import { logger } from "./Logger";

class QueryAPI {

    public static async schemas() {
        const Data = new SendData();

        Object.entries(schemas)
            .forEach(([name, val]) => {
                Data.data({ name: name, ...val })
            })

        return Data;
    }

    public static async schema(req: any) {
        const model = req.params.model.toLowerCase() as keyof typeof schemas
        const Data = new SendData();

        try {
            const _schema = schemas[model]
            Data.data(_schema.fields)
        } catch (error) {
            Data.err(`Unknown scheme \`${model}\``).status(404)
        }

        return Data;
    }

    public static async query(req: any) {
        const model = req.params.model.toLowerCase() as keyof typeof schemas;
        const Data = new SendData();

        try {
            const Model = schemas[model]?.model
            if (!Model) {
                throw new Error(`Model \`${model}\` not found!`);
            }

            const populateFields = Object.entries(schemas[model]?.fields)
                .filter(([_, field]) => field.ref)
                .map(([_, field]) => field.ref)
            const populate = populateFields.length > 0 ? populateFields : undefined;

            const { pipeline } = QueryAPI.parseRequest(req.body, Model, { ignoreBuilders: false, useAggregate: true, ...populate })

            let query = Model.aggregate(pipeline)

            const result = await query.exec();

            Data.replace(result)
        } catch (error) {
            Data.err(`Query error, check console`)
            console.error(error)
        }

        return Data;
    }

    public static async mutation(req: any) {
        const model = (req.params.model as string).toLowerCase() as keyof typeof schemas;
        const Data = new SendData();
        const Files = req.files ?? {};

        try {
            const Model = schemas[model]?.model
            if (!Model) {
                throw new Error(`Model \`${model}\` not found!`);
            }

            const parsedRequest = {
                query: JSON.parse(req.body.query),
                screen: req.body.screen
            }

            const { filter, projection } = QueryAPI.parseRequest(parsedRequest, Model, { ignoreBuilders: true, useAggregate: false })

            let doc = new Model(filter)

            if (filter && filter._id) {
                doc = await Model.findById(filter._id)
                if (doc) {
                    Object.entries(filter)
                        .forEach(([field, val]) => {
                            doc[field] = val
                        })
                } else {
                    throw new Error("Unknown document!")
                }
            }

            if (Object.keys(Files).length > 0) {

                for (const fieldName in Files) {

                    const file = Files[fieldName] as UploadedFile;

                    const fields = schemas[model]?.fields

                    if (Object.keys(fields).includes(fieldName)) {

                        const uploadPath = path.join(__dirname, "../../files", fieldName)
                        const fileName = `${fieldName}_${Date.now()}${path.extname(file.name)}`

                        await fs.mkdir(uploadPath, { recursive: true })

                        const fullPath = path.join(uploadPath, fileName)
                        await file.mv(fullPath)

                        doc[fieldName] = path.join(fieldName, fileName)
                    } else {
                        Data.err(`Пропущено поле ${fieldName}`)
                    }
                }
            }

            let savedDoc = await doc.save();

            if (projection) {
                savedDoc = savedDoc.toObject({
                    fields: projection
                })
            }
            Data.data(savedDoc)

        } catch (error: any) {
            Data.err(`Mutation error, check the console`)
            logger.error("Mutation error!", error)
        }

        return Data;
    }

    public static async delete(req: any) {
        const model = req.params.model.toLowerCase() as keyof typeof schemas;
        const Data = new SendData();

        try {
            const Model = schemas[model]?.model
            if (!Model) {
                throw new Error(`Model \`${model}\` not found!`);
            }

            const { filter } = QueryAPI.parseRequest(req.body, Model)

            const result = await Model.deleteOne(filter)
            Data.replace(result)
        } catch (error) {
            Data.err(`Delete error, check console`)
        }

        return Data;
    }

    public static parseRequest<T>(request: RequestConfig<T>, model: Model<T>, options: IParseRequestOptions = { ignoreBuilders: false, useAggregate: false }): { filter?: FinalQuery<T>, projection?: ProjectionType<T>, pipeline?: any[] } {
        const { query, screen } = request;
        let finalFilter: any = {};

        if (!query) {
            throw Error("Missing `query` field")
        }
        if (screen && typeof screen !== 'string') {
            throw Error("`screen` must be a String")
        }

        // Фильтр
        if (options.ignoreBuilders) {
            finalFilter = query;
        } else {
            let builders: BuildFunctionMap = {};

            for (const schema of Object.values(schemas)) {
                if (schema.model === model) {
                    builders = schema._builds ?? {};
                    break;
                }
            }

            for (const key in query) {
                if (key in builders) {
                    const builder = builders[key as keyof typeof builders];
                    builder(query[key], finalFilter);
                    delete finalFilter[key]
                } else if (model.schema.path(key) || key.startsWith('$')) {
                    finalFilter[key] = query[key];
                } else {
                    logger.error(`Unknown key - \`${key}\``)
                }
            }
        }

        // Аггрегация (сложные запросы)
        if (options.useAggregate) {
            const pipeline: any[] = [];

            // Задание кастомного пайплайна
            const customPipeline = finalFilter.$pipe;
            if (customPipeline) {
                delete finalFilter.$pipe;
                pipeline.push(...customPipeline);
            }

            // Проверка по _id
            const idCheck = finalFilter.$idx;
            if (idCheck) {
                delete finalFilter.$idx;
                let objid: mongoose.Types.ObjectId[] | mongoose.Types.ObjectId | undefined = undefined
                if (Array.isArray(idCheck.id)) {
                    objid = (idCheck.id as Array<string>).map(id => new mongoose.Types.ObjectId(id))
                } else {
                    objid = new mongoose.Types.ObjectId(idCheck.id)
                }
                pipeline.push({
                    $match: {
                        [idCheck.field]: Array.isArray(objid) ? {
                            $in: objid
                        } : objid
                    }
                })
            }

            // Проведение populate
            const populate = finalFilter.$pop;
            if (populate && populate === 'false') {
                delete finalFilter.$pop;
            } else {
                const pop: [string, string, boolean][] = []
                for (const schema of Object.values(schemas)) {
                    if (schema.model === model) {
                        const fields = schema.fields ?? {};
                        for (const fName in fields) {
                            const fData = fields[fName];
                            if (fData.ref) {
                                pop.push([fName, fData.ref, fData.isArray])
                            } else {
                                continue;
                            }
                        }
                        break;
                    }
                }
                if (pop.length > 0) {
                    for (const p of pop) {
                        const [path, ref, isArray] = p
                        pipeline.push({
                            $lookup: {
                                from: ref.toLowerCase() + 's',
                                localField: path,
                                foreignField: '_id',
                                as: path
                            }
                        });
                        if (!isArray) {
                            pipeline.push({
                                $addFields: {
                                    [path]: { $arrayElemAt: [`$${path}`, 0] }
                                }
                            });
                        }
                    }
                }
            }

            // Присоединение обычного query
            if (Object.keys(finalFilter).length > 0) {
                pipeline.push({ $match: finalFilter });
            }

            // Вычисляемые поля
            const computedFields = this.extractComputedFields(screen);
            if (computedFields && Object.keys(computedFields).length > 0) {
                pipeline.push({ $addFields: computedFields });
            }

            // Задание projection ($project)
            let ignore: string[] = []
            for (const schema of Object.values(schemas)) {
                if (schema.model === model) {
                    ignore = schema._select_ignore?.map(i => `-${i}`) ?? [];
                    break;
                }
            }
            const finalProjection = this.parseProjection(ignore, screen)
            if (Object.keys(finalProjection).length > 0) {
                pipeline.push({ $project: finalProjection });
            }

            // Если query пустой -> выводить все документы
            if (pipeline.length === 0) {
                pipeline.push({ $match: {} });
            }

            return { pipeline };

        } else {
            return {
                filter: finalFilter,
                projection: screen ? screen : undefined
            };
        }
    }

    private static extractComputedFields<T>(screen?: ProjectionType<T>): Record<string, any> | null {
        if (!screen) return null;

        const computedFields: Record<string, any> = {};
        for (const [field, value] of Object.entries(screen)) {
            if (value && typeof value === 'object' && '$' in value) {
                computedFields[field] = value;
            }
        }
        return Object.keys(computedFields).length ? computedFields : null;
    }

    private static parseProjection(ignore?: string[], projection?: string): Record<string, 0 | 1> {
        const result: Record<string, 0 | 1> = {};
        if (projection) {
            const fields = projection.trim().split(/\s+/).filter(Boolean);
            for (const field of fields) {
                if (field.startsWith('+')) {
                    result[field.slice(1)] = 1;
                } else if (field.startsWith('-')) {
                    result[field.slice(1)] = 0;
                } else {
                    result[field] = 1;
                }
            }
        } else if (ignore) {
            for (const field of ignore) {
                result[field.slice(1)] = 0;
            }
        }
        return result;
    }
}


export default QueryAPI;