<template>
   <template v-if="appStore.isAuthorized">
      <Icon v-if="device === 'mobile'" :icon="bookmarked ? 'mynaui:bookmark-solid' : 'mynaui:bookmark'"
         @click="changeBookmark" class="bookmark" :class="{ 'bookmark-active': bookmarked }"
         :style="{ '--sub-color': `var(${subStyle.flat})` }" :title="bookmarked ? 'Удалить из закладок' : 'Добавить в закладки'" />
      <button v-else class="btn btn-border flex justify-center items-center" style="padding: 0;" @click="changeBookmark" :title="bookmarked ? 'Удалить из закладок' : 'Добавить в закладки'">
         <Icon :icon="bookmarked ? 'mynaui:bookmark-solid' : 'mynaui:bookmark'" class="bookmark"
            :class="{ 'bookmark-active': bookmarked }" :style="{ '--sub-color': `var(${subStyle.flat})` }" />
      </button>
   </template>
</template>

<script setup lang="ts">
import { $api } from '@/api/composables/useApi';
import { useDevice } from '@/api/composables/useDevice';
import { useSubStyle } from '@/api/composables/useSubStyle';
import { useAppStore } from '@/stores/app';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const appStore = useAppStore()

const props = defineProps<{
   bookId: string
}>()

const subStyle = useSubStyle()

const device = useDevice()

const bookmarked = computed(() => appStore.userData.collections.liked.includes(props.bookId))

const changeBookmark = async () => {
   $api({
      base: 'api/marks',
      fetchOptions: {
         body: {
            mark: props.bookId
         }
      },
      token: true
   }).then(newMarks => appStore.userData.collections.liked = newMarks)
}
</script>

<style scoped>
@reference "tailwindcss";

.bookmark {
   @apply size-6 rounded-xl hover:cursor-pointer;
   color: var(--color-base-content);
}

.bookmark-active {
   color: var(--sub-color);
}
</style>