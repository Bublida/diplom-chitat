<template>

   <Modal v-if="isAddModal && booksToAdd" @close-modal="closeAddModal">
      <h1 class="prop">Добавление книг</h1>
      <div class="book-grid">

         <div class="book" :class="{ 'book-choosen': booksToAdd.includes(book._id) }" @click="toggleBook(book._id)"
            v-for="(book, idx) in teacherBooks" :key="idx">
            <BookCard :data="book" type="tile" />
         </div>

      </div>
      <template #actions>
         <button class="btn btn-border" @click="submitAddBooks">{{ data.books.length > 0 ? "Изменить" : "Добавить"
            }}</button>
         <button class="btn btn-border" @click="closeAddModal">Отмена</button>
      </template>
   </Modal>

   <Modal v-if="isDeleteModal" @close-modal="closeDeleteModal">
      <h1 class="prop">Удалить</h1>
      <p class="my-2">Вы точно хотите удалить класс "{{ data.title }}"?</p>
      <template #actions>
         <button class="btn btn-border" @click="deleteClass">Удалить</button>
         <button class="btn btn-border" @click="closeDeleteModal">Отмена</button>
      </template>
   </Modal>

   <Modal v-if="isExitModal" @close-modal="closeExitModal">
      <h1 class="prop">Выйти</h1>
      <p class="my-2">Вы точно хотите выйти из класса "{{ data.title }}"?</p>
      <template #actions>
         <button class="btn btn-border" @click="submitExit">Выйти</button>
         <button class="btn btn-border" @click="closeExitModal">Отмена</button>
      </template>
   </Modal>

   <div class="page" v-if="data">
      <!-- Back-button -->
      <BackBtn />
      <template v-if="data">

         <nav class="ui-border color-auto flex justify-between" style="padding: 0.75rem;">
            <div class="flex flex-col gap-1">
               <h2 class="sm-title">{{ isTeacher ? 'Вы учитель' : 'Вы ученик' }}</h2>
               <div>
                  <h1 class="prop text-2xl">{{ data.title }}</h1>
                  <h3 class="prop text-sm" v-if="data.subtitle && data.subtitle !== ''">{{ data.subtitle }}</h3>
               </div>
            </div>
            <div v-if="isTeacher" class="flex gap-1">
               <div class="grid grid-rows-2 gap-1">
                  <div class="btn size-10 btn-border flex justify-center items-center" v-if="appStore.isAuthorized"
                     @click="openAddModal">
                     <Icon :icon="data.books.length > 0 ? 'mynaui:pencil' : 'mynaui:plus'" class="size-10" />
                  </div>
                  <div class="btn size-10 btn-border flex justify-center items-center" v-if="appStore.isAuthorized"
                     @click="isDeleteModal = true">
                     <Icon icon="mynaui:trash" class="size-10" />
                  </div>
               </div>
               <div class="ui-border prop flex flex-col">
                  <p class="sm-title select-none">Пригласительный код</p>
                  <p class="m-auto text-xl">{{ data.inviteLink }}</p>
               </div>
            </div>
            <button v-else class="btn size-10 btn-border flex justify-center items-center" v-if="appStore.isAuthorized"
               @click="isExitModal = true">
               <Icon icon="mynaui:logout" class="size-10" />
            </button>

         </nav>

         <section class="container">
            <div class="flex w-full gap-10 scroll-hidden">
               <div class="flex flex-col gap-2 prop items-center">
                  <Avatar :path="data.teacher.photo" />
                  <div class="text-center">
                     <h1>{{ isTeacher ? "Вы" : `${data.teacher.name[0]}. ${data.teacher.surname}` }}</h1>
                     <p class=" mt-1 text-xs">Учитель</p>
                  </div>
               </div>
               <div class="flex flex-col gap-2 prop items-center" v-for="stu in data.students" v-if="data.students">
                  <Avatar :path="stu.photo" />
                  <h1>{{ appStore.userData._id === stu._id ? "Вы" : `${stu.name[0]}. ${stu.surname}` }}</h1>
               </div>
            </div>
         </section>
         <div class="grid grid-cols-2 gap-2">
            <BookCard v-for="book in data.books" :data="book" :type="'bar'" :bought="true" />
         </div>

         <!-- <pre>{{ data }}</pre> -->
      </template>
   </div>
</template>

<script setup lang="ts">
import Modal from '@/components/functions/Modal.vue';
import { $api, useApi } from '@/api/composables/useApi';
import { useDevice } from '@/api/composables/useDevice';
import { setPageSubBackground } from '@/api/cover';
import Avatar from '@/components/Avatar.vue';
import BackBtn from '@/components/BackBtn.vue';
import ImageFetch from '@/components/ImageFetch.vue';
import { useAppStore } from '@/stores/app';
import { useLayoutStore } from '@/stores/layout';
import type { Book, Collection } from '@/types/models';
import { Icon } from '@iconify/vue';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BookCard from '@/components/BookCard.vue';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const isTeacher = ref(appStore.userData.role === 'teacher')
const teacherBooks = ref<Book[] | undefined>()

const toggleBook = (id: string) => {
   if (booksToAdd.value === undefined) return;
   if (booksToAdd.value.includes(id)) {
      booksToAdd.value.splice(booksToAdd.value.findIndex(b => b === id), 1)
   } else {
      booksToAdd.value.push(id);
   }
}
const booksToAdd = ref<string[] | undefined>();
const isAddModal = ref(false);
const closeAddModal = () => {
   isAddModal.value = false
   booksToAdd.value = undefined;
};
const openAddModal = () => {
   isAddModal.value = true
   booksToAdd.value = data.value.books.map((b: Book) => b._id);
};
const submitAddBooks = async () => {
   if (booksToAdd) {
      await $api({
         base: 'mutation/class',
         query: {
            _id: data.value._id,
            books: booksToAdd.value
         }
      })
      await refetch();
   }
   closeAddModal();
}


const isExitModal = ref(false);
const closeExitModal = () => isExitModal.value = false;
const submitExit = async () => {
   await $api({
      base: 'api/class/exit',
      fetchOptions: {
         body: {
            classid: data.value._id
         }
      },
      token: true
   })
   router.push({ name: 'profile' });
}

const isDeleteModal = ref(false);
const closeDeleteModal = () => isDeleteModal.value = false;
const deleteClass = async () => {
   await $api({
      base: 'delete/class',
      query: {
         _id: data.value._id
      }
   })
   router.push({ name: 'profile' });
}

const { data, refetch } = useApi({ base: 'query/class', first: true, query: { $idx: { field: '_id', id: route.params.id } } })
watch(data, async () => {
   console.log(data)
   if (data.value.teacher._id !== appStore.userData._id) {
      isTeacher.value = false;
   }
})

// watch(isTeacher, async (newVal) => {
// }, { immediate: true })

onMounted(async () => {
   setPageSubBackground();
   if (isTeacher.value) {
      teacherBooks.value = await $api({ base: 'query/book', query: { $idx: { field: '_id', id: appStore.userData.books.map((b: any) => b.bookid) } } })
      console.log()
   }
})
</script>

<style scoped>
@reference "tailwindcss";

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