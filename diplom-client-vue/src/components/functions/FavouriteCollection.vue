<template>
   <Icon v-if="appStore.isAuthorized" :icon="favourited ? 'mynaui:star-solid' : 'mynaui:star'" @click="changeFavourite"
      class="favourite" :class="{ 'favourite-active': favourited }" :style="{ '--sub-color': `var(${subStyle.flat})` }" :title="favourited ? 'Убрать из избранного' : 'Добавить в избранное'" />
</template>

<script setup lang="ts">
import { $api } from '@/api/composables/useApi';
import { useSubStyle } from '@/api/composables/useSubStyle';
import { useAppStore } from '@/stores/app';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const appStore = useAppStore()

const props = defineProps<{
   collectionId: string
}>()

const subStyle = useSubStyle()

const favourited = computed(() => appStore.userData.collections.lists.includes(props.collectionId))

const changeFavourite = async () => {
   $api({
      base: 'api/collection',
      fetchOptions: {
         body: {
            collection: props.collectionId
         }
      },
      token: true
   }).then(newLists => appStore.userData.collections.lists = newLists)
}
</script>

<style scoped>
@reference "tailwindcss";

.favourite {
   @apply size-7 rounded-xl;
   color: var(--color-base-300);
}

.favourite-active {
   color: var(--sub-color);
}
</style>