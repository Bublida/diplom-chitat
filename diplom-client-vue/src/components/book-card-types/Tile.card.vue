<template>
   <div class="book-tile">
      <ImageFetch v-if="data.cover" :path="data.cover" class="cover" />
      <div v-else class="cover-placeholder">
         <h1 class="title text-lg color">{{ data.title }}</h1>
      </div>
      <div class="naming-container">
         <h3 class="naming prop color-auto" v-if="data.title">{{ data.title }}</h3>
      </div>
   </div>
</template>

<script setup lang="ts">
import type { Book } from '@/types/models';
import ImageFetch from '@components/ImageFetch.vue';

defineProps<{
   data: Book
}>()

</script>

<style scoped>
@reference "tailwindcss";

.book-tile {
   @apply p-0.5 rounded-lg h-fit w-full relative justify-self-center;
   background: var(--color-base-100);
}

.naming-container {
   @apply flex justify-center h-7 items-center;
}

.naming {
   @apply font-black leading-3 wrap-anywhere pt-1 text-xs text-center cursor-pointer;
}

.author {
   @apply text-center font-black text-[10px] pt-1;
   color: var(--color-base-300);
}

.cover {
   @apply w-full size-25 rounded-lg;
}

.bookmark {
   @apply absolute top-1.5 right-1;
}

.cover-placeholder {
   @apply w-full size-25 rounded-lg flex items-center justify-center;
   background: var(--color-base-300);
}
</style>