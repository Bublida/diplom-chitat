<template>
   <div class="carousel">
      <div ref="carouselItem" class="items-container">
         <transition-group name="swipe">
            <div v-for="(item, idx) in data" :key="idx" v-show="activeSlot === idx + 1" class="item">
               <slot :item="item" :index="idx" />
            </div>
         </transition-group>
      </div>
      <template v-if="slotsCount > 1 ">
         <div class="dot-nav" v-if="device === 'mobile'">
            <button class="nav" :class="{ 'active-nav': activeSlot === value }" :key="value" v-for="value in slotsCount"
               @click="activeSlot = value" :title="`Перейти к элементу ${value}`"></button>
         </div>
         <div class="nav-btns-container" v-else>
            <button class="btn btn-border btn-nav-arrow" @click="activeSlot -= 1" title="Предыдущий элемент">
               <Icon icon="mynaui:chevron-left" class="size-6"/>
            </button>
            <button class="btn btn-border btn-nav-arrow" @click="activeSlot += 1" title="Следующий элемент">
               <Icon icon="mynaui:chevron-right" class="size-6"/>
            </button>
         </div>
      </template>
   </div>
</template>

<script setup lang="ts">
import { useDevice } from '@/api/composables/useDevice';
import { Icon } from '@iconify/vue';
import { useSwipe } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
   data: any[]
}>();

const device = useDevice()

const carouselItem = ref()

const { isSwiping, direction } = useSwipe(carouselItem)



watch(isSwiping, () => {
   if (isSwiping.value) {
      if (direction.value === 'left') {
         activeSlot.value += 1
      } else if (direction.value === 'right') {
         activeSlot.value -= 1
      }
   }
})

const slotsCount = computed(() => props.data.length)

const activeSlot = ref(1)
watch(activeSlot, (newSlotNum) => {
   if (newSlotNum > slotsCount.value) {
      activeSlot.value = 1
   } else if (newSlotNum < 1) {
      activeSlot.value = slotsCount.value
   }
})
</script>

<style>
@reference "tailwindcss";

.carousel {
   @apply relative overflow-visible flex flex-col;
}

.items-container {
   @apply flex w-full;
}

.item {
   @apply w-full;
}

.dot-nav {
   @apply flex gap-4 w-full justify-center z-10 py-1 mt-2 top-0;
}

.nav {
   @apply rounded-full size-2 shadow-lg;
   background: var(--color-base-100);
}

.active-nav {
   @apply scale-180;
}

.nav-btns-container {
   @apply absolute flex justify-between pointer-events-none top-1/2 w-full -translate-y-1/2 z-100;
}

.btn-nav-arrow {
   @apply size-12 rounded-full flex justify-center items-center pointer-events-auto;
}
</style>