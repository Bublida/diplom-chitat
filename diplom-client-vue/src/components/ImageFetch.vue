<template>
   <div class="image-container">
      <img class="image" :src="fullPath" :alt="alt || ''">
   </div>
</template>

<script setup lang="ts">
import { getFullPath } from '@/api/cover';
import { computed } from 'vue';


const props = defineProps<{
   alt?: string,
   path: string
}>()

const fullPath = computed(() => getFullPath(props.path))

</script>

<style scoped>
@reference "tailwindcss";

.image-container {
   @apply overflow-hidden;
}

.image {
   @apply w-full h-full object-cover box-content object-center;
}
</style>