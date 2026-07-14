<template>
   <footer class="color">
      <div class="top-line">
         <p class="title logo">Читать?<sup class="copyright">©</sup></p>
      </div>
      <nav class="link-container">
         <a :href="link.url" class="link" v-for="(link, idx) in layout.footerLinks" :key="idx">{{ link.name }}</a>
      </nav>
   </footer>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@stores/layout';

const layout = useLayoutStore()
</script>

<style scoped>
@reference "tailwindcss";

footer {
   @apply grid grid-cols-1 grid-rows-2 gap-1 p-2 relative;
}

.top-line {
   @apply text-center flex items-center gap-2;

   &::before {
      content: '';
      @apply w-full h-0.5 rounded-full;
      background: var(--color-main-text);
   }
   &::after {
      content: '';
      @apply w-full h-0.5 rounded-full;
      background: var(--color-main-text);
   }
}

.logo {
   @apply text-nowrap;
}

.copyright {
   @apply pl-1;
}

.link-container {
   @apply flex justify-between flex-wrap;
}

.link {
   @apply underline;
}
</style>