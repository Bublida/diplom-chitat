import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/style.css'
import App from '@/App.vue'
import { useAppStore } from '@stores/app'
import { router } from '@router/router'
import { spinnerArea } from './components/InitSpinner'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

const app = createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
app.use(pinia)
app.use(router)

const appStore = useAppStore(pinia)

// Функция блокировки монтирования приложения до конца загрузки данных
async function initApp(){
    try {
        // Сюда глоб. прелоадер
        document.body.append(spinnerArea)

        await appStore.fetchInit()

        app.mount('#app')

        document.body.removeChild(spinnerArea)
        // Сюда удаление глобального прелоадера
    } catch (error) {
        console.error(`Не удалось запустить приложение:`, error)

        app.mount('#app')
    }
}

// Запуск инициализации приложения
initApp();