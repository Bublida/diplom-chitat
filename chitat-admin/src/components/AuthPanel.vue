<template>
  <div class="w-full h-screen flex justify-center items-center">
    <div class="flex flex-col w-1/3 gap-4 items-center">
      <h1 class="text-3xl font-bold">🤖 Вход в систему</h1>
      <el-input v-model="login" placeholder="Логин" />
      <el-input v-model="pass" type="password" show-password placeholder="Пароль" />
      <label>
        <el-switch v-model="rememberLogin" />
        Запомнить вход
      </label>
      <el-button :disabled="login === '' || pass === ''" @click="auth">Войти</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

const store = useAppStore()

const LOGIN = import.meta.env.VITE_LOGIN
const PASSWORD = import.meta.env.VITE_PASSWORD

const login = ref("")
const pass = ref("")
const rememberLogin = ref(false)

const auth = () => {
  if (login.value === LOGIN && pass.value === PASSWORD) {
    if (rememberLogin.value === true) {
      localStorage.setItem('auth', login.value)
    }
    login.value = ""
    pass.value = ""
    store.authorized = true
  } else {
    ElMessage.error({
      message: 'Неверный логин или пароль',
      placement: 'top'
    })
  }
}

</script>