<template>
   <button @click="toggleTheme()" class="btn btn-border">
      <slot>
         <Icon :icon="isDark ? 'mynaui:moon' : 'mynaui:sun'" class="color-auto"/>
      </slot>
   </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark({ initialValue: 'auto', valueDark: 'dark' });
const toggleTheme = useToggle(isDark);
</script>