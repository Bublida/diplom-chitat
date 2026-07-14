<template>
   <router-link :to="{ name: 'pay', query: { amount: cost.sale, book: title }, params: { id: prodId } }" v-if="useAppStore().isAuthorized">
      <div class="ui-border cost-badge" :class="[subStyle.class, customClass]">
         <span class="tag color-auto percent" v-if="cost.percent > 0 && device === 'mobile'">-{{ cost.percent }}%</span>
         <p class="cost prop">{{ cost.sale }} ₽</p>
         <p class="desktop-percent prop" v-if="device === 'desktop'">
            <span class="block">-{{ cost.percent }}%</span>
            <span class="line-through block percent-base-cost">{{ cost.base }}</span>
         </p>
      </div>
   </router-link>
</template>

<script setup lang="ts">
import { useDevice } from '@/api/composables/useDevice';
import { useSubStyle } from '@/api/composables/useSubStyle';
import { useAppStore } from '@stores/app';
import { computed } from 'vue';

const device = useDevice()

const props = defineProps < {
   prodId: string,
   basecost: number,
   title: string
   customClass?: string
} > ()

const cost = computed(() => {
   const { salepercent } = useAppStore().userData.subscribe.type
   const salecost = Math.round(props.basecost * (100 - salepercent) / 100);
   return { base: props.basecost, sale: salecost, percent: salepercent }
})

const subStyle = useSubStyle();
</script>

<style scoped>
@reference "tailwindcss";

.cost-badge {
   @apply relative flex items-center flex-col px-4;
   &:has(.percent){
      @apply pt-3.5;
   }
   &:has(.desktop-percent){
      @apply flex-row justify-center gap-1;
   }
}

.cost {
   @apply font-black;
}

.percent {
   @apply absolute -translate-1/2 left-1/2 top-0;
   background: var(--color-base-100);
}

.base-cost {
   @apply line-through text-xs leading-1;
}

.desktop-percent{
   @apply text-[0.6rem] font-black leading-2.5;
   .percent-base-cost {
      color: var(--color-base-100);
      @apply font-medium;
   }
}
</style>