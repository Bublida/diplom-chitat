<template>
   <!-- Purchased -->
   <div v-if="purchased" class="book-bar color-auto ui-border" @click="$router.push({ name: 'read', params: { id: data._id }, query: { access: bought ? 'class' : 'false' } })" title="Читать книгу">
      <ImageFetch v-if="data.cover" :path="data.cover" class="cover" />
      <div v-else class="cover-placeholder">
         <h1 class="title text-lg color">{{ data.title }}</h1>
      </div>
      <div class="info-block">
         <div>
            <h2 class="prop text-xs" v-if="data.author">{{ data.author.shortname }}</h2>
            <h1 class="title text-xl">{{ data.title }}</h1>
         </div>
         <div class="container">
            <div class="container-start">
               <div class="tag custom-tag" v-for="tag in tags" :key="tag">{{ tag }}</div>
            </div>
         </div>
      </div>
   </div>
   <!-- Not purchased -->
   <router-link v-else :to="{ name: 'book', params: { id: data._id } }">
      <div class="book-bar-not-purchased color">
         <ImageFetch v-if="data.cover" :path="data.cover" class="small-cover" />
         <div class="small-info">
            <h2 class="prop text-xs" v-if="data.author">{{ data.author.shortname }}</h2>
            <h1 class="title text">{{ data.title }}</h1>
            <div class="container mt-1">
               <div class="container-start">
                  <div class="tag color" style="font-size: x-small;">{{ tags[0] }}</div>
               </div>
            </div>
         </div>
         <div class="buy-btn" v-if="appStore.isAuthorized">
            <BuyBtn v-if="!appStore.userData.books.find((b: any) => b.bookid === $route.params.id) &&
               data.library._id !== '69dd2a351da95895fb2d9e06'" :prod-id="data._id" :basecost="data.basecost"
               :title="data.title" class="col-span-3" />
            <p class="prop mr-2" v-else>Добавить</p>
         </div>
      </div>
   </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ImageFetch from '@components/ImageFetch.vue';
import { useAppStore } from '@stores/app';
import BuyBtn from '@components/functions/BuyBtn.vue';
import type { Book } from '@/types/models';
import { useDevice } from '@/api/composables/useDevice';

const device = useDevice()

const appStore = useAppStore();

const props = defineProps<{
   bought: boolean
   data: Book
}>()

const purchased = computed(() => {
   if(props.bought) return true;
   if (appStore.userData){
      return appStore.userData.books.find((i: {bookid: Book['_id']}) => i.bookid === props.data._id)
   } else {
      return false;
   }
})

const tags = computed(() => {
   return device.value === 'mobile' ? props.data.tags.filter((_, idx) => idx < 3) : props.data.tags
})
</script>

<style scoped>
@reference "tailwindcss";

.book-bar {
   @apply flex gap-2 p-2 cursor-pointer;
}

.cover {
   /* mobile */
   @apply h-[20vh] min-w-1/3 max-w-1/3 rounded-lg shadow-2xs border-2;

   /* desktop */
   @apply lg:min-w-30 lg:max-w-30;
   border-color: var(--color-base-300);
}

.info-block {
   @apply flex flex-col gap-2;
}

.custom-tag {
   @apply text-xs;
   color: var(--color-base-300);
   outline-color: var(--color-base-300);
}

.book-bar-not-purchased {
   @apply relative flex justify-stretch gap-2 p-2 border-2 rounded-xl;
}

.small-cover {
   @apply w-1/5 h-[12vh] rounded-lg border-2 lg:w-20;
}

.small-info {
   @apply flex flex-col;
}

.buy-btn {
   @apply absolute bottom-1 right-1 rounded-lg;
}

.cover-placeholder {
   /* mobile */
   @apply h-[20vh] min-w-1/3 rounded-lg flex items-center justify-center;

   /* desktop */
   @apply lg:min-w-30 lg:max-w-30;
   background: var(--color-base-300);
}
</style>