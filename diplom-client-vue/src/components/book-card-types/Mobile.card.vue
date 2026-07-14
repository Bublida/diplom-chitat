<template>
   <div class="book-card" :style="{ '--sub-color': `var(${subColor})` }">
      <div class="bookmark">
         <Bookmark :book-id="data._id"/>
      </div>
      <router-link :to="{ name: 'book', params: { id: data._id } }">
         <ImageFetch v-if="data.cover" :path="data.cover" class="cover" />
         <div v-else class="cover-placeholder">
            <h1 class="title text-lg color">{{ data.title }}</h1>
         </div>
         <div class="naming-container">
            <h3 class="naming prop color-auto" v-if="data.title">{{ data.title }}</h3>
         </div>
         <p class="author prop" v-if="data.author && data.author.name">{{ data.author.shortname }}</p>
      </router-link>
   </div>
</template>

<script setup lang="ts">
import { SUBSCRIBTION_STYLE } from '@/api/styles';
import type { Book } from '@/types/models';
import ImageFetch from '@components/ImageFetch.vue';
import Bookmark from '@components/functions/Bookmark.vue';
import { computed } from 'vue';

const props = defineProps<{
   data: Book
}>()

const subColor = computed(() => SUBSCRIBTION_STYLE[props.data.library._id as keyof typeof SUBSCRIBTION_STYLE].flat)
</script>

<style scoped>
@reference "tailwindcss";

.book-card {
   @apply p-0.5 rounded-lg max-w-25 min-w-25 relative justify-self-center;
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
   @apply w-full h-35 rounded-lg;
}

.bookmark {
   @apply absolute top-1.5 right-1;
}

.cover-placeholder {
   @apply w-full h-35 rounded-lg flex items-center justify-center;
   background: var(--color-base-300);
}
.cover,.cover-placeholder {
   @apply border-b-8;
   border-color: var(--sub-color);
}
</style>