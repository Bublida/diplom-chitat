<script setup lang="ts">
import { useSubStyle } from '@/api/composables/useSubStyle';
import { useAppStore } from '@/stores/app';
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import SubBtn from '@/components/functions/SubBtn.vue';
import SearchTab from '../SearchTab.vue';
import ThemeChanger from '../ThemeChanger.vue';
import { useReadStore } from '@/stores/read';
import { useFontScale } from '@/api/composables/useFontSize';
import { useToggle } from '@vueuse/core';

const appStore = useAppStore();
const readStore = useReadStore();

const btnStyle = useSubStyle()

const isHeaderOpen = ref(false)

const bookmarkNavigate = computed(() => {
   return appStore.isAuthorized ? { name: 'bookmarks' } : { name: 'login' };
})

const { increase, decrease, reset, scale } = useFontScale();

const [isContentMenu, switchContentMenu] = useToggle(false)
const [isBookmarksMenu, switchBookmarksMenu] = useToggle(false)
</script>

<template>
   <header class="pointer-events-none">
      <!-- Обычный хеддер -->
      <div class="ui-border header-container" v-if="$route.name !== 'read'">
         <router-link :to="{ name: 'index' }">
            <h1 class="title hover:scale-110 transition-transform text-2xl" :style="{ color: `var(${btnStyle.flat})` }">
               Читать?</h1>
         </router-link>

         <div class="w-full mx-5 lg:mx-30 flex gap-2">
            <div class="flex items-center">
               <router-link :to="{ name: 'catalog' }" class="flex btn btn-border items-center justify-center prop">
                  Каталог
               </router-link>
            </div>
            <SearchTab class="w-full" />
            <div class="flex items-center">
               <div class="size-9 flex">
                  <ThemeChanger />
               </div>
            </div>
         </div>

         <div class="flex gap-5 items-center">
            <template v-if="appStore.isAuthorized">
               <router-link :to="{ name: 'mybooks' }">
                  <Icon icon="mynaui:book-open" class="anchor-icon"
                     :class="{ 'outline-2': $route.name === 'mybooks' }" />
               </router-link>
               <router-link :to="bookmarkNavigate">
                  <Icon icon="mynaui:bookmark" class="anchor-icon"
                     :class="{ 'outline-2': $route.name === 'bookmarks' }" />
               </router-link>
            </template>
            <router-link v-else :to="{ name: 'profile' }">
               <SubBtn name="Вход / Регистрация" :id="'69bb5fe8eddf54bccfde9576'" class="text-nowrap" />
            </router-link>
            <router-link :to="{ name: 'profile' }">
               <Icon icon="mynaui:user" class="anchor-icon" :class="{ 'outline-2': $route.name === 'profile' }" />
            </router-link>
         </div>
      </div>

      <!-- Хеддер для режима чтения -->
      <div class="ui-border header-container-read" v-else>
         <router-link :to="{ name: 'index' }">
            <h1 class="title hover:scale-110 transition-transform text-2xl" :style="{ color: `var(${btnStyle.flat})` }">
               Читать?</h1>
         </router-link>

         <template v-if="isHeaderOpen">
            <div class="size-10 flex">
               <!-- <SearchTab class="w-full" /> -->
               <ThemeChanger />
            </div>

            <div class="flex gap-5 items-center">
               <router-link :to="{ name: 'mybooks' }">
                  <Icon icon="mynaui:book-open" class="anchor-icon" />
               </router-link>
               <router-link :to="bookmarkNavigate">
                  <Icon icon="mynaui:bookmark" class="anchor-icon" />
               </router-link>
   
               <router-link :to="{ name: 'profile' }">
                  <Icon icon="mynaui:user" class="anchor-icon" />
               </router-link>
            </div>
         </template>

         <button class="btn size-10 flex justify-center items-center" :class="{ 'ml-5': isHeaderOpen }" @click="isHeaderOpen = !isHeaderOpen">
            <Icon :icon="isHeaderOpen ? 'mynaui:chevron-left' : 'mynaui:chevron-right'" class="size-6"/>
         </button>
      </div>
      <!-- Панель за основным хеддером -->
      <template v-if="isHeaderOpen && $route.name === 'read'">
         <div class="flex gap-2 pl-2 pointer-events-auto w-full">
            <div class="ui-border flex gap-2 items-center">
               <button class="btn btn-border size-10" @click="decrease"><Icon icon="mynaui:minus"/></button>
               <button class="color-auto prop btn w-15" @click="reset">x{{ scale.toLocaleString() }}</button>
               <button class="btn btn-border size-10" @click="increase"><Icon icon="mynaui:plus"/></button>
            </div>

            <button class="btn btn-border size-15" @click="readStore.switchTwoWided">
               <div class="size-10 flex justify-center items-center">
                  <Icon :icon="readStore.isTwoWided ? 'mynaui:book-open' : 'mynaui:book'" class="size-6"/>
               </div>
            </button>
            
            <!-- <button class="btn btn-border size-15 flex justify-center items-center">
               <div class="ui-border size-10" :style="{ 'background-color': readStore.pageColor }"></div>
            </button> -->
            
            <button class="ui-border flex justify-center items-center w-full">
               <span class="w-15 text-left prop color-auto">{{ readStore.progress }}%</span>
               <input type="range" v-model="readStore.currentPage" :max="readStore.totalPages" :min="1">
            </button>
            
            <button class="btn btn-border size-15" @click="() => switchContentMenu()" v-if="readStore.tableOfContents">
               <div class="size-10 flex justify-center items-center">
                  <Icon :icon="isContentMenu ? 'mynaui:x' :  'mynaui:menu'" class="size-6"/>
               </div>
            </button>

            <button class="btn btn-border size-15" @click="() => switchBookmarksMenu()" v-if="readStore.tips.length > 0">
               <div class="size-10 flex justify-center items-center">
                  <Icon :icon="isBookmarksMenu ? 'mynaui:x' :  'mynaui:bookmark'" class="size-6"/>
               </div>
            </button>

         </div>
         
         <transition name="show">
            <div class="relative" v-if="isBookmarksMenu && readStore.tips.length > 0">
               <div class="absolute ui-border right-0 top-[110%] pointer-events-auto color-auto w-80">
                  <ul class="prop">
                     <li v-for="(bookmark, idx) in readStore.tips" 
                        @click="readStore.currentPage = bookmark.pagelink"
                        class="cursor-pointer hover:underline px-2 line-clamp-1" :key="idx"
                        >– {{ bookmark.comment }}</li>
                  </ul>
               </div>
            </div>
         </transition>

         <transition name="show">
            <div class="relative" v-if="isContentMenu && readStore.tableOfContents">
               <div class="absolute ui-border right-0 top-[110%] pointer-events-auto color-auto w-80">
                  <ul class="prop">
                     <li v-for="(head, idx) in readStore.tableOfContents" 
                        @click="readStore.currentPage = head.pagelink"
                        class="cursor-pointer hover:underline px-2 line-clamp-1" :key="idx"
                        >– {{ head.title }}</li>
                  </ul>
               </div>
            </div>
         </transition>
      </template>
   </header>
</template>

<style scoped>
@reference "tailwindcss";

header {
   @apply fixed px-10 pt-5 flex w-full z-1000;
}

.header-container {
   @apply w-full flex py-2 px-4 justify-between items-center pointer-events-auto;
}

.header-container-read {
   @apply flex py-2 px-4 justify-between items-center pointer-events-auto gap-5;
}

.anchor-icon {
   @apply rounded-lg size-8 p-1;
   outline-color: var(--color-base-200);
}
</style>