import { errorArea } from "@/components/InitSpinner";
import Data from "@config/api";
import { defineStore } from "pinia";

interface AppStore {
    authorized: boolean
    schemas: any[]
    isLoading: boolean
    isInitialized: boolean
}

export const useAppStore = defineStore("app", {
    state: (): AppStore => ({
        authorized: localStorage.getItem('auth') ? true : false,
        schemas: [],
        isLoading: false,
        isInitialized: false
    }),
    actions: {
        async fetchInit() {
            if (this.isInitialized) return

            this.isLoading = true

            try {
                // Получение всех схем из API
                this.schemas = (await Data.schemas()).data
                console.dir(this.schemas)
            } catch (error: any) {
                console.error(`Ошибка при загрузке инициализационных данных`, error)
                errorArea()
            } finally {
                this.isLoading = false
            }
        }
    }
})