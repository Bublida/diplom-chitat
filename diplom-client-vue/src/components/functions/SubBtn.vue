<template>
   <div class="btn btn-border subscribe sub-btn" :class="SUBSCRIBTION_STYLE[id as keyof typeof SUBSCRIBTION_STYLE].class" :title="`Выбрать тариф ${name}`">
      <slot />
      {{ name }}
   </div>
</template>

<script setup lang="ts">
import { SUBSCRIBTION_STYLE } from '@/api/styles';


defineProps<{
   name: string
   id: string
}>()
</script>

<style scoped>
@reference "tailwindcss";

.sub-btn {
   @apply flex justify-center gap-1 items-center;
}
</style>