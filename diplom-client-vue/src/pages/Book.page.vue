<template>
   <DesktopPage v-if="device === 'desktop'"/>
   <MobilePage v-else/>
</template>

<script setup lang="ts">
import { useDevice } from '@/api/composables/useDevice';
import DesktopPage from './Book/Desktop.page.vue';
import MobilePage from './Book/Mobile.page.vue';

const device = useDevice()
</script>