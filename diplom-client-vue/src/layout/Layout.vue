<script setup lang="ts">
import { useDevice } from '@api/composables/useDevice';
import MobileLayout from '@layout/modes/MobileLayout.vue';
import DesktopLayout from '@layout/modes/DesktopLayout.vue';

const deviceMode = useDevice()
</script>

<template>
   <MobileLayout v-if="deviceMode === 'mobile'">
      <slot />
   </MobileLayout>
   <DesktopLayout v-else>
      <slot />
   </DesktopLayout>
</template>