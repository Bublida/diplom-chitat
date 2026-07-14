import { useAppStore } from "@/stores/app";
import { useLayoutStore } from "@/stores/layout";
import type { QueryRequestBody, UseApiOptions } from "@/types";
import axios from "axios";
import { computed, ref } from "vue";

export const useApi = (options: UseApiOptions) => {
   const data = ref<any>(null)
   const loading = ref(true)
   const error = ref<any>(null)

   async function fetch() {
      try {
         error.value = null

         // Базовая URL для API
         const baseURL = import.meta.env.VITE_API_BASE;
         if (baseURL === undefined) throw Error("Не установлен apiBase")

         // Задаём базовую настройку запроса (обозначаем модель и вид запроса)
         const path = options.base;

         // Тело запроса (query)
         const body: QueryRequestBody = { query: { ...options.query } }

         // Обозначение экранирования ответа
         if (options.screen) body.screen = options.screen

         // Проверка на зщищённую отправку
         const headers: Record<string, any> = {}
         if (options.token === true) {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Токен авторизации отсутствует!');
            headers['Authorization'] = `Bearer ${token}`;
         }

         const response = await axios.post(path, options.fetchOptions?.body || body, { baseURL, headers })
         if (!response.data) {
            throw new Error(`HTTP error! Check the console`)
         }

         if (options.first) {
            data.value = response.data.data[0];
         } else {
            data.value = response.data.data;
         }
      } catch (err: any) {
         error.value = err.message || 'Произошла ошибка при загрузке данных';
      } finally {
         loading.value = false;
      }
   }

   fetch();

   return { data, loading, error, refetch: fetch };
}

export const $api = async (options: UseApiOptions) => {
   try {
      const type = options.base.split('/')[0]

      // Базовая URL для API
      const baseURL = import.meta.env.VITE_API_BASE;
      if (baseURL === undefined) throw Error("Не установлен apiBase")

      // Задаём базовую настройку запроса (обозначаем модель и вид запроса)
      const path = options.base;

      // Тело запроса (query)
      const body: QueryRequestBody = { query: type === 'mutation' ? JSON.stringify({ ...options.query }) : { ...options.query } }

      // Обозначение экранирования ответа
      if (options.screen) body.screen = options.screen

      // Проверка на зщищённую отправку
      const headers: Record<string, any> = {}
      if (options.token === true) {
         const token = localStorage.getItem('token');
         if (!token) throw new Error('Токен авторизации отсутствует!');
         headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(
         path,
         options.fetchOptions?.body || body,
         {
            baseURL,
            headers,
         }
      )

      if (!response.data) {
         throw new Error(`HTTP error! Check the console`)
      }

      const result = response.data.data || response.data
      return options.first ? result[0] : result;
   } catch (err: any) {
      console.error(`Произошла ошибка при загрузке данных:`, err)
   }
}