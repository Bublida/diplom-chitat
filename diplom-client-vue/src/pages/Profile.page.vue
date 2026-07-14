<template>
   <Modal v-if="isInviteModal" @close-modal="closeInvite">
      <h1 class="prop">Вход в группу/класс</h1>
      <form class="flex justify-center flex-col gap-2 py-1">
         <p class="sm-title">Узнайте Вступительный код у вашего учебного руководителя</p>
         <div v-if="inviteError" class="tag tag-error">{{ inviteError }}</div>
         <input class="input w-full" type="text" v-model="inviteCode" placeholder="Вступительный код" required>
      </form>
      <template #actions>
         <button class="btn btn-border" @click="closeInvite">Отмена</button>
         <button class="btn btn-border" @click="getInvite" :disabled="inviteCode.length <= 0">Войти</button>
      </template>
   </Modal>

   <Modal v-if="isClassModal" @close-modal="closeCreateClass">

      <h1 class="prop">Создание новой группы/класса</h1>
      <div class="container">
         <div class="container-vertical p-2">
            <input type="text" class="input" placeholder="Название (`11А`, `6в` или произвольное)" required
               v-model="formData.title">
            <input type="text" class="input" placeholder="Подзаголовок" required v-model="formData.subtitle">
            <div class="flex gap-2">
               <div v-for="(icon, idx) in appStore.collectionIcons" class="icon-badge"
                  :class="{ 'icon-badge-active': formData.icon === icon }">
                  <label :for="String(idx)">
                     <Icon :icon="icon" class="size-15" />
                  </label>
                  <input type="radio" :id="String(idx)" name="icon" :value="icon" v-model="formData.icon"
                     @click="() => { if (formData.icon === icon) formData.icon = '' }" hidden>
               </div>
            </div>
         </div>
      </div>


      <template #actions>
         <button class="btn btn-border" @click="closeCreateClass">Отмена</button>
         <button class="btn btn-border" @click="saveNewClass"
            :disabled="formData.subtitle == '' || formData.title == ''">Сохранить</button>
      </template>
   </Modal>

   <Modal v-if="isSubModal" @close-modal="closeSubModal">
      <h1 class="prop">Сменить уровень подписки</h1>
      <div class="container my-2">
         <div class="container-free max-w-[80vw]">
            <!-- Subscribes -->
            <div v-if="subscibesData" v-for="(sub, index) in subscibesData" class="ui-border sub-badge"
               :class="[SUBSCRIBTION_STYLE[sub._id as keyof typeof SUBSCRIBTION_STYLE].class, { active: selectedSub === index }]"
               @click="selectedSub = Number(index)">
               <div>
                  <div class="flex justify-between">
                     <p class="title"><span class="font-normal not-italic">{{ sub.symbol }}</span> {{ sub.name }}</p>
                     <p v-if="currentSub === index" class="prop uppercase">АКТИВНА</p>
                  </div>
                  <ul class="prop text-sm p-2">
                     <li v-if="sub.salepercent > 0" class="font-black">Скидка на все книги: {{ sub.salepercent }}%</li>
                     <li>Коллекций: {{ sub.lists.maxLists < 1 ? '∞' : sub.lists.maxLists }}</li>
                     <li>Книг в коллекции: {{ sub.lists.maxBooksInList < 1 ? '∞' : sub.lists.maxBooksInList }}</li>
                  </ul>
                  <h1 class="prop text-2xl text-right pr-2">{{ sub.cost }} <span class="text-xs">₽/мес</span></h1>
               </div>
            </div>
         </div>
      </div>
      <template #actions>
         <button class="btn btn-border" @click="closeSubModal">Отмена</button>
         <button v-if="selectedSub != currentSub" class="btn btn-border" @click="changeSub">Поменять</button>
      </template>
   </Modal>

   <div class="page lg:w-1/2 mx-auto">
      <div class="absolute left-0 top-0 p-2 lg:hidden">
         <ThemeChanger class="size-10" />
      </div>
      <div class="cover-container">
         <span class="cover-symbol">{{ appStore.userData.subscribe.type.symbol }}</span>
         <div class="cover-block" :class="{ 'bg-placeholder': !appStore.userData.photo }">
            <form id="newPhotoForm" ref="formRef"></form>
            <input form="newPhotoForm" type="file" accept="image/*" name="photo" @change="handleNewPhoto"
               class="new-photo-input" title="Загрузить новое фото профиля">
            <ImageFetch v-if="appStore.userData.photo" :path="appStore.userData.photo" :alt="`Фотография пользователя`"
               class="cover" />
            <Icon v-else icon="mynaui:camera" class="cover-placeholder" />
         </div>
      </div>

      <div>
         <h1 class="text-center title text-2xl">{{ `${appStore.userData.name} ${appStore.userData.surname}` }}</h1>
         <p class="tag w-fit mx-auto mt-2" v-if="appStore.userData.role === 'teacher'">Преподаватель</p>
      </div>

      <div class="ui-border color-auto">
         <span class="sm-title mb-2">Подписка активна</span>
         <SubBtn @click="openSubModal" :name="appStore.userData.subscribe.type.name"
            :id="appStore.userData.subscribe.type._id" />
      </div>

      <div class="ui-border color-auto">
         <span class="sm-title mb-2">Учебные группы</span>

         <div class="flex flex-col gap-2 mb-4" v-if="classesData">
            <router-link :to="{ name: 'class', params: { id: data._id } }"
               class="ui-border clickable w-full flex justify-between items-center" v-for="data in classesData">
               <div class="prop p-1">
                  <h1 class="">{{ data.title }}</h1>
                  <h2 class="sm-title">{{ data.subtitle }}</h2>
               </div>
               <Icon icon="mynaui:chevron-right" class="size-6" />
            </router-link>
         </div>

         <button v-if="appStore.userData.role === 'teacher'" class="btn btn-border w-full"
            @click="isClassModal = true">Создать
            группу</button>
         <button v-else class="btn btn-border w-full" @click="isInviteModal = true">Войти в группу</button>
      </div>

      <div class="ui-border color-auto">
         <span class="sm-title">Email</span>
         <p class="prop">{{ appStore.userData.email }}</p>
      </div>

      <button class="btn btn-border text-danger" @click="logout">Выйти из аккаунта</button>
   </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@stores/app';
import { logout, updateUserData } from '@api/authorization';
import ImageFetch from '@/components/ImageFetch.vue';
import { Icon } from '@iconify/vue';
import { onMounted, reactive, ref, watch } from 'vue';
import { $api } from '@/api/composables/useApi';
import SubBtn from '@/components/functions/SubBtn.vue';
import Modal from '@/components/functions/Modal.vue';
import { SUBSCRIBTION_STYLE } from '@/api/styles';
import { setPageSubBackground } from '@/api/cover';
import ThemeChanger from '@/layout/units/ThemeChanger.vue';
import type { Class } from '@/types/models';

const appStore = useAppStore();

const inviteCode = ref('');
const isInviteModal = ref(false);
const closeInvite = () => {
   isInviteModal.value = false;
}
const inviteError = ref<string>()
const getInvite = async () => {
   const res = await $api({ base: `api/class/invite/${inviteCode.value}`, token: true });
   if (res && res.message) {
      inviteError.value = res.message
      return;
   }
   await fetchClasses();
   closeInvite();
}

const classesData = ref<Class[] | undefined>()
const isClassModal = ref(false);
const closeCreateClass = () => {
   isClassModal.value = false;
}
const formData = reactive<{ icon?: string, title: string, subtitle: string }>({
   title: '',
   subtitle: ''
})
const saveNewClass = async () => {
   await $api({
      base: 'mutation/class',
      query: {
         title: formData.title.trim(),
         subtitle: formData.subtitle.trim(),
         icon: formData.icon,
         teacher: appStore.userData._id
      }
   })
   await fetchClasses();
   closeCreateClass();
}

onMounted(async () => {
   await fetchClasses();
})

const fetchClasses = async () => {
   if (appStore.userData) {
      const res = await $api({
         base: 'query/class',
         query: {
            $idx: {
               field: appStore.userData.role === 'teacher' ? "teacher" : "students",
               id: appStore.userData._id
            }
         }
      })
      if (res && res.length > 0) {
         classesData.value = res;
      }
   }
}

const subscibesData = ref<any>();
const isSubModal = ref(false)
const closeSubModal = () => isSubModal.value = false
const openSubModal = async () => {
   subscibesData.value = await $api({
      base: 'query/subscription',
      query: {
         $pipe: [{
            $match: {
               $expr: {
                  $ne: ["$_id", { $toObjectId: '69dd2a351da95895fb2d9e06' }]
               }
            }
         }]
      }
   })
   isSubModal.value = true
   currentSub.value = subscibesData.value.findIndex((s: any) => s._id === appStore.userData.subscribe.type._id)
   selectedSub.value = currentSub.value
}

const formRef = ref()
const selectedSub = ref(0);
const currentSub = ref(0);

const handleNewPhoto = async (ev: any) => {
   const fData = new FormData(formRef.value)
   fData.append('query', JSON.stringify({ _id: appStore.userData._id }))
   await $api({ base: 'mutation/user', fetchOptions: { body: fData } })
   window.location.reload()
}

const changeSub = async () => {
   await $api({
      base: 'mutation/user', query: {
         _id: appStore.userData._id,
         subscribe: {
            type: subscibesData.value[selectedSub.value]
         }
      }
   })
   window.location.reload()
}

onMounted(() => {
   setPageSubBackground();
})
</script>

<style scoped>
@reference "tailwindcss";

.cover-container {
   @apply relative mx-auto mt-5;
}

.cover-block {
   @apply overflow-clip size-50 border-8 rounded-full outline-2;

   &:hover::before {
      content: '';
      @apply bg-(--color-base-200) size-full absolute top-0 left-0 rounded-full opacity-50;
   }

   border-color: var(--color-base-100);
   outline-color: var(--color-base-200);
}

.cover-placeholder {
   @apply absolute top-1/2 left-1/2 -translate-1/2 size-25;
   color: var(--color-main-text);
   pointer-events: none;
}

.bg-placeholder {
   background: var(--color-base-300);
}

.cover {
   @apply size-full;
}

.cover-symbol {
   @apply absolute bottom-3 -rotate-12 right-3 text-4xl z-100;
}

.new-photo-input {
   @apply absolute top-0 left-0 size-full text-transparent cursor-pointer;
}

.sub-badge.active {
   @apply outline-2;
   outline-color: var(--color-base-300);
}

.icon-badge {
   @apply p-5 border-2 rounded-xl flex justify-center;
   border-color: var(--color-base-200);
}

.icon-badge-active {
   border-color: var(--color-base-300);
   background: var(--color-base-200);
}
</style>