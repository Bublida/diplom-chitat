<template>
   <div class="page" v-if="data">
      <!-- Back-button -->
      <div class="flex justify-between" v-if="device === 'desktop'">
         <BackBtn />
         <div class="ui-border" v-if="data.type === 'List'">
            <ChangeCollection :collection-id="$route.params.id as string"/>
         </div>
      </div>
      <div class="relative" :class="{ 'mt-10': !data.icon && !data.cover }">
         <ImageFetch v-if="data.cover" :path="data.cover" class="cover"
            :class="{ mobile: device === 'mobile', desktop: device === 'desktop' }"
            :style="{ '--bg-color': backColor }" />
         <div v-if="data.icon && device === 'desktop'" class="mx-auto w-fit">
            <Icon :icon="data.icon" class="size-25 mb-10" style="color: var(--color-base-100)" />
         </div>
         <p class="absolute title bottom-0 left-1/2 -translate-x-1/2 text-3xl" v-if="device === 'desktop'">{{ data.title }}</p>
      </div>
      <div class="container" v-if="books">
         <div class="container-vertical lg:w-3/4 mx-auto">
            <BookCard v-for="(book, idx) in books" :data="book" type="bar" :key="idx" />
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { $api, useApi } from '@/api/composables/useApi';
import { useDevice } from '@/api/composables/useDevice';
import { getAverageColor, setPageBackground, setPageSubBackground } from '@/api/cover';
import BackBtn from '@/components/BackBtn.vue';
import BookCard from '@/components/BookCard.vue';
import ChangeCollection from '@/components/functions/ChangeCollection.vue';
import ImageFetch from '@/components/ImageFetch.vue';
import { useAppStore } from '@/stores/app';
import { useLayoutStore } from '@/stores/layout';
import type { Book } from '@/types/models';
import { Icon } from '@iconify/vue';
import { onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const device = useDevice()

const route = useRoute()

const { data } = useApi({ base: 'query/collection', first: true, query: { $pop: 'false', $idx: { field: '_id', id: route.params.id } } })

const books = ref<Book[] | undefined>()

const layout = useLayoutStore()
const backColor = ref('')

watch(data, async () => {
   console.log(data)
   if (data.value) {
      useAppStore().collectionData = data.value
      books.value = await $api({ base: 'query/book', query: { $idx: { field: '_id', id: data.value.books } } })
   }

   if (data.value.cover) {
      const color = (await getAverageColor(data.value.cover))?.hex || '';
      backColor.value = color
      setPageBackground(color)
   } else if (data.value.color) {
      setPageBackground(data.value.color)
   } else {
      setPageSubBackground()
   }
   layout.hatInfo = {
      title: data.value.title,
      subtitle: data.value.type === 'Series' ? 'Цикл книг' : 'Коллекция',
      icon: data.value.type === 'Series' ? 'mingcute:book-4-line' : 'mingcute:book-5-line'
   }
})

onUnmounted(() => {
   layout.hatInfo = undefined
})


</script>

<style scoped>
@reference "tailwindcss";

.cover {
   /* mobile */
   @apply relative w-screen h-[35vh] -translate-5;

   /* desktop */
   @apply lg:w-4/5 lg:h-[40vh] lg:translate-0 lg:left-1/2 lg:-translate-x-1/2;

   &.mobile::before {
      content: '';
      @apply absolute top-0 right-0 size-full;
      background: linear-gradient(to top,
            var(--bg-color),
            transparent);
   }

   &.desktop::before {
      content: '';
      @apply absolute top-0 right-0 size-full;
      background: radial-gradient(circle at bottom,
            transparent 45%,
            var(--bg-color) 55%,
            var(--bg-color)), linear-gradient(to top,
            var(--bg-color),
            transparent);
      ;
   }
}
</style>