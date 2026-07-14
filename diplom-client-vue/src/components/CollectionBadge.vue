<template>
   <router-link :to="{ name: 'collection', params: { id: data._id } }" class="collection-badge">
      <div class="size-full" :class="{ 'base-bg': !data.cover || !data.color }" :style="{ 'background': data.color }">
         <ImageFetch v-if="data.cover" :path="data.cover" :style="{ '--bg-color': backColor }" class="cover" />
         <Icon v-if="data.icon && data.type === 'List'" :icon="data.icon" class="cover-icon" />
         <div class="info title" :style="{ 'font-weight': 'bolder' }">
            <span class="text-[0.7rem] opacity-70" v-if="data.type === 'Series'">Цикл книг</span>
            <p>{{ data.title }}</p>
         </div>
         <Icon icon="mynaui:chevron-right" class="icon" />
      </div>
   </router-link>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ImageFetch from './ImageFetch.vue';
import { getAverageColor } from '@/api/cover';
import { Icon } from '@iconify/vue';
import type { Collection } from '@/types/models';

const props = defineProps<{
   data: Collection
}>()

const backColor = ref('');

onMounted(async () => {
   if (props.data.cover) {
      const color = (await getAverageColor(props.data.cover))?.hex || '';
      backColor.value = color
   }
})
</script>

<style scoped>
@reference "tailwindcss";

.collection-badge {
   @apply relative border-2 rounded-xl overflow-clip nth-[3n]:last:col-span-2;
   border-color: var(--color-base-200);
}

.cover {
   @apply relative size-full;

   &::before {
      content: '';
      @apply absolute w-full h-1/2 bottom-0 left-0 rounded-xl;
      background: linear-gradient(to top,
            var(--bg-color),
            transparent);
   }
}

.info {
   @apply absolute bottom-0 left-0 p-3 leading-4;
}

.icon {
   @apply absolute right-3 bottom-3 size-6;
   color: var(--color-main-text);
}

.cover-icon {
   @apply absolute top-3 left-3 size-8;
   color: var(--color-main-text);
}

.base-bg {
   background: var(--color-base-300);
}
</style>