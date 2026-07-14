import { useLayoutStore } from "@/stores/layout";
import { $api } from "./composables/useApi";
import type { LoginData, RegisterData } from "@/types";
import { useAppStore } from "@/stores/app";
import { type RouteLocationAsPathGeneric, type RouteLocationAsRelativeGeneric } from "vue-router";
import router from "@/router";

export const checkAuthorization = () => {
   const token = localStorage.getItem('token')
   if (token) {
      return true;
   } else {
      console.warn('token отсутствует!')
      return false;
   }
}

export const logout = async () => {
   localStorage.removeItem('token')
   window.location.href = '/'
}

export const login = async (data: LoginData) => {
   const layout = useLayoutStore()
   $api({
      base: 'api/login',
      fetchOptions: {
         body: data
      }
   }).then(async res => {
      if (res.message) {
         layout.error = res.message
      } else if (res.token) {
         // Регистрация токена      
         const appStore = useAppStore()
         localStorage.setItem('token', res.token)
         appStore.isAuthorized = true;
         window.location.href = '/'
      }
   });
}

export const register = async (data: RegisterData) => {
   const layout = useLayoutStore()
   if (data.password !== data.confirm) {
      layout.error = 'Пароли не совпадают'
   }
   $api({
      base: 'api/register',
      fetchOptions: {
         body: data
      }
   }).then(res => {
      if (res.message) {
         layout.error = res.message
      } else if (res.token) {
         const appStore = useAppStore()
         localStorage.setItem('token', res.token)
         appStore.isAuthorized = true;
         window.location.href = '/'
      }
   })
}

export const updateUserData = async () => {
   const response = await $api({ base: 'api/user', token: true })
   if (!response) {
      await logout()
   } else {
      useAppStore().userData = response
   }
}

export const purchaseBook = async (id: string, redirect: boolean | -1 | string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric = true) => {
   if(id !== ''){
      await $api({
         base: 'api/buy',
         fetchOptions: {
            body: {
               book: id
            }
         },
         token: true
      })
      if(typeof redirect === 'boolean'){
         if(redirect){
            window.location.reload()
         }
      } else {
         if(redirect === -1){
            router.back();
            window.location.reload()
         }else{
            router.push(redirect)
         }
      }
   }
}