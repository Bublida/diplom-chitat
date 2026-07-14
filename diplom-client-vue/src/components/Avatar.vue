<template>
   <div class="cover-container">
      <span class="cover-symbol" v-if="symbol">{{ symbol }}</span>
      <div class="cover-block" :class="{ 'bg-placeholder': !path }">
         <ImageFetch v-if="path" :path="path" :alt="`Фотография пользователя`" class="cover" />
         <Icon v-else icon="mynaui:camera" class="cover-placeholder" />
      </div>
   </div>
</template>

<script setup lang="ts">
import ImageFetch from './ImageFetch.vue';
import { Icon } from '@iconify/vue';

defineProps({
   path: String,
   symbol: String
})
</script>

<style scoped>
@reference "tailwindcss";

.cover-container {
   @apply relative;
}

.cover-block {
   @apply overflow-clip size-15 border-4 rounded-full outline-2;

   border-color: var(--color-base-100);
   outline-color: var(--color-base-200);
}

.cover-placeholder {
   @apply absolute top-1/2 left-1/2 -translate-1/2 size-7;
   color: var(--color-main-text);
   pointer-events: none;
}

.bg-placeholder {
   background: var(--color-base-300);
}

.cover {
   @apply size-full;
}

.cover-symbol {
   @apply absolute bottom-3 -rotate-12 right-3 text-4xl z-100;
}
</style>