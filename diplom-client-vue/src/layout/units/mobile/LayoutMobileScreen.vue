<script setup lang="ts">
import BuyBtn from '@/components/functions/BuyBtn.vue';
import { useLayoutStore } from '@/stores/layout';
import LayoutMobileFooter from '@layout/units/mobile/LayoutMobileFooter.vue';
import { useRoute } from 'vue-router';
import SearchTab from '../SearchTab.vue';
import { useAppStore } from '@/stores/app';
import Bookmark from '@/components/functions/Bookmark.vue';
import { useScroll } from '@vueuse/core';
import { ref } from 'vue';
import { SUBSCRIBTION_STYLE } from '@/api/styles';
import { purchaseBook } from '@/api/authorization';

const layout = useLayoutStore()

const route = useRoute()

const appStore = useAppStore()

const screenRef = ref()
const { y: scrollY } = useScroll(screenRef)
</script>

<template>
   <section class="mobile-screen scroll-hidden" ref="screenRef" :style="{ '--el-top': `${scrollY}px` }" :class="{ 'book-page': route.name === 'book' }">
      <!-- Page -->
      <div class="relative z-10">
         <slot />
      </div>
      <LayoutMobileFooter v-if="layout.footerView" class="relative z-5" />

      <!-- Bottom Menu -->
      <div v-if="route.name === 'book' && layout.isAnyModalOpen === false" class="bottom-panel" ref="bottomPanelRef">
         <div class="search" v-if="layout.searchView === 'half'">
            <SearchTab />
         </div>
         <div class="btn-container" v-if="appStore.isAuthorized && appStore.bookData">
            <template v-if="!appStore.userData.books.find((b: any) => b.bookid === route.params.id) && appStore.bookData.library._id !== '69dd2a351da95895fb2d9e06'">
               <button class="btn btn-border">
                  <Bookmark :book-id="(route.params.id as string)" />
               </button>
               <BuyBtn :basecost="appStore.bookData.basecost" :title="appStore.bookData.title"
                  :prod-id="(route.params.id as string)" />
            </template>
            <!--todo Сделать чтобы добавлялось -->
            <button v-else-if="appStore.bookData.library._id === '69dd2a351da95895fb2d9e06'" class="btn btn-border title color" :style="{ background: `var(${SUBSCRIBTION_STYLE[appStore.bookData.library._id as keyof typeof SUBSCRIBTION_STYLE].var})` }" @click="purchaseBook($route.params.id as string)">Добавить</button>
            <button v-else class="btn btn-border title">Читать!</button>
         </div>
      </div>

   </section>
</template>

<style scoped>
@reference "tailwindcss";

.mobile-screen {
   @apply rounded-xl overflow-y-scroll w-full h-full overscroll-none relative;
   background: var(--active-background);
   background-position: center;
   background-repeat: no-repeat;
   background-size: cover;
}

.book-page::after {
   content: '';
   @apply absolute size-full left-0 z-0 backdrop-blur-md;
   top: var(--el-top, 0);
   background: rgba(0, 0, 0, 0.5);
}

.bottom-panel {
   @apply sticky grid grid-cols-2 items-end bottom-0 mt-2 z-10;
   background: linear-gradient(to top,
         rgba(0, 0, 0, 0.5),
         transparent);
}

.search {
   @apply pr-2 pt-2 rounded-tr-xl relative h-full;
   background: var(--color-base-100);

   &::before {
      content: '';
      @apply absolute top-0 left-0 -translate-y-[95%] -translate-x-[5%];
      background: var(--color-base-100);
      height: calc(var(--radius-xl) + 1px);
      width: calc(var(--radius-xl) + 1px);
      mask: radial-gradient(circle at top right,
            transparent var(--radius-xl),
            black var(--radius-xl));
   }

   &::after {
      content: '';
      @apply absolute bottom-0 right-0 translate-x-[95%];
      background: var(--color-base-100);
      height: calc(var(--radius-xl) + 1px);
      width: calc(var(--radius-xl) + 1px);
      mask: radial-gradient(circle at top right,
            transparent var(--radius-xl),
            black var(--radius-xl));
   }
}

.btn-container {
   @apply flex gap-1 justify-end pr-1 pb-1 z-1000;
}
</style>