<template>
   <div class="page">
      <BackBtn />
      <div v-if="author" class="author-section" :style="{ '--bg-color': backColor }">
         <div class="author-content">
            <h1 class="title author-name lg:text-3xl">{{ author.name }}</h1>
            <p class="prop description">{{ author.description }}</p>
         </div>
         <ImageFetch :path="author.photo" class="photo" :class="{ faded: device === 'mobile', 'round-fade': device === 'desktop' }" />
      </div>
      <div class="container">
         <div :class="{ 'container-free': device === 'mobile', 'grid grid-cols-6 gap-4': device === 'desktop' }">
            <BookCard v-for="(book, idx) in books" :data="book" :key="idx" />
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useDevice } from '@/api/composables/useDevice';
import { getAverageColor, setPageBackground } from '@/api/cover';
import BackBtn from '@/components/BackBtn.vue';
import BookCard from '@/components/BookCard.vue';
import ImageFetch from '@/components/ImageFetch.vue';
import { useApi } from '@api/composables/useApi';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const device = useDevice();

const route = useRoute()
const { data: author } = useApi({ base: 'query/author', first: true, query: { $idx: { field: '_id', id: route.params.id } } })
const { data: books } = useApi({ base: 'query/book', query: { $idx: { field: 'author', id: route.params.id } } })

const backColor = ref('')

watch(author, async () => {
   const color = (await getAverageColor(author.value.photo))?.hex || '';
   backColor.value = color
   setPageBackground(color)
})
</script>

<style scoped>
@reference "tailwindcss";

.author-section {
   /* mobile */
   --block-h: 30vh;
   @apply relative;
   height: var(--block-h);

   /* desktop */
   @apply lg:flex lg:justify-center lg:items-center lg:gap-4 lg:h-fit;
}

.author-content {
   @apply z-10 relative pt-4 pl-4 lg:p-0 lg:text-right flex flex-col gap-4 lg:items-end;
   
   .author-name {
      @apply w-fit;
      text-shadow: 0 0 10px var(--bg-color), 0 0 20px var(--bg-color);
   }

   .description {
      @apply text-sm w-3/4;
      text-shadow: 0 0 10px var(--bg-color), 0 0 20px var(--bg-color);
   }
   
}


.photo {
   /* mobile */
   @apply absolute -top-5 -right-5 z-5 h-(--block-h) w-1/2;

   /* desktop */
   @apply lg:relative lg:top-0 lg:right-0 lg:z-0 lg:rounded-xl lg:size-60;
}

.faded {
   &::before {
      content: '';
      @apply absolute size-full;
      background: radial-gradient(circle at top right,
            transparent 50%,
            var(--bg-color) 65%,
            var(--bg-color));
   }
}

.round-fade {
   &::before {
      content: '';
      @apply absolute size-full;
      background: radial-gradient(circle,
            transparent 50%,
            var(--bg-color) 65%,
            var(--bg-color));
   }
}
</style>