<template>
   <router-link :to="{ name: 'book', params: { id: data._id } }">
      <div class="book-hero" :style="{ '--bg-img': imgPath }">

         <div class="cover-container" v-if="device === 'mobile'">
            <ImageFetch v-if="data.cover" :path="data.cover" class="cover" />
            <div v-else class="cover-placeholder">
               <h1 class="title text-xl">{{ data.title }}</h1>
               <h2 v-if="data.author" class="prop text-sm">{{ data.author.name }}</h2>
            </div>
         </div>
         
         
         <div class="description">
            <div v-if="data.tags && device === 'desktop'" class="container">
               <div class="container-start mb-4">
                  <Tag v-for="(tag, index) in data.tags" :link="{ name: 'catalog', query: { tags: tag } }" :key="index">{{ tag }}</Tag>
               </div>
            </div>
            <p class="prop">{{ data.description }}</p>
         </div>
         
         <div v-if="device === 'desktop'" class="perspective-distant w-2/3 pb-5">
            <div class="hover:rotate-z-0 hover:rotate-y-0 hover:rotate-x-0 transition-transform -rotate-y-10 rotate-x-35 rotate-z-25">
               <ImageFetch v-if="data.cover" :path="data.cover" class="cover" />
               <div v-else class="cover-placeholder">
                  <div>
                     <h1 class="title text-xl">{{ data.title }}</h1>
                     <h2 v-if="data.author" class="prop text-sm">{{ data.author.name }}</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ImageFetch from '@components/ImageFetch.vue';
import { getFullPath } from '@api/cover';
import { useDevice } from '@/api/composables/useDevice';
import type { Book } from '@/types/models';
import Tag from './Tag.vue';

const props = defineProps<{
   data: Book
}>()

const device = useDevice()

const imgPath = computed(() => props.data.cover ? `url('${encodeURI(getFullPath(props.data.cover))}')` : '')
</script>

<style scoped>
@reference "tailwindcss";

.book-hero {
   /* mobile */
   @apply flex flex-col gap-2 justify-center relative py-10 *:z-100;

   /* desktop */
   @apply lg:flex-row lg:items-center lg:px-[10vw];

   &::before {
      content: '';
      /* mobile */
      @apply absolute size-full opacity-25 rounded-xl z-10;

      /* desktop */
      @apply lg:size-9/10;
      background: var(--bg-img, var(--color-base-300));
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
   }
}

.cover-container {
   @apply text-center w-full lg:w-fit lg:px-20;
}

.cover,
.cover-placeholder {
   /* mobile */
   @apply h-[35vh] w-40 rounded-md mx-auto shadow-lg;

   /* desktop */
   @apply lg:h-[50vh] lg:w-65;
}

.description {
   /* mobile */
   @apply grid content-center text-center h-[15vh] text-ellipsis w-full overflow-hidden px-4;

   /* desktop */
   @apply lg:content-start lg:text-left lg:text-2xl lg:overflow-visible lg:h-fit;
}

.cover-placeholder {
   @apply flex justify-center items-center text-center flex-col;
   background: var(--color-base-300);
}
</style>