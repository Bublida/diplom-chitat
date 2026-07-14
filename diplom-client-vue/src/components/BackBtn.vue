<template>
   <button v-if="device === 'desktop'" @click="$router.back()"
      class="col-span-3 cursor-pointer hover:underline w-fit" title="Вернуться назад">
      <div class="flex color gap-2 items-center prop">
         <Icon icon="mynaui:chevron-left" class="size-5" style="color: var(--color-main-text)" />
         <span>Назад</span>
      </div>
   </button>
</template>

<script setup lang="ts">
import { useDevice } from '@/api/composables/useDevice';
import { Icon } from '@iconify/vue';

const device = useDevice()
</script>