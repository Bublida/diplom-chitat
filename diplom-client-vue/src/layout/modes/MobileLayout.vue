<template>
   <div class="mobile-layout">
      <!-- Hat -->
      <transition name="showdown">
         <LayoutMobileHat v-if="layout.hatInfo" />
      </transition>

      <!-- Экран телефона -->
      <LayoutMobileScreen>
         <slot />
      </LayoutMobileScreen>

      <!-- Панель поиска -->
      <SearchTab v-if="layout.searchView === 'full'" />

      <!-- Нижняя панель навигации -->
      <LayoutMobileNavigation />
   </div>
</template>

<script setup lang="ts">
import LayoutMobileNavigation from '@layout/units/mobile/LayoutMobileNavigation.vue';
import LayoutMobileScreen from '@layout/units/mobile/LayoutMobileScreen.vue';
import LayoutMobileHat from '@layout/units/mobile/LayoutMobileHat.vue';
import SearchTab from '@layout/units/SearchTab.vue';
import { useLayoutStore } from '@stores/layout';
const layout = useLayoutStore()
</script>

<style scoped>
@reference "tailwindcss";

.mobile-layout {
   @apply w-screen h-screen p-2 flex flex-col gap-2;
   background: var(--color-base-100);
}
</style>