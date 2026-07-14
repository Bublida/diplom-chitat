<template>
   <div class="page">
      <div class="lg:w-1/3 lg:m-auto">
         <h1 class="title text-5xl text-center pb-5">Авторизация</h1>
         <form @submit.prevent="handleLogin" class="ui-border container">
            <div class="container-vertical no-list p-1 color-auto">
               <span class="tag tag-error" v-if="layout.error">{{ layout.error }}</span>
               <input class="input" type="email" name="email" placeholder="Почта" v-model="formData.email" required>
               <input class="input" type="password" name="pass" placeholder="Пароль" v-model="formData.password" required>
               <router-link :to="{ name: 'register' }" class="link">Впервые на сайте? Создайте аккаунт</router-link>
               <button class="btn btn-border mt-4">Войти</button>
            </div>
         </form>
      </div>
   </div>
</template>

<script setup lang="ts">
import { setPageBackground } from '@/api/cover';
import { useLayoutStore } from '@/stores/layout';
import { login } from '@api/authorization';
import { onMounted, reactive } from 'vue';

const layout = useLayoutStore();

const formData = reactive({
   email: '',
   password: ''
})

const handleLogin = async () => {
   login({ ...formData })
}

onMounted(() => {
   setPageBackground('var(--color-standard)')
})
</script>