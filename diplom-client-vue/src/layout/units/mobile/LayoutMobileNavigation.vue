<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSubStyle } from '@/api/composables/useSubStyle';

const route = useRoute()
const appStore = useAppStore()

const btnStyle = useSubStyle()

const bookmarkNavigate = computed(() => {
   return appStore.isAuthorized ? { name: 'bookmarks' } : { name: 'login' };
})

const mainNavigation = computed(() => {
   return appStore.isAuthorized && route.name === 'index' ? { name: 'mybooks' } : { name: 'index' }
})
</script>

<template>
   <nav class="mobile-nav ui-border">

      <router-link :to="bookmarkNavigate">
         <Icon icon="mynaui:bookmark" class="size-5" />
      </router-link>

      <router-link :to="mainNavigation">
         <button class="btn btn-border title text-xl" :style="{ borderColor: `var(${btnStyle.flat})`, color: `var(${btnStyle.flat})`, paddingRight: '1rem' }">Читать?</button>
      </router-link>

      <router-link :to="{ name: 'profile' }">
         <Icon icon="mynaui:user" class="size-5" />
      </router-link>
   </nav>
</template>

<style scoped>
@reference "tailwindcss";

.mobile-nav {
   @apply flex items-center justify-around;
}
</style>