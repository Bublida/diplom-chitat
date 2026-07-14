import e from "express";
import QueryAPI from "core/Query";
import { logger } from "core/Logger";
import schemas from "@config/schema";

const router = e.Router();

// Получение всех схем
router.post('/schema', async (_, res) => {
    const data = await QueryAPI.schemas();
    logger.log(`Запрос на получение всех схем системы (${data.send().data.length}/${Object.keys(schemas).length})`)
    res.status(data._status).send(data.send())
})

// Получение схемы модели
router.post('/schema/:model', async (req, res) => {
    const data = await QueryAPI.schema(req);
    logger.log(`Запрос на получение схемы \`${req.params.model}\` (${data.send().data.length}/1)`)
    res.status(data._status).send(data.send())
})

// Запрос на получение данных модели
router.post('/query/:model', async (req, res) => {
    const data = await QueryAPI.query(req);
    logger.log(`QUERY \`${req.params.model}\` (${data.send().data.length})`)
    res.status(data._status).send(data.send())
})

// Запрос на мутацию модели
router.post('/mutation/:model', async (req, res) => {
    const data = await QueryAPI.mutation(req)
    logger.log(`MUTATION \`${req.params.model}\``)
    res.status(data._status).send(data.send())
})

// Запрос на удаление модели
router.post('/delete/:model', async (req, res) => {
    const data = await QueryAPI.delete(req)
    logger.log(`DELETE \`${req.params.model}\``)
    res.status(data._status).send(data.send())
})

export { router as QueryRouter };