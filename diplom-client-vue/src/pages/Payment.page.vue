<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import PaymentForm from '@components/functions/PaymentForm.vue';
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const appStore = useLayoutStore()

const route = useRoute()

onMounted(() => {
   appStore.searchView = 'hidden'
   appStore.footerView = false
})

onUnmounted(() => {
   appStore.footerView = true
   appStore.searchView = 'full'
})
</script>

<template>
   <div class="page">
      <PaymentForm :product="route.query.book as string" :price="Number(route.query.amount)" :prod-id="route.params.id as string" />
   </div>
</template>