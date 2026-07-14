<template>
   <div @click="openSearch" class="search-tab" title="Поиск тегов"
      :class="{ 'cursor-text btn btn-border': !searchOpen, 'ui-border': searchOpen }">
      <form class="search-box" :class="{ 'pb-2': searchOpen, 'h-full': !searchOpen }" @submit.prevent>
         <button v-if="searchOpen" @click.stop="closeSearch" type="button" class="absolute z-1000 btn btn-border bottom-search" title="Свернуть поиск">
            <Icon icon="mynaui:chevron-up" class="size-5" />
         </button>
         <Icon icon="mynaui:search" />
         <input v-if="searchOpen" v-model="prompt" type="search" name="prompt" class="search-input color-auto"
            ref="inputRef" placeholder="теги" @input="handleInput">
         <span v-else class="search-placeholder">теги</span>
      </form>
      <ul class="hint-container scroll-hidden" :class="{ 'open': searchOpen }">
         <transition-group name="show">
            <li v-if="hints && hints[0]" class="color-auto hint btn" v-for="(hint, idx) in hints" :key="idx" :class="{'border-2 border-(--color-base-300)': appStore.searchFilters.tags.includes(hint)}">
               <div @click="hintToggle(hint)">{{ hint }}</div>
            </li>
         </transition-group>
      </ul>
   </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { $api } from '@api/composables/useApi';
import { nextTick, ref } from 'vue';
import { useDevice } from '@/api/composables/useDevice';
import { useAppStore } from '@/stores/app';

const DELAY = 300; // 300ms

const prompt = ref('');

const device = useDevice()
const appStore = useAppStore();

const searchOpen = ref(false);

const hints = ref<string[] | undefined>();

const inputRef = ref();
const timeout = ref();

const handleInput = () => {
   if (timeout.value) {
      clearTimeout(timeout.value)
   }
   timeout.value = setTimeout(() => searchHint(), DELAY)
}

const searchHint = async () => {
   if (prompt.value === "") return;
   const res = await $api({
      base: 'query/book',
      query: { 'book-tag-search': { prompt: prompt.value.trim(), limit: 6 } }
   });
   if(res && res[0]){
      hints.value = res[0].tags.filter((tag: string) => !appStore.searchFilters.tags.includes(tag));
   }
   timeout.value = null;
}

const openSearch = async () => {
   searchOpen.value = true;
   await nextTick();
   inputRef.value.focus();
}

const closeSearch = () => {
   searchOpen.value = false;
   hints.value = undefined;
   prompt.value = '';
}

const hintToggle = (hint: string) => {
   appStore.searchFilters.tags.includes(hint) 
   ? appStore.searchFilters.tags=appStore.searchFilters.tags.filter(tag => tag!=hint) 
   : appStore.searchFilters.tags.push(hint);
}
</script>

<style scoped>
@reference "tailwindcss";

.search-tab {
   @apply flex flex-col py-1 px-2 relative;
}

.search-box {
   @apply flex items-center justify-center w-full gap-2;
}

.search-placeholder {
   font-family: var(--font-prop);
   color: var(--color-content);
}

.search-input {
   @apply w-full outline-0;
}

.hint-container {
   @apply h-0 overflow-scroll;
   transition: height 0.3s ease;
}

.hint-container.open {
   @apply h-30 flex flex-col gap-2;
}

.hint {
   a {
      @apply block;
   }
}

.bottom-search {
   @apply bottom-1 left-1/2 -translate-x-1/2;
}
</style>