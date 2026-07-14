<template>
   <Modal v-if="isDeleteModal" @close-modal="closeDeleteModal">
      <h1 class="prop">Удалить</h1>
      <p class="my-2">Вы точно хотите удалить коллекцию?</p>
      <template #actions>
         <button class="btn btn-border" @click="deleteCollection" title="Удалить коллекцию">Удалить</button>
         <button class="btn btn-border" @click="closeDeleteModal" title="Отмена">Отмена</button>
      </template>
   </Modal>

   <div class="flex gap-4">
      <router-link :to="{ name: 'new-collection', query: { mode: 'change', id: useAppStore().collectionData?._id } }" class="btn" v-if="appStore.isAuthorized" title="Редактировать коллекцию">
         <Icon icon="mynaui:pencil" class="size-7" />
      </router-link>
      <div class="btn" v-if="appStore.isAuthorized" title="Удалить коллекцию">
         <Icon icon="mynaui:trash" class="size-7" @click="isDeleteModal = true" />
      </div>
   </div>
</template>

<script setup lang="ts">
import { $api } from '@/api/composables/useApi';
import { useAppStore } from '@/stores/app';
import { Icon } from '@iconify/vue';
import { ref } from 'vue';
import Modal from './Modal.vue';

const appStore = useAppStore()

const props = defineProps<{
   collectionId: string
}>()

const isDeleteModal = ref(false)
const closeDeleteModal = () => isDeleteModal.value = false

const deleteCollection = async () => {
   await $api({
      base: 'delete/collection',
      query: {
         _id: props.collectionId
      }
   }).then(async () => {
      await $api({
         base: 'api/collection',
         fetchOptions: {
            body: {
               collection: props.collectionId
            }
         },
         token: true
      })
   }).catch(err => console.error(err))
   window.location.href = '/my-books'
}

</script>

<style scoped>
@reference "tailwindcss";
</style>