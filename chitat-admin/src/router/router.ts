import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import HomePage from "@components/pages/HomePage.vue";
import SchemaPage from "@components/pages/SchemaPage.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home-page',
        component: HomePage
    },
    {
        path: '/:schema',
        name: 'schem-page',
        component: SchemaPage
    }
]

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})