<template>
   <Modal v-if="isIconModal" @close-modal="closeIconModal">
      <template #default>
         <h1 class="prop">Выберите иконку</h1>
         <div class="icon-grid">
            <div v-for="(icon, idx) in appStore.collectionIcons" class="icon-badge"
               :class="{ 'icon-badge-active': formData.icon === icon }">
               <label :for="String(idx)">
                  <Icon :icon="icon" class="size-15" />
               </label>
               <input type="radio" :id="String(idx)" name="icon" :value="icon" v-model="formData.icon"
                  @click="() => { if (formData.icon === icon) formData.icon = '' }" hidden>
            </div>
         </div>
      </template>
      <template #actions>
         <button class="btn btn-border" @click="closeIconModal">Сохранить</button>
      </template>
   </Modal>

   <Modal v-if="isColorModal" @close-modal="closeColorModal">
      <template #default>
         <h1 class="prop">Выберите цвет</h1>
         <div class="color-container">
            <div class="color" :style="{ background: rgb }"></div>
            <input type="range" class="" :min="0" :max="255" v-model="colorData.r">
            <input type="range" class="" :min="0" :max="255" v-model="colorData.g">
            <input type="range" class="" :min="0" :max="255" v-model="colorData.b">
         </div>
      </template>
      <template #actions>
         <button class="btn btn-border" @click="closeColorModal">Отмена</button>
         <button class="btn btn-border" @click="saveColor">Сохранить</button>
      </template>
   </Modal>

   <div class="page">
      <BackBtn />
      <div class="ui-border container color-auto">
         <div class="container-vertical p-1">
            <input class="input" type="text" placeholder="Название" v-model="formData.name">
            <div class="flex gap-2">
               <input type="color" hidden v-if="device === 'desktop'" ref="colorPickRef" v-model="formData.color">
               <button class="btn btn-border w-full" @click="handlePickColor">
                  <div class="rounded-lg size-full" v-if="formData.color" :style="{ background: formData.color }">
                  </div>
                  <span v-else>Цвет обложки</span>
               </button>
               <button class="btn btn-border w-1/3 lg:size-20" @click="isIconModal = true">
                  <span v-if="!formData.icon">Иконка</span>
                  <Icon v-else :icon="formData.icon" class="inline align-middle size-5" />
               </button>
            </div>
         </div>
      </div>
      <div class="ui-border container book-container" v-if="books">
         <div class="flex gap-2">
            <input type="text" class="input color-auto w-full" placeholder="Поиск" v-model="searchPrompt">
            <p class="prop my-auto pr-2 color-auto text-nowrap">{{ formData.books.length }}/{{
               maxLimit > 0 ? maxLimit : "∞" }}</p>
         </div>
         <div class="container-vertical h-[55vh]">
            <div class="book-grid">
               
               <div class="book" :class="{ 'book-choosen': formData.books.includes(book._id) }"
                  @click="toggleBook(book._id)"
                  v-for="(book, idx) in books.filter((b: any) => b.title.toLowerCase().includes(searchPrompt.toLowerCase()))"
                  :key="idx" >
                  <BookCard :data="book" type="tile"/>
               </div>
            </div>
         </div>
      </div>

      <button class="btn btn-border" v-if="submitCondition" @click="handleSubmit">Сохранить</button>
      <p class="prop text-center" v-else>Добавьте как минимум 1 книгу и напишите название коллекции</p>
   </div>
</template>

<script setup lang="ts">
import { $api, useApi } from '@/api/composables/useApi';
import { useDevice } from '@/api/composables/useDevice';
import { setPageSubBackground } from '@/api/cover';
import BackBtn from '@/components/BackBtn.vue';
import BookCard from '@/components/BookCard.vue';
import Modal from '@/components/functions/Modal.vue';
import { useAppStore } from '@/stores/app';
import { useLayoutStore } from '@/stores/layout';
import { Icon } from '@iconify/vue';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const appStore = useAppStore()

const route = useRoute()
const router = useRouter()

const device = useDevice()

const isRedact = ref(route.query.mode == 'change' && route.query.id != undefined)

const { data: books } = useApi({ base: 'query/book', query: { $idx: { field: '_id', id: appStore.userData.books.map((i: any) => i.bookid) } }, screen: '-additional -lang -year -adapts -_autocomplete -agelimit' })

const submitCondition = computed(() =>
   formData.books.length > 0 && formData.name != ''
)

const colorPickRef = ref<HTMLInputElement | null>(null)

const maxLimit = appStore.userData.subscribe.type.lists.maxBooksInList

const handlePickColor = () => {
   if(device.value === 'mobile'){
      isColorModal.value = true
   } else if(colorPickRef.value) {
      colorPickRef.value.click()
   }
}

const handleSubmit = async () => {
   if (isRedact.value) {
      await $api({
         base: 'mutation/collection',
         query: {
            _id: route.query.id,
            title: formData.name,
            icon: formData.icon,
            color: formData.color,
            books: formData.books
         }
      })
   } else {
      await $api({
         base: 'mutation/collection',
         query: {
            title: formData.name,
            icon: formData.icon,
            color: formData.color,
            type: 'List',
            books: formData.books
         }
      }).then(async res => await $api({
         base: 'api/collection',
         fetchOptions: {
            body: {
               collection: res[0]._id
            }
         },
         token: true
      })).catch(err => console.error(err))
   }
   router.push({ name: 'mybooks' })
}

const toggleBook = (id: string) => {
   if (formData.books.includes(id)) {
      formData.books.splice(formData.books.findIndex(b => b === id), 1)
   } else if (maxLimit > 0 ? formData.books.length < maxLimit : true) {
      formData.books.push(id);
   }
}

const searchPrompt = ref('')

const layout = useLayoutStore();
const formData = reactive<{
   name: string,
   icon?: string,
   color?: string,
   books: string[]
}>({
   name: '',
   books: []
})

const colorData = reactive({
   r: 15,
   g: 15,
   b: 15
})

const rgb = computed(() => `rgb(${colorData.r}, ${colorData.g}, ${colorData.b})`)

const isIconModal = ref(false)
const closeIconModal = () => {
   isIconModal.value = false
}

const isColorModal = ref(false)
const closeColorModal = () => {
   isColorModal.value = false
}
const saveColor = () => {
   formData.color = rgb.value
   closeColorModal()
}

onMounted(async () => {
   setPageSubBackground();
   layout.hatInfo = {
      title: isRedact.value ? "Редактирование коллекции" : "Создание коллекции"
   }
   if (isRedact.value) {
      console.log('Redact!')
      const { title, books, color, icon } = (await $api({ base: 'query/collection', query: { $idx: { field: '_id', id: route.query.id }, $pop: 'false' } }))[0]
      formData.name = title
      formData.books = books
      formData.color = color
      formData.icon = icon
   }
})

onUnmounted(() => {
   layout.hatInfo = undefined
})
</script>

<style scoped>
@reference "tailwindcss";

.icon-badge {
   @apply p-5 border-2 rounded-xl flex justify-center;
   border-color: var(--color-base-200);
}

.icon-badge-active {
   border-color: var(--color-base-300);
   background: var(--color-base-200);
}

.icon-grid {
   @apply grid grid-cols-3 gap-2 py-2;
}

.color {
   @apply border-2 h-25 rounded-md w-50;
   border-color: var(--color-base-200);
}

.color-container {
   @apply flex flex-col gap-2 my-2;
}

.book-container {
   @apply p-2;
}

.book-grid {
   /* mobile */
   @apply grid grid-cols-3 gap-2 mt-3 p-1;

   /* desktop */
   @apply lg:grid-cols-8;
}

.book {
   @apply outline-2 p-1 rounded-xl;
   outline-color: var(--color-base-200);
}

.book-choosen {
   background: var(--color-base-200);
   outline-color: var(--color-base-300);
}
</style>