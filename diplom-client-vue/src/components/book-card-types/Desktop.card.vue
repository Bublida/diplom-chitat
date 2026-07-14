<template>
   <div class="book-card" :style="{ '--sub-color': `var(${subColor})` }">
      <router-link :to="{ name: 'book', params: { id: data._id } }">
         <ImageFetch v-if="data.cover" :path="data.cover" class="cover" />
         <div v-else class="cover-placeholder">
            <h1 class="title text-lg color">{{ data.title }}</h1>
         </div>
         <div class="naming-container">
            <h3 class="naming title color-auto" v-if="data.title">{{ data.title }}</h3>
         </div>
         <p class="author title" v-if="data.author">{{ data.author.shortname }}</p>
         <div class="flex gap-2 justify-center flex-wrap py-1">
            <div class="tag" v-for="tag in tags" :key="tag">{{ tag }}</div>
         </div>
      </router-link>
      <div class="grid grid-cols-4 gap-1 *:w-full p-0.5">
         <Bookmark :book-id="data._id"/>

         <button v-if="!appStore.isAuthorized" class="col-span-3" title="Требуется авторизация"><br></button>
         <BuyBtn v-else-if="!appStore.userData.books.find((b: any) => b.bookid === data._id) &&
            data.library._id !== '69dd2a351da95895fb2d9e06'" :prod-id="data._id" :basecost="data.basecost"
            :title="data.title" class="col-span-3" />
         <button v-else-if="data.library._id === '69dd2a351da95895fb2d9e06' && !appStore.userData.books.find((b: any) => b.bookid === data._id)"
            class="btn btn-border title color col-span-3"
            :style="{ background: `var(${SUBSCRIBTION_STYLE[data.library._id as keyof typeof SUBSCRIBTION_STYLE].var})` }" @click="purchaseBook(data._id, {name: 'mybooks'})" title="Купить книгу">Добавить</button>
         <button v-else class="btn btn-border title col-span-3" @click="$router.push({ name: 'read', params: { id: data._id } })" title="Читать книгу">Читать!</button>
 
      </div>
   </div>
</template>

<script setup lang="ts">
import { SUBSCRIBTION_STYLE } from '@/api/styles';
import ImageFetch from '@components/ImageFetch.vue';
import Bookmark from '@components/functions/Bookmark.vue';
import { computed } from 'vue';
import BuyBtn from '../functions/BuyBtn.vue';
import { useAppStore } from '@/stores/app';
import { useRoute } from 'vue-router';
import type { Book } from '@/types/models';
import { purchaseBook } from '@/api/authorization';

const props = defineProps<{
   data: Book
}>()

const route = useRoute()

const appStore = useAppStore()

const subColor = computed(() => SUBSCRIBTION_STYLE[props.data.library._id as keyof typeof SUBSCRIBTION_STYLE].flat)

const tags = computed(() => props.data.tags.filter((tag: string, idx: number) => idx < 2 && tag.length < 10))
</script>

<style scoped>
@reference "tailwindcss";

.book-card {
   @apply p-0.5 rounded-lg max-w-40 min-w-40 relative justify-self-center;
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

.cover-placeholder {
   @apply flex items-center justify-center;
   background: var(--color-base-300);
}

.cover,
.cover-placeholder {
   @apply border-b-8 w-full h-50 rounded-lg;
   border-color: var(--sub-color);
}

.tag {
   @apply text-[0.7rem] font-black;
   color: var(--color-base-300);
   outline-color: var(--color-base-300);
}
</style>