<template>
   <template v-if="type === 'auto'">
      <MobileCard v-if="device === 'mobile'" :data="data" />
      <DesktopCard v-if="device === 'desktop'" :data="data" />
   </template>
   <MobileCard v-else-if="type === 'mobile'" :data="data" />
   <DesktopCard v-if="type === 'desktop'" :data="data" />
   <BarCard v-else-if="type === 'bar'" :data="data" :bought="bought" />
   <TileCard v-else-if="type === 'tile'" :data="data" />
</template>

<script setup lang="ts">
import type { BookCardType } from '@/types';
import MobileCard from './book-card-types/Mobile.card.vue';
import BarCard from './book-card-types/Bar.card.vue';
import { useDevice } from '@/api/composables/useDevice';
import TileCard from './book-card-types/Tile.card.vue';
import DesktopCard from './book-card-types/Desktop.card.vue';
import type { Book } from '@/types/models';

const device = useDevice()

withDefaults(
   defineProps<{
      bought?: boolean
      data: Book,
      type?: BookCardType
   }>(),
   {
      type: 'auto',
      bought: false
   }
)
</script>