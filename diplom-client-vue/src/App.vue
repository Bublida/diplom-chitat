<script setup lang="ts">
import Layout from '@layout/Layout.vue';
import { useDark } from '@vueuse/core';
import { useDevice } from './api/composables/useDevice';

useDark()
const device = useDevice()
</script>

<template>
  <div :class="{ 'desktop-page': device === 'desktop' }">
    <Layout>
      <router-view/>
    </Layout>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.desktop-page {
  background: var(--active-background);
  transition: color 0.5s ease-in;
}
</style>