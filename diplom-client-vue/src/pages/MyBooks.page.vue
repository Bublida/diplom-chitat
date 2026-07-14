<template>
   <div class="page">

      <div class="ui-border container">
         <div class="grid grid-cols-6 gap-2">
            <input type="text" class="input w-full lg:col-span-5 color-auto" :class="{ 'lg:col-span-6': !canCreateCollection }" placeholder="Поиск" v-model="searchPrompt">
            <button v-if="canCreateCollection" class="btn btn-border prop" :class="subStyle.class" @click="createCollection">
               <Icon icon="mynaui:plus" class="size-6 mx-auto" style="color: var(--color-main-text)" />
            </button>
         </div>
      </div>

      <div class="container">
         <div class="collection-grid">
            <CollectionBadge :data="collection" v-if="collections" v-for="(collection, idx) in collections.filter((c: any) => c.title.toLowerCase().includes(searchPrompt.toLowerCase()))" :key="idx"/>
            <div v-if="!collections || collections.length < 2" class="collections-tip prop" @click="createCollection">
               <Icon icon="mynaui:plus" class="size-10" style="color: var(--color-main-text)" />
               Нажмите для создания коллекции
            </div>
         </div>
      </div>

      <div class="container">
         <div :class="{'container-vertical': device === 'mobile', 'container-desktop': device === 'desktop'}" v-if="books">
            <BookCard v-for="book in books.filter((b: any) => b.title.toLowerCase().includes(searchPrompt.toLowerCase()))" :data="book" type="bar"/>
         </div>
      </div>

   </div>
</template>

<script setup lang="ts">
import { useApi } from '@/api/composables/useApi';
import { useSubStyle } from '@/api/composables/useSubStyle';
import CollectionBadge from '@/components/CollectionBadge.vue';
import { useAppStore } from '@/stores/app';
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import BookCard from '@components/BookCard.vue';
import { setPageSubBackground } from '@/api/cover';
import { useDevice } from '@/api/composables/useDevice';

const appStore = useAppStore()

const { data: collections } = useApi({ base: 'query/collection', query: { $idx: { field: '_id', id: appStore.userData.collections.lists } }, screen: "-books" })
const { data: books } = useApi({ base: 'query/book', query: { $idx: { field: '_id', id: appStore.userData.books.map((i: any) => i.bookid) } } })

const subStyle = useSubStyle();

const router = useRouter()

const searchPrompt = ref('')

const device = useDevice()

const maxLimit = appStore.userData.subscribe.type.lists.maxLists  

const canCreateCollection = computed(() => {
   if(collections.value) {
      return maxLimit > 0 ? collections.value.length < maxLimit : true
   }
   return false
})

const createCollection = () => {
   router.push({ name: 'new-collection' })
}

const isModalShow = ref(false);
const closeModal = () => {
   isModalShow.value = false
}

onMounted(() => {
   setPageSubBackground();
})
</script>

<style scoped>
@reference "tailwindcss";

.collection-grid {
   /* mobile */
   @apply grid gap-2 grid-flow-row grid-cols-2;

   /* desktop */
   @apply lg:grid-cols-4;
   grid-auto-rows: 15vh;
}

.collections-tip {
   @apply nth-[1]:col-span-2 flex justify-center items-center flex-col text-sm text-center;
}

.container-desktop {
   @apply grid grid-cols-2 gap-2;
}
</style>