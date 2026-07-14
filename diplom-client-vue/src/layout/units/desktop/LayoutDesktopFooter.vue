<template>
   <footer class="color-auto">
      <div class="footer-container ui-border">
         <div class="logo-container">
            <p class="title logo">Читать?<sup class="copyright">©</sup></p>
            <span class="prop text-xs">2026 - Все права защищены</span>
         </div>
         <nav class="link-container">
            <a :href="link.url" class="link" v-for="(link, idx) in layout.footerLinks" :key="idx">{{ link.name }}</a>
         </nav>
      </div>
   </footer>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@stores/layout';

const layout = useLayoutStore()
</script>

<style scoped>
@reference "tailwindcss";

footer {
   @apply px-10 pb-5;
}

.footer-container {
   @apply w-full flex p-4 justify-between items-center pointer-events-auto;
}

.logo {
   @apply text-nowrap text-3xl;
}

.copyright {
   @apply pl-1;
}

.link-container {
   @apply flex gap-5 justify-between flex-wrap;
}

.link {
   @apply underline;
}
</style>