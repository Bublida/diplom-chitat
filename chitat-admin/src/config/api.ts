import { useAppStore } from "@/stores/app";
import axios from "axios";
import { ElMessage } from "element-plus";

const API_URL = import.meta.env.VITE_API_URL ?? null

if (!API_URL) {
    throw new Error("Отсутсвует ссылка на API")
}

type FetchType = "query" | "mutation" | "schema" | "delete"

export default class Data {
    private static async fetch(type: FetchType, model: string, data?: any) {
        const _model = model.toLowerCase()
        const path = `${API_URL}/${type}/${_model}`
        const response = await axios.post(path, data)
            .catch(err => {
                if (err.response) {
                    ElMessage.error({
                        message: `Ошибка сервера: ${err.response.status}`,
                        placement: 'bottom-left',
                        showClose: false,
                        duration: 0
                    });
                    useAppStore().isInitialized = false
                } else if (err.request) {
                    ElMessage.error({
                        message: `Ошибка соединения (нет ответа): ${err.message}`,
                        placement: 'bottom-left',
                        showClose: false,
                        duration: 0
                    });
                    useAppStore().isInitialized = false
                } else {
                    ElMessage.error({
                        message: `Ошибка настройки: ${err.message}`,
                        placement: 'bottom-left',
                        showClose: false,
                        duration: 0
                    });
                }
            })
        return (response)?.data
    }

    public static async query(model: string, data: any) {
        return await Data.fetch("query", model, data)
    }

    public static async mutation(model: string, data: any) {
        return await Data.fetch("mutation", model, data)
    }

    public static async delete(model: string, data: any) {
        return await Data.fetch("delete", model, data)
    }

    public static async schema(model: string) {
        return await Data.fetch("schema", model)
    }

    public static async schemas() {
        return await Data.fetch("schema", "")
    }
}

export function getFileExtension(filename?: string): string {
    if (!filename) return '';

    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
        return '';
    }

    return filename.slice(lastDotIndex + 1).toLowerCase();
}