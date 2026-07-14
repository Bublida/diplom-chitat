<template>
   <div class="page">
      <BackBtn/>
      <div v-if="library" class="text-center mt-5">
         <h1 class="prop">Библиотека</h1>
         <p class="title uppercase text-4xl">{{ library.name }}</p>
      </div>
      <div class="container">
         <div class="container-free">
            <BookCard v-for="book in books" :data="book" />
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { setPageBackground } from '@api/cover';
import BookCard from '@components/BookCard.vue';
import { useApi } from '@api/composables/useApi';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { SUBSCRIBTION_STYLE } from '@/api/styles';
import BackBtn from '@/components/BackBtn.vue';

const route = useRoute()
const { data: library } = useApi({ base: 'query/subscription', first: true, query: { $idx: { field: '_id', id: route.params.id } } })
const { data: books } = useApi({ base: 'query/book', query: { $idx: { field: 'library', id: route.params.id } } })

onMounted(() => {
   setPageBackground(`var(${SUBSCRIBTION_STYLE[route.params.id as keyof typeof SUBSCRIBTION_STYLE].var})`)
})
</script> 

<style scoped>
@reference "tailwindcss";


</style>