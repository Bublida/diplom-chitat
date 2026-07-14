<script setup lang="ts">
import { $api, useApi } from '@/api/composables/useApi';
import { useDevice } from '@/api/composables/useDevice';
import { useFontScale } from '@/api/composables/useFontSize';
import { setPageBackground } from '@/api/cover';
import Modal from '@/components/functions/Modal.vue';
import ImageFetch from '@/components/ImageFetch.vue';
import { useAppStore } from '@/stores/app';
import { useReadStore } from '@/stores/read';
import { Icon } from '@iconify/vue';
import { useResizeObserver, useTextSelection, useSwipe } from '@vueuse/core';
import { nextTick, onBeforeUnmount, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const device = useDevice();

const appStore = useAppStore();
const readStore = useReadStore();

const { scale } = useFontScale();

const { data: dataInfo } = useApi({ base: 'query/book', first: true, query: { $idx: { field: '_id', id: route.params.id } } })

const fpageRef = ref(); // Ссылка на читалку непосредственно
const spageRef = ref(); // Ссылка на читалку непосредственно
const containerRef = ref(); // Ссылка на страницу

// Навигация колесиком мыши
const handleWheel = (e: WheelEvent) => {
   if (e.deltaY > 0) {
      readStore.handleNextPage();
   } else if (e.deltaY < 0) {
      readStore.handlePrevPage();
   }
};

// Навигация свайпами на мобильных устройствах
const swipeTarget = ref<HTMLElement | null>(null);
useSwipe(swipeTarget, {
   onSwipeLeft: () => readStore.handleNextPage(),
   onSwipeRight: () => readStore.handlePrevPage(),
   threshold: 50,
});

// Ключ для localStorage
const getStorageKey = () => {
   if (!route.params.id || !appStore.userData?._id) return null;
   return `book-tips-${route.params.id}_${appStore.userData._id}`;
};

// Загрузка закладок из localStorage
const loadTipsFromStorage = () => {
   const key = getStorageKey();
   if (!key) return [];
   try {
      const saved = localStorage.getItem(key);
      if (saved) {
         return JSON.parse(saved);
      }
   } catch (e) {
      console.error('Ошибка загрузки закладок:', e);
   }
   return [];
};

// Сохранение закладок в localStorage
const saveTipsToStorage = () => {
   const key = getStorageKey();
   if (!key) return;
   try {
      localStorage.setItem(key, JSON.stringify(readStore.tips));
   } catch (e) {
      console.error('Ошибка сохранения закладок:', e);
   }
};

const { text, selection, rects, ranges } = useTextSelection();
const isTipBtn = ref(false);
const isTipModal = ref(false);
const isEditModal = ref(false);
const closeTipModal = () => {
   isTipModal.value = false;
}
const closeEditModal = () => {
   isEditModal.value = false;
   readStore.setCurrentTipId(null);
}
const tip = ref('');
const tippedText = ref('');
const editComment = ref('');

const saveTip = async () => {
   if (!tippedText.value.trim() || !tip.value.trim()) return;
   
   // Проверяем, нет ли уже закладки с таким текстом
   const exists = readStore.tips.some(t => t.tip === tippedText.value.trim());
   if (exists) {
      closeTipModal();
      tip.value = '';
      tippedText.value = '';
      return;
   }
   
   readStore.addTip({
      tip: tippedText.value.trim(),
      comment: tip.value,
      pagelink: readStore.currentPage
   })
   await readStore.splitPages(containerRef.value)
   closeTipModal();
   tip.value = '';
   tippedText.value = '';
}

const handleTipClick = (e: MouseEvent) => {
   const tipSpan = (e.target as HTMLElement).closest('.reader-tip');
   if (tipSpan) {
      e.stopPropagation();
      const tipId = tipSpan.getAttribute('data-tip-id');
      const comment = tipSpan.getAttribute('data-reader-tip');
      if (tipId && comment) {
         readStore.setCurrentTipId(tipId);
         editComment.value = comment;
         isEditModal.value = true;
      }
   }
}

const saveEditedTip = async () => {
   if (!editComment.value.trim()) return;
   
   const currentTip = readStore.getTipById(readStore.currentTipId!);
   if (currentTip && currentTip.comment !== editComment.value) {
      readStore.editTip(readStore.currentTipId!, {
         comment: editComment.value
      });
      await readStore.splitPages(containerRef.value);
   }
   closeEditModal();
}

const deleteTip = async () => {
   readStore.removeTip(readStore.currentTipId!);
   await readStore.splitPages(containerRef.value);
   closeEditModal();
}
watchEffect(() => {
   const fpage = fpageRef.value;
   const spage = spageRef.value;
   const sel = selection.value;
   if (sel && (fpage || spage) && text.value.trim().length > 0) {
      const { anchorNode, focusNode } = sel;
      if (
         (fpage.contains(anchorNode) && fpage.contains(focusNode)) ||
         (spage.contains(anchorNode) && spage.contains(focusNode))
      ) {
         tippedText.value = sel.toString().trim();
         isTipBtn.value = true;
      }
   } else {
      isTipBtn.value = false;
   }
});

onMounted(async () => {
   if (
      (route.params.id &&
         appStore.userData.books) &&
      (appStore.userData.books.find((b: { bookid: string }) => b.bookid === route.params.id) ||
         route.query.access === 'class')
   ) {
      await readStore.fetchBookFile(route.params.id as string);
      await nextTick();
      if (containerRef.value) {
         await readStore.splitPages(containerRef.value)
         const bookData = appStore.userData.books.find((b: { bookid: string }) => b.bookid === route.params.id)
         console.log(bookData);
         if (bookData.progress > 0) {
            readStore.currentPage = Math.ceil((bookData.progress / 100) * readStore.totalPages);
         }
         console.log(readStore.currentPage);
      }
      setPageBackground(`var(--color-reader)`);
      readStore.scale = scale.value;
   } else {
      router.back();
   }
});
watch(scale, async () => {
   readStore.scale = scale.value;
   await nextTick();
   readStore.splitPages(containerRef.value)
});
useResizeObserver(containerRef, () => {
   if (readStore.fetchedHTML) {
      readStore.splitPages(containerRef.value)
   }
})

// Автосохранение закладок при изменении
watch(() => readStore.tips, () => {
   saveTipsToStorage();
}, { deep: true });

// Загрузка закладок при загрузке userData
watch(() => appStore.userData, (newUserData) => {
   if (newUserData?._id && route.params.id) {
      const savedTips = loadTipsFromStorage();
      if (savedTips.length > 0 && readStore.tips.length === 0) {
         readStore.tips = savedTips.map((t: any) => ({
            id: t.id || readStore.generateTipId(),
            tip: t.tip?.trim() || '',
            comment: t.comment,
            pagelink: t.pagelink || 1
         }));
      }
   }
}, { immediate: true });

// Перерисовка страниц при загрузке originalHTML, если есть закладки
watch(() => readStore.originalHTML, (newHtml) => {
   if (newHtml && readStore.tips.length > 0 && containerRef.value) {
      readStore.splitPages(containerRef.value);
   }
});

onBeforeUnmount(() => {
   readStore.tableOfContents = undefined
   saveTipsToStorage();
   $api({ base: 'api/progress', token: true, fetchOptions: { body: { bookid: dataInfo.value?._id, progress: readStore.progress } } })
})

onUnmounted(() => {
   readStore.originalHTML = undefined;
   readStore.fetchedHTML = undefined;
   readStore.pages = []
})
</script>

<template>
   <Modal v-if="isTipModal" @close-modal="closeTipModal">
      <h1 class="prop mb-2">Создание заметки</h1>
      <h3 class="prop text-sm">Фрагмент</h3>
      <div class="w-[50vw] md:w-[80vw] ui-border mb-2">
         <span class="line-clamp-2 leading-5">{{ tippedText }}</span>
      </div>
      <h3 class="prop text-sm">Текст заметки</h3>
      <textarea class="input resize-none w-full mb-2" placeholder="Текст заметки..." v-model="tip"></textarea>
      <template #actions>
         <button class="btn btn-border" @click="closeTipModal" :title="device === 'mobile' ? '' : 'Закрыть'" >Закрыть</button>
         <button class="btn btn-border" @click="saveTip" :title="device === 'mobile' ? '' : 'Сохранить заметку'" >Сохранить</button>
      </template>
   </Modal>

   <Modal v-if="isEditModal" @close-modal="closeEditModal">
      <h1 class="prop mb-2">Редактирование заметки</h1>
      <h3 class="prop text-sm">Текст заметки</h3>
      <textarea class="input resize-none w-full mb-2" placeholder="Текст заметки..." v-model="editComment"></textarea>
      <template #actions>
         <button class="btn btn-border text-danger" @click="deleteTip" :title="device === 'mobile' ? '' : 'Удалить заметку'" >Удалить</button>
         <button class="btn btn-border" @click="closeEditModal" :title="device === 'mobile' ? '' : 'Закрыть'" >Закрыть</button>
         <button class="btn btn-border" @click="saveEditedTip" :title="device === 'mobile' ? '' : 'Сохранить изменения'" >Сохранить</button>
      </template>
   </Modal>

   <div class="page" style="display: block; padding-block: 15vh;" ref="containerRef" @click="handleTipClick" @wheel.prevent="handleWheel">

      <nav class="fixed flex justify-between w-full pointer-events-none left-0 top-0 z-50">
         <div class="bg-btn-arrow" :class="{ 'mobile-nav': device === 'mobile' }">
            <button class="btn btn-border btn-arrow" @click="readStore.handlePrevPage" 
               v-if="readStore.currentPage > 1" 
               :title="device === 'mobile' ? '' : 'Предыдущая страница'">
               <Icon icon="mynaui:chevron-left" class="size-10" />
            </button>
         </div>
         <div class="bg-btn-arrow" :class="{ 'mobile-nav': device === 'mobile' }">
            <button class="btn btn-border btn-arrow" @click="readStore.handleNextPage"
               v-if="(readStore.currentPage <= readStore.totalPages && !readStore.isTwoWided) || (readStore.currentPage < readStore.totalPages && readStore.isTwoWided)"
               :title="device === 'mobile' ? '' : 'Следующая страница'">
               <Icon icon="mynaui:chevron-right" class="size-10" />
            </button>
         </div>
      </nav>

      <transition name="fadein">
         <div v-if="readStore.isLoading"
            class="ui-border absolute left-1/2 -translate-1/2 top-1/2 color-auto text-2xl prop">Загрузка...</div>
      </transition>

      <div class="reader color-auto" 
         :class="[readStore.isTwoWided && device === 'desktop' ? 'grid-cols-2' : 'grid-cols-1', { 'justify-items-center': !readStore.isTwoWided || device === 'mobile' }]"
         :style="`font-size: ${scale}rem`"
         ref="swipeTarget">
         <div
            v-if="readStore.fetchedHTML && (readStore.currentPage < readStore.totalPages || !readStore.isTwoWided) || readStore.pages.length < 1"
            class="reader-page" v-html="readStore.pages[readStore.currentPage - 1]"
            :class="{ 'w-[40vw]': !readStore.isTwoWided && device === 'desktop', 'w-[90vw]': device === 'mobile' }" ref="fpageRef"></div>
         <div v-if="readStore.fetchedHTML && readStore.isTwoWided && device === 'desktop'" class="reader-page w-[40vw]"
            v-html="readStore.pages[readStore.currentPage]" ref="spageRef"></div>
      </div>

         <div class="absolute top-1/2 left-1/2 -translate-1/2 text-center prop color-auto my-auto" v-if="
         readStore.fetchedHTML &&
         (readStore.currentPage > readStore.totalPages && !readStore.isTwoWided) || (readStore.currentPage >= readStore.totalPages && readStore.isTwoWided)
         && dataInfo">
         <p class="prop">Вы прочли</p>
         <ImageFetch v-if="dataInfo.cover" class="rounded-xl h-70 w-45 mx-auto my-5" :path="dataInfo.cover" />
         <h2 class="title text-5xl" :class="{ 'text-3xl': device === 'mobile' }">"{{ dataInfo.title }}"</h2>
         <h3 class="prop text-xl" :class="{ 'text-lg': device === 'mobile' }">{{ dataInfo.author.name }}</h3>
      </div>

      <!-- Tip btn -->
      <div class="absolute" :style="{
         left: `${(rects[0]?.x + rects[0].width + 15).toFixed()}px`,
         top: `${(rects[0].y).toFixed()}px`
      }" v-if="isTipBtn && rects[0]">
         <button class="btn btn-border size-10 flex justify-center items-center" @click="isTipModal = true" title="Создать заметку">
            <Icon icon="mynaui:plus" class="size-20" />
         </button>
      </div>

      <h1 class="tag tag-error ui-border" v-if="!readStore.isLoading && !readStore.fetchedHTML">Файл книги повреждён или
         отсутствует 😭</h1>

   </div>
</template>

<style scoped>
@reference "tailwindcss";

.bg-btn-arrow {
   @apply w-30 h-screen flex items-center px-5 hover:opacity-100 opacity-0 transition-opacity pointer-events-auto;
}

.mobile-nav {
   @apply w-1/3 md:w-30;
}

.btn-arrow {
   @apply size-full flex justify-center items-center h-1/4;
}

.reader {
   @apply grid grid-rows-1 gap-10 size-full;
}
</style>

<style>
[data-reader-tip] {
   background: var(--color-base-200);
}

.reader-tip {
   position: relative;
   cursor: pointer;
   transition: all 0.2s ease;
}

.reader-tip:hover {
   background: var(--color-base-200);
}

.reader-tip::after {
   content: attr(data-reader-tip);
   position: absolute;
   bottom: 100%;
   left: 50%;
   transform: translateX(-50%);
   background: var(--color-base-100);
   color: var(--color-auto);
   padding: 0.5rem 0.75rem;
   border-radius: 0.375rem;
   border: 2px solid var(--color-base-200);
   white-space: pre-wrap;
   max-width: 300px;
   font-size: 0.875rem;
   line-height: 1.25rem;
   opacity: 0;
   visibility: hidden;
   transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
   z-index: 100;
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.reader-tip:hover::after {
   opacity: 1;
   visibility: visible;
   transform: translateX(-50%) translateY(-4px);
}

.reader-page {
   display: flex;
   gap: 0.5rem;
   flex-direction: column;
   height: 70vh;
   width: 35vw;

   h1 {
      font-size: 2.5em;
   }

   h2 {
      font-size: 1.75em;
   }

   h3 {
      font-size: 1.25em;
   }

   h1,
   h2,
   h3 {
      text-align: center;
      line-height: 1em;
      margin-bottom: 0.8em;
   }

   :is(h1, h2, h3, h4, h5, h6):has(+ :is(h1, h2, h3, h4, h5, h6)) {
      margin-bottom: 0;
   }
}

.reader-text-08 {
   font-size: 0.8rem;
}

.reader-text-1 {
   font-size: 1rem;
}

.reader-text-12 {
   font-size: 1.2rem;
}

.reader-text-14 {
   font-size: 1.4rem;
}

.reader-text-16 {
   font-size: 1.6rem;
}

.reader-text-18 {
   font-size: 1.8rem;
}

.reader-text-2 {
   font-size: 2rem;
}
</style>