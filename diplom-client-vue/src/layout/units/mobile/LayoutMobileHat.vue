<template>
   <div class="hat">
      <router-link :to="{ name: 'index' }" class="btn back-button">
         <Icon icon="mynaui:arrow-left" class="size-5" />
      </router-link>
      <div class="w-full color-auto">
         <h1 class="text-lg title">
            <Icon v-if="hatInfo?.icon" :icon="hatInfo?.icon" class="inline align-baseline"/>
            {{ hatInfo?.title }}
         </h1>
         <h4 class="text-xs prop">{{ hatInfo?.subtitle }}</h4>
      </div>

      <template v-if="route.name === 'collection' && userData">
         <ChangeCollection v-if="userData.collections.lists.includes(route.params.id) && collectionData && collectionData.type === 'List'" :collection-id="(route.params.id as string)"/>
         <FavouriteCollection v-else :collection-id="(route.params.id as string)"/>
      </template>
   </div>
</template>

<script setup lang="ts">
import ChangeCollection from '@/components/functions/ChangeCollection.vue';
import FavouriteCollection from '@/components/functions/FavouriteCollection.vue';
import { useAppStore } from '@/stores/app';
import { Icon } from '@iconify/vue';
import { useLayoutStore } from '@stores/layout';
import { useRoute } from 'vue-router';

const { userData, collectionData } = useAppStore()

const route = useRoute();

const { hatInfo } = useLayoutStore()
</script>

<style scoped>
@reference "tailwindcss";

.hat {
   @apply relative flex items-center gap-2 pr-4;
}
.back-button {
   @apply h-full w-fit flex items-center;
}

.title {
   line-height: 1em;
}
</style>