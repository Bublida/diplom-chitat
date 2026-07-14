import express, { Express } from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import { logger } from './core/Logger';
import { join } from 'path';
import connectDb from '@config/db';
import { QueryRouter } from '@config/routers/query';
import { ApiRouter } from '@config/routers/api';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser'

// Предосталвение возможности использования файлов окружения .env (в тихом режиме)
configDotenv({ quiet: true });

const app: Express = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const URI = process.env.MONGODB_URI

if (process.env.FILE_LOGGING === 'true') {
  logger.openLoggingFile()
}
logger.info('Запуск сервера...');

// Подключение к БД
connectDb(URI);

// Настройки приложения
app
  .use(cors({
    origin: "https://diplom-chitat-259yxz9s5-bublead.vercel.app/",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }))
  .use(cookieParser())
  .use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/files/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: false
  }))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))

// Подключение статики
app.use('/files', express.static(join(__dirname, '../files')));
// Подключение QueryAPI
app.use('/', QueryRouter);
// Подключение обычных API-запросов
app.use('/api', ApiRouter);

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Сервер запущен на порту ${PORT}`);
})

// Функция закрытия сервера
async function serverClose() {
  logger.log('Закрытие сервера...')

  try {
    await logger.closeLoggingFile()
  } catch (error) {
    console.error(`Ошибка при закрытии файла логгов:`, error)
  }

  server.close(() => {
    console.log(`\nСервер закрыт 😴\n`)
  })
}

process.on('SIGINT', () => serverClose())
process.on('SIGTERM', () => serverClose())