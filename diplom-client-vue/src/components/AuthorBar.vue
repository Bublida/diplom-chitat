<template>
   <router-link :to="{ name: 'author', params: { id: data._id } }">
      <div class="author-bar" :style="{ '--bg-color': avgColor }">
         <div class="author-naming">
            <p class="prop color">Автор</p>
            <h2 class="title color">{{ data.name }}</h2>
         </div>
         <ImageFetch v-if="data.photo" :path="data.photo" :alt="data.name" class="photo" />
      </div>
   </router-link>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ImageFetch from './ImageFetch.vue';
import { getAverageColor } from '@/api/cover';
import type { Author } from '@/types/models';

const props = defineProps<{
   data: Author
}>()

const avgColor = ref('transparent')

onMounted(async () => {
   if(props.data.photo){
      avgColor.value = (await getAverageColor(props.data.photo))?.hex ?? ''
   } else {
      avgColor.value = 'var(--color-base-300)';
   }
})

</script>

<style scoped>
@reference "tailwindcss";

.author-bar {
   @apply h-15 rounded-xl shadow-lg border-2 overflow-clip relative flex items-center lg:h-40 lg:hover:scale-110 lg:hover:z-100 transition-transform;
   border-color: var(--color-base-100);
   background: var(--bg-color);
}

.author-naming {
   @apply relative z-10 pl-4 w-full;

   p {
      @apply text-xs;
   }

   h2 {
      @apply text-sm lg:text-xl lg:w-3/5;
   }
}

.photo {
   @apply w-1/3 lg:w-1/2 h-full absolute right-0 top-0;

   &::before {
      content: '';
      @apply absolute top-0 right-0 size-full;
      background: linear-gradient(to right,
            var(--bg-color),
            transparent);
   }
}


</style>