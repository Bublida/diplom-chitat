<template>
  <div class="flex">
    <template v-if="store.authorized === false">
      <AuthPanel />
    </template>
    <template v-else>
      <div class="w-screen h-screen flex">
        <RouterView />
        <WorkTab />
      </div>
    </template>
  </div>

</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import WorkTab from '@components/WorkTab.vue';
import { useAppStore } from './stores/app';
import AuthPanel from './components/AuthPanel.vue';

const store = useAppStore()

</script>