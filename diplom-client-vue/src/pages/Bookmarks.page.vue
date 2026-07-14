<template>
   <div class="page">
      <h1 class="title section-title mt-5">Ваши закладки</h1>
      <div class="container">
         <div class="container-free">
            <BookCard v-for="book in marks" :data="book" />
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { setPageSubBackground } from '@/api/cover';
import { useApi } from '@api/composables/useApi';
import BookCard from '@components/BookCard.vue';
import { useAppStore } from '@stores/app';
import { onMounted } from 'vue';

onMounted(() => {
   setPageSubBackground();
})

const appStore = useAppStore()
const { data: marks } = useApi({ base: 'query/book', query: { $idx: { field: '_id', id: appStore.userData.collections.liked } } })
</script>