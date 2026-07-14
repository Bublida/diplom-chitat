<script setup lang="ts">
import LayoutDesktopHeader from '../units/desktop/LayoutDesktopHeader.vue';
import LayoutDesktopFooter from '../units/desktop/LayoutDesktopFooter.vue';
</script>

<template>
   <div>
      <LayoutDesktopHeader />
      <slot />
      <LayoutDesktopFooter v-if="$route.name != 'read'" />
   </div>
</template>