<template>
   <div @click="openSearch" class="search-tab" :class="{'cursor-text btn btn-border': !searchOpen, 'ui-border': searchOpen}">
      <form class="search-box" :class="{ 'pb-2': searchOpen }" @submit.prevent>
         <button v-if="searchOpen" @click.stop="closeSearch" type="button"
            class="absolute z-100 btn btn-border" :class="{ 'bottom-search': device === 'desktop', 'top-search': device === 'mobile' }">
            <Icon :icon="device === 'mobile' ? 'mynaui:chevron-down' : 'mynaui:chevron-up'" class="size-5" />
         </button>
         <Icon icon="mynaui:search" />
         <input v-if="searchOpen" v-model="prompt" type="search" name="prompt" class="search-input color-auto"
            ref="inputRef" placeholder="поиск" @input="handleInput">
         <span v-else class="search-placeholder">поиск</span>
      </form>
      <ul class="hint-container scroll-hidden" :class="{ 'open': searchOpen }">
         <transition-group name="show">
            <li class="color-auto hint" v-for="(hint, idx) in hints" :key="idx">
               <router-link :to="{ name: 'book', params: { id: hint._id } }">{{ hint.title }}</router-link>
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
import type { Author } from '@/types/models';

const DELAY = 300; // 300ms

const prompt = ref('');

const device = useDevice()

const searchOpen = ref(false);

const hints = ref<{author?: Author, title: string, _id: string}[] | undefined>();

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
   hints.value = await $api({
      base: 'query/book',
      query: { 'book-search': { prompt: prompt.value.trim(), limit: 6 } },
      screen: 'author title'
   });
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
</script>

<style scoped>
@reference "tailwindcss";

.search-tab {
   @apply flex flex-col py-1 px-2;
}

.search-box {
   @apply flex items-center w-full justify-center gap-2;
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
   @apply bottom-0 translate-y-1/3;
}
.top-search {
   @apply -translate-y-6;
}
</style>