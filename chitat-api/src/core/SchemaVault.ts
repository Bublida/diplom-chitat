import { logger } from "core/Logger";
import { SchemaRegisterData, SchemasMap } from "../config/types";
import mongoose from "mongoose";

logger.warn(`Создание моделей и схем..`)

// Интерфейс для описания поля в нашей внутренней структуре
interface FieldDescription {
    type?: string;
    required?: boolean;
    isArray?: boolean;
    ref?: string;
    enum?: any[];
    about?: string;
    filetype?: string;
    $emb?: boolean; // Флаг вложенного документа
    [key: string]: any; // Для вложенных полей
}

class SchemaVault {
    private schemas: SchemasMap = {}

    private getSchemaFields(schema: mongoose.Schema) {
        const result: Record<string, any> = {};
        const noSelect: string[] = [];

        // Рекурсивная функция для обработки путей
        // targetObj - объект, в который мы записываем найденные поля
        const processPath = (pathName: string, path: mongoose.SchemaType, targetObj: Record<string, any>) => {
            if (pathName === '__v') return;

            const options = path.options;
            
            // Обработка select: false
            if (options.select === false) {
                // Можно добавить в noSelect, если нужно скрывать их полностью
                // noSelect.push(pathName); 
                // return; 
            }

            let baseType: string = path.instance;
            if (baseType === 'ObjectID') baseType = 'ObjectId';

            // Проверка на массив
            let isArray = false;
            let embeddedSchema: mongoose.Schema | undefined = undefined;
            let embeddedType: mongoose.SchemaType | undefined = undefined;

            if (baseType === 'Array') {
                isArray = true;
                embeddedType = path.getEmbeddedSchemaType();
                
                if (embeddedType) {
                    // Если элемент массива имеет свою схему (массив поддокументов)
                    if (embeddedType.schema) {
                        embeddedSchema = embeddedType.schema;
                        baseType = 'Embedded'; 
                    } else {
                        // Массив примитивов или ObjectId
                        baseType = embeddedType.instance || 'String';
                        if (baseType === 'ObjectID') baseType = 'ObjectId';
                    }
                }
            } 
            // Одиночный вложенный документ (не массив)
            else if (path.schema) {
                embeddedSchema = path.schema;
                baseType = 'Embedded';
            }

            // Если нашли вложенную схему (массив объектов или одиночный объект)
            if (embeddedSchema) {
                const nestedObj: Record<string, any> = {};
                
                // Рекурсивно обрабатываем поля вложенной схемы
                Object.keys(embeddedSchema.paths).forEach((nestedPathName) => {
                    if (nestedPathName === '__v') return;
                    processPath(nestedPathName, embeddedSchema!.paths[nestedPathName], nestedObj);
                });

                // Записываем результат в targetObj
                // Структура: { $emb: true, isArray: boolean, ...поля_вложенного_объекта }
                targetObj[pathName] = {
                    $emb: true,
                    isArray: isArray,
                    ...nestedObj
                };

            } else {
                // Это простое поле (примитив, ObjectId, Enum и т.д.)
                const fieldInfo: FieldDescription = {
                    type: options.file ? "File" : baseType,
                    required: options.required === true || (Array.isArray(options.required) && options.required[0] === true),
                    isArray: isArray, // Важно: устанавливаем флаг isArray для простых типов
                };

                if (options.enum) fieldInfo.enum = options.enum;
                if (options.ref) fieldInfo.ref = options.ref;
                if (options.about) fieldInfo.about = options.about;
                if (options.file) fieldInfo.filetype = options.file;

                targetObj[pathName] = fieldInfo;
            }
        };

        // Обработка всех путей верхнего уровня
        Object.keys(schema.paths).forEach((pathName) => {
            processPath(pathName, schema.paths[pathName], result);
        });

        return { result, noSelect };
    }

    public register(name: string, schema: SchemaRegisterData) {
        const { result, noSelect } = this.getSchemaFields(schema.model.schema)
        this.schemas[name] = {
            info: schema.info,
            model: schema.model,
            fields: result, // Теперь result - это иерархический объект
            _builds: schema._builds,
            _select_ignore: noSelect
        }
        return this
    }

    constructor() {
        return this
    }

    public get() {
        return this.schemas
    }
}

logger.warn(`Все модели и схемы созданы!`)
export default new SchemaVault();