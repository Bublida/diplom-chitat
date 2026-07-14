<template>
   <router-link :to="link">
      <div class="tag" :class="{'tag-link': link}">
         <slot/>
      </div>
   </router-link>
</template>

<script setup lang="ts">
defineProps<{
   link: string | import('vue-router').RouteLocationAsRelativeGeneric | import('vue-router').RouteLocationAsPathGeneric
}>()
</script>