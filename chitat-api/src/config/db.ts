import { logger } from "./../core/Logger";
import mongoose from "mongoose";

export default async function connectDb(uri: string | undefined){
    try {
        if(uri){
            const db = await mongoose.connect(uri)
                .then(() => logger.info("Подключение к БД прошло успешно"))
                .catch(() => logger.error("Ошибка подключения к БД"))
        } 
    } catch (error) {
        logger.error("DataBase connection error", error)
    }
}