<template>
   <div class="page">
      <div class="lg:w-1/3 lg:m-auto">
         <h1 class="text-5xl title text-center pb-5">Регистрация</h1>
         <form @submit.prevent="handleLogin" class="ui-border container">
            <div class="container-vertical no-list p-1 color-auto">
               <span class="tag tag-error" v-if="layout.error">{{ layout.error }}</span>
               <input class="input" type="email" name="email" placeholder="Почта" v-model="formData.email" required>

               <input class="input mt-4" type="text" name="name" placeholder="Имя" v-model="formData.name" required>
               <input class="input mb-4" type="text" name="surname" placeholder="Фамилия" v-model="formData.surname" required>
   
               <input class="input" type="password" minlength="7" maxlength="16" name="pass" placeholder="Пароль" v-model="formData.password" required>
               <input class="input" type="password" minlength="7" maxlength="16" name="confirm" placeholder="Повтор пароля" v-model="formData.confirm" required>
               <router-link :to="{ name: 'login' }" class="link">Уже есть аккаунт? Войти</router-link>
               <button class="btn btn-border mt-4">Зарегистрироваться</button>
            </div>
         </form>
      </div>
   </div>
</template>

<script setup lang="ts">
import { setPageBackground } from '@/api/cover';
import { useLayoutStore } from '@/stores/layout';
import { register } from '@api/authorization';
import { onMounted, reactive } from 'vue';

const layout = useLayoutStore();

const formData = reactive({
   email: '',
   password: '',
   confirm: '',
   name: '',
   surname: ''
})

const handleLogin = async () => {
   register({ ...formData })
}

onMounted(() => {
   setPageBackground('var(--color-standard)')
})
</script>