<template>
   <Modal v-if="isSeriesModal" @close-modal="closeSeriesModal">
      <h1 class="prop">Циклы, в которых состоит книга</h1>
      <div class="container my-2">
         <div class="container-vertical max-h-[30vh]">
            <router-link v-if="series" v-for="serie in series" :to="{ name: 'collection', params: { id: serie._id } }">
               <div class="ui-border series-badge color-auto">
                  <div>
                     <p class="prop sm-title">Книга из цикла</p>
                     <h3 class="prop">{{ serie.title }}</h3>
                  </div>
                  <Icon icon="mynaui:chevron-right" class="size-6" />
               </div>
            </router-link>
         </div>
      </div>
   </Modal>

   <Modal v-if="isNewComment" @close-modal="closeNewComment">
      <h1 class="prop">Новый комментариий</h1>
      <div class="container my-2">
         <div class="container-vertical">
            <p class="sm-title">Минимум 20 символов</p>
            <textarea type="text" class="input resize-none w-[70vw] h-50 m-1" v-model="newCommentData.text"
               placeholder="Комментарий" />
            <select v-model="newCommentData.score" class="input mx-1">
               <option value="like">Понравилась</option>
               <option value="flat">Равнодушно</option>
               <option value="dislike">Не понравилась</option>
            </select>
            <div class="flex gap-2 btn btn-border w-fit mx-auto">
               <label for="spoilers">Спойлеры</label>
               <input type="checkbox" id="spoilers" v-model="newCommentData.spoilers">
            </div>
         </div>
      </div>
      <template #actions>
         <button class="btn btn-border" @click="closeNewComment" title="Отмена">Отмена</button>
         <button class="btn btn-border" @click="saveNewComment" title="Отправить комментарий"
            v-if="newCommentData.text.length > 20">Отправить</button>
      </template>
   </Modal>

   <div class="page" v-if="data">
      <!-- Cover -->
      <div class="cover-container">
         <ImageFetch v-if="data.cover" :path="data.cover" :alt="`Обложка книги ${data.title}`" class="cover" />
         <div v-if="data.agelimit" class="agelimit-badge prop text-xl">{{ data.agelimit }}+</div>
         <template v-if="series">
            <div v-if="series.length > 1" class="ui-border series-badge cover-series-badge color-auto"
               :class="{ absolute: data.cover }" @click="isSeriesModal = true" title="Показать циклы">
               <div>
                  <p class="prop text-sm">Книга из циклов: {{ series.length }}</p>
               </div>
               <Icon icon="mynaui:chevron-right" class="size-6" />
            </div>
            <router-link v-else-if="series.length === 1" :to="{ name: 'collection', params: { id: series[0]._id } }">
               <div class="ui-border series-badge cover-series-badge color-auto" :class="{ absolute: data.cover }">
                  <div>
                     <p class="prop sm-title">Книга из цикла</p>
                     <h3 class="prop">{{ series[0].title }}</h3>
                  </div>
                  <Icon icon="mynaui:chevron-right" class="size-6" />
               </div>
            </router-link>
         </template>
      </div>
      <!-- Description -->
      <p class="prop text-center" v-if="data.description">{{ data.description }}</p>
      <!-- Tags -->
      <div class="container" v-if="data.tags">
         <div class="container-free">
            <div class="tag color" v-for="tag in data.tags">{{ tag }}</div>
         </div>
      </div>
      <!-- Library | Rating -->
      <div class="grid grid-cols-2 gap-2">
         <!--todo вставить ссылку на страницу библиотеки  -->
         <div class="ui-border">
            <p class="prop sm-title">Библиотека</p>
            <router-link :to="{ name: 'library', params: { id: data.library._id } }">
               <SubBtn :name="data.library.name" :id="data.library._id">
                  <Icon icon="mynaui:info-circle" class="size-5" style="color: var(--color-main-text)" />
               </SubBtn>
            </router-link>
         </div>
         <!--todo вставить хэш на комментарии снизу  -->
         <div class="ui-border flex flex-col" @click="$router.push({ hash: '#comments' })">
            <p class="prop sm-title">Отзывы</p>
            <div class="flex justify-between items-center h-full">
               <h1 class="prop color-auto text-[0.9rem]">{{ data.rating }} <span v-if="data.comments.length > 0">({{
                  data.comments.length }})</span></h1>
               <Icon icon="mynaui:chevron-right" class="size-6" />
            </div>
         </div>
      </div>
      <!-- Author -->
      <AuthorBar :data="data.author" v-if="data.author" />
      <!-- Additional Info -->
      <div class="ui-border grid grid-cols-1 row-auto gap-2 overflow-clip"
         :class="{ 'big-list': Object.values(data.additional).length > 2 && !isBigListOpen }" v-if="data.additional">
         <div v-if="data.additional.lang">
            <p class="prop sm-title">Язык</p>
            <h1 class="prop color-auto">{{ data.additional.lang }}</h1>
         </div>
         <div v-if="data.additional.publisher">
            <p class="prop sm-title">Издатель</p>
            <h1 class="prop color-auto">{{ data.additional.publisher }}</h1>
         </div>
         <div v-if="data.additional.year">
            <p class="prop sm-title">Год издания</p>
            <h1 class="prop color-auto">{{ data.additional.year }}</h1>
         </div>
         <Icon v-if="Object.values(data.additional).length > 2"
            :icon="isBigListOpen ? 'mynaui:chevron-up' : 'mynaui:chevron-down'" class="size-6 w-full"
            @click="toggleBigList" title="Развернуть/свернуть" />
      </div>
      <!-- Comments -->
      <h2 class="title" v-if="data.comments && data.comments.length > 0">Отзывы</h2>
      <div class="grid grid-cols-3 gap-2" id="comments">
         <template v-if="data.comments && data.comments.length > 0">
            <label class="btn btn-border text-nowrap" for="spoiler-btn">
               Спойлеры
               <input type="checkbox" v-model="spoilers" id="spoiler-btn">
            </label>
            <button class="btn btn-border col-span-2">Сначала отрицательные</button>
         </template>

         <button @click="isNewComment = true" class="btn btn-border col-span-3"
            v-if="appStore.userData && appStore.userData.books.findIndex((b: any) => b.bookid === data._id) != -1 && data.comments.findIndex((c: any) => c.user === appStore.userData._id) == -1">Написать
            комментарий</button>
         <!-- <button class="btn btn-border col-span-3">Редактировать комментариий</button> -->
         
      </div>
      <div class="container">
         <div class="container-vertical h-[40vh] rounded-xl scroll-hidden" v-if="data.comments && data.comments.length > 0">
            <div class="ui-border comment"
               v-for="(item, index) in (spoilers ? data.comments : data.comments.filter((b: any) => b.spoilers))"
               :key="index">
               <Icon :icon="COMMENT_ICON[item.score as keyof typeof COMMENT_ICON].icon" class="size-8"
                  :style="{ color: `var(${COMMENT_ICON[item.score as keyof typeof COMMENT_ICON].color})` }" />
               <div class="comment-body">
                  <p class="color-auto comment-text">{{ item.comment }}</p>
                  <div class="comment-bottom prop">
                     <p class="color-auto">{{ item.read ? 'Полностью прочитана' : 'Прочитана не полностью' }}</p>
                     <p class="color-auto"><span v-if="appStore.userData && item.user === appStore.userData._id">Ваш</span> {{ parseDate(item.datestamp) }}</p>
                  </div>
               </div>
            </div>
         </div>
         <h4 v-else class="section-title prop">Отзывов на книгу ещё нет 🧐</h4>
      </div>
   </div>
</template>

<script setup lang="ts">
import { getFullPath, parseDate, setPageBackground, setPageSubBackground } from '@api/cover';
import { $api, useApi } from '@api/composables/useApi';
import ImageFetch from '@components/ImageFetch.vue';
import { useLayoutStore } from '@stores/layout';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AuthorBar from '@/components/AuthorBar.vue';
import { Icon } from '@iconify/vue';
import Modal from '@/components/functions/Modal.vue';
import { useAppStore } from '@/stores/app';
import { useSubStyle } from '@/api/composables/useSubStyle';
import SubBtn from '@/components/functions/SubBtn.vue';
import { COMMENT_ICON } from '@/api/styles';
import { useDevice } from '@/api/composables/useDevice';

const route = useRoute()

const { data } = useApi({ base: 'query/book', query: { $idx: { field: '_id', id: route.params.id } }, first: true, screen: '-buys -bookmarks -__v -_autocomplete' })

const { data: series } = useApi({ base: 'query/collection', query: { $idx: { field: 'books', id: route.params.id }, type: 'Series' }, screen: '_id title' })

const isSeriesModal = ref(false)
const closeSeriesModal = () => isSeriesModal.value = false;

const appStore = useAppStore();

const spoilers = ref(true);

const device = useDevice();

const isNewComment = ref(false)
const closeNewComment = () => {
   isNewComment.value = false
}
const saveNewComment = async () => {
   await $api({
      base: 'mutation/comment',
      query: {
         user: appStore.userData._id,
         score: newCommentData.score,
         comment: newCommentData.text,
         //todo поменять поле lastpage на progress 
         read: appStore.userData.books.find((b: any) => b.bookid === data.value._id).lastpage > 80,
         spoilers: newCommentData.spoilers
      }
   }).then(async res =>{
      await $api({
         base: 'mutation/book',
         query: {
            _id: data.value._id,
            comments: [...data.value.comments, res[0]._id]
         }
      })
      window.location.reload()
   })
   closeNewComment();
}
const newCommentData = reactive({
   text: '',
   score: 'like',
   spoilers: true
})

const isBigListOpen = ref(false)
const toggleBigList = () => {
   isBigListOpen.value = !isBigListOpen.value
}

const layout = useLayoutStore()
watch(data, () => {
   if (data.value) {
      const { basecost, title, library } = data.value
      appStore.bookData = { basecost, title, library }
   }
   layout.hatInfo = {
      title: data.value.title,
      subtitle: data.value.author.shortname
   }
   if(device.value === 'mobile'){
      if (data.value.cover) {
         setPageBackground(`url('${encodeURI(getFullPath(data.value.cover))}')`)
      } else {
         setPageBackground(`var(${useSubStyle().value.var})`)
      }
   } else {
      setPageSubBackground();
   }
})

watch(route, () => {
   if (route.hash && route.hash.endsWith('comments')) {
      const el = document.querySelector('#comments');
      if (el) {
         el.scrollIntoView({ behavior: 'smooth' })
      }
   }
})

onMounted(() => {
   layout.searchView = 'half'
})

onUnmounted(() => {
   layout.hatInfo = undefined
   layout.searchView = 'full'
})
</script>

<style scoped>
@reference "tailwindcss";

.cover {
   /* mobile */
   @apply h-[75vh] rounded-xl outline-2;

   /* desktop */
   @apply lg:w-1/3;
   outline-color: var(--color-base-100);
}

.cover-container {
   @apply relative;
}

.series-badge {
   @apply flex justify-between items-center gap-2 py-2 px-3;
}

.cover-series-badge {
   @apply bottom-2 left-2;
}

.agelimit-badge {
   @apply size-15 absolute top-5 right-5 rounded-full flex justify-center items-center border-2 backdrop-blur-xs;
   border-color: var(--color-base-200);
   background: rgba(0, 0, 0, 0.2);
}

.big-list {
   &>:nth-child(n+3):not(:last-child) {
      @apply hidden;
   }
}

.comment {
   @apply flex gap-3;

   .comment-body {
      @apply flex flex-col min-h-20 w-full justify-between gap-4;

      .comment-text {
         @apply leading-4.5;
      }
   }

   .comment-bottom {
      @apply flex justify-between w-full text-xs;
   }
}
</style>