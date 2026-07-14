<template>
   <div class="page">
      <!-- Список популярных тегов -->
      <section>
         <h2 class="title color section-title" v-if="device === 'mobile'">Популярные теги</h2>
         <div class="container">
            <div :class="device === 'mobile' ? 'container-free' : 'flex gap-2 flex-wrap'">
               <p class="title color text-2xl relative h-0 -top-2 mr-5" v-if="device === 'desktop'">Популярные теги</p>
               <Tag v-if="tags" v-for="item in tags" :key="item.count" :link="{ name: 'catalog', query: { tags: item.tag } }">{{ item.tag }}</Tag>
            </div>
         </div>
      </section>

      <!-- Карусель популярных книг -->
      <Carousel v-if="books" :data="books">
         <template #default="{ item }">
            <BookHero :data="item" />
         </template>
      </Carousel>

      <!-- Книги по популярным тегам -->
      <section v-if="tags">
         <h2 class="title color section-title">{{ tags[0].tag }}</h2>
         <div class="container">
            <div class="container-horizontal scroll-hidden">
               <BookCard v-for="book in tagBooks_1" :data="book" />
            </div>
         </div>
      </section>
      <section v-if="tags">
         <h2 class="title color section-title">{{ tags[1].tag }}</h2>
         <div class="container">
            <div class="container-horizontal scroll-hidden">
               <BookCard v-for="book in tagBooks_2" :data="book" />
            </div>
         </div>
      </section>

      <!-- Популярные авторы -->
      <div class="container">
         <h2 class="title color section-title">Популярные авторы</h2>
         <div :class="device === 'desktop' ? 'desktop-grid-container' : 'container-vertical'" class="grid-cols-3">
            <AuthorBar :data="data.author" v-for="data in authors" :key="data.totalAuthorRating"/>
         </div>
      </div>

      <!-- Подписки -->
      <div class="container my-2">
         <div :class="device === 'desktop' ? 'desktop-grid-container' : 'container-vertical'" class="grid-cols-2">
            <!-- Subscribes -->
            <div v-if="subscibesData" v-for="(sub, index) in subscibesData" class="ui-border sub-badge min-h-full last:col-span-2"
               :class="SUBSCRIBTION_STYLE[sub._id as keyof typeof SUBSCRIBTION_STYLE].class" :key="index">
               <div>
                  <div class="flex justify-between">
                     <p class="title"><span class="font-normal not-italic">{{ sub.symbol }}</span> {{ sub.name }}</p>
                  </div>
                  <ul class="prop text-sm p-2">
                     <li v-if="sub.salepercent > 0" class="font-black">Скидка на все книги: {{ sub.salepercent }}%</li>
                     <li>Коллекций: {{ sub.lists.maxLists < 1 ? '∞' : sub.lists.maxLists }}</li>
                     <li>Книг в коллекции: {{ sub.lists.maxBooksInList < 1 ? '∞' : sub.lists.maxBooksInList }}</li>
                  </ul>
               </div>
               <h1 class="prop text-2xl absolute right-4 bottom-2">{{ sub.cost }} <span class="text-xs">₽/мес</span></h1>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { setPageSubBackground } from '@api/cover';
import Carousel from '@components/ItemsCarousel.vue';
import BookHero from '@components/BookHero.vue';
import { $api, useApi } from '@api/composables/useApi';
import { onMounted, ref, watch } from 'vue';
import BookCard from '@/components/BookCard.vue';
import AuthorBar from '@/components/AuthorBar.vue';
import { SUBSCRIBTION_STYLE } from '@/api/styles';
import { useDevice } from '@/api/composables/useDevice';
import Tag from '@/components/Tag.vue';

const device = useDevice();

const { data: tags } = useApi({ base: 'query/book', query: { 'book-most-tags': true } })
const { data: books } = useApi({ base: 'query/book', query: { 'book-most-rate': true } })
const { data: authors } = useApi({ base: 'query/book', query: { 'book-most-authors': true } })
const tagBooks_1 = ref<any[] | undefined>();
const tagBooks_2 = ref<any[] | undefined>();
const { data: subscibesData } = useApi({
   base: 'query/subscription',
   query: {
      $pipe: [{
         $match: {
            $expr: {
               $ne: ["$_id", { $toObjectId: '69dd2a351da95895fb2d9e06' }]
            }
         }
      }]
   }
})

watch(tags, async () => {
   if (tags.value.length > 1) {
      tagBooks_1.value = await $api({ base: 'query/book', query: { tags: tags.value[0].tag, $pipe: [{ $limit: device.value === 'desktop' ? 6 : 8 }] } })
      tagBooks_2.value = await $api({ base: 'query/book', query: { tags: tags.value[1].tag, $pipe: [{ $limit: device.value === 'desktop' ? 6 : 8 }] } })
   }
})

onMounted(() => {
   setPageSubBackground();
})
</script>

<style scoped>
@reference "tailwindcss";

.desktop-grid-container {
   @apply grid gap-2;
}
</style>