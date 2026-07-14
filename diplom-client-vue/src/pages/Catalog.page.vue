<template>
   <div class="page">
      <div class="ui-border flex gap-1">
         <div class="container">
            <div class="container-vertical p-1 color-auto">
               <div class="grid grid-cols-2 gap-2">
                  <TagsSearchTab />
                  <AuthorsSearchTab />
               </div>
               <div class="grid grid-cols-2 gap-2">
                  <div class="container-start"
                     v-if="appStore.searchFilters.tags && appStore.searchFilters.tags.length > 0">
                     <div @click="tagToggle(tag)" class="tag tag-link cursor-pointer"
                        v-for="tag in appStore.searchFilters.tags">{{ tag }}</div>
                  </div>
                  <div v-else></div>
                  <p v-if="appStore.searchFilters.author" class="prop">{{ appStore.searchFilters.author?.name }}</p>
               </div>
            </div>
         </div>
         <button class="btn btn-border p-1" @click="appStore.clearFilters">
            <Icon icon="mynaui:x" />
         </button>
         <button class="btn btn-border p-1" @click="searchWithFilters">
            <Icon icon="mynaui:search" />
         </button>
      </div>

      <template v-if="!searchedBooks">
         <section>
            <div class="container">
               <div :class="device === 'mobile' ? 'container-free' : 'flex gap-2 flex-wrap'">
                  <Tag v-if="tags" v-for="item in tags" :key="item.count"
                     :link="{ name: 'catalog', query: { tags: item.tag } }">{{ item.tag }}</Tag>
               </div>
            </div>
         </section>

         <!-- Популярные авторы -->
         <div class="container">
            <div :class="device === 'desktop' ? 'desktop-grid-container' : 'container-vertical'" class="grid-cols-3">
               <AuthorBar :data="data.author" v-for="data in authors" :key="data.totalAuthorRating" />
            </div>
         </div>

         <!-- Книги по популярным тегам -->
         <template v-if="tags">
            <section v-if="tags[0]">
               <h2 class="title color section-title">{{ tags[0].tag }}</h2>
               <div class="container">
                  <div class="container-horizontal scroll-hidden">
                     <BookCard v-for="book in tagBooks_1" :data="book" />
                  </div>
               </div>
            </section>
            <section v-if="tags[1]">
               <h2 class="title color section-title">{{ tags[1].tag }}</h2>
               <div class="container">
                  <div class="container-horizontal scroll-hidden">
                     <BookCard v-for="book in tagBooks_2" :data="book" />
                  </div>
               </div>
            </section>
            <section v-if="tags[2]">
               <h2 class="title color section-title">{{ tags[2].tag }}</h2>
               <div class="container">
                  <div class="container-horizontal scroll-hidden">
                     <BookCard v-for="book in tagBooks_3" :data="book" />
                  </div>
               </div>
            </section>
            <section v-if="tags[3]">
               <h2 class="title color section-title">{{ tags[3].tag }}</h2>
               <div class="container">
                  <div class="container-horizontal scroll-hidden">
                     <BookCard v-for="book in tagBooks_4" :data="book" />
                  </div>
               </div>
            </section>
            <section v-if="tags[4]">
               <h2 class="title color section-title">{{ tags[4].tag }}</h2>
               <div class="container">
                  <div class="container-horizontal scroll-hidden">
                     <BookCard v-for="book in tagBooks_5" :data="book" />
                  </div>
               </div>
            </section>
         </template>
      </template>

      <div class="container" v-else-if="searchedBooks.length > 0">
         <div class="container-free">
            <BookCard :data="book" v-for="book in searchedBooks" />
         </div>
      </div>

      <h1 v-else>Книг с такими фильтрами не найдены</h1>

   </div>
</template>

<script setup lang="ts">
import { setPageSubBackground } from '@api/cover';
import { $api, useApi } from '@api/composables/useApi';
import { onMounted, reactive, ref, watch } from 'vue';
import BookCard from '@/components/BookCard.vue';
import AuthorBar from '@/components/AuthorBar.vue';
import { useDevice } from '@/api/composables/useDevice';
import Tag from '@/components/Tag.vue';
import { useRoute, type RouteLocationNormalizedLoadedGeneric } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { Icon } from '@iconify/vue';
import TagsSearchTab from '@/components/TagsSearchTab.vue';
import AuthorsSearchTab from '@/components/AuthorsSearchTab.vue';

const device = useDevice();
const route = useRoute();
const appStore = useAppStore();

const tagToggle = (tag: string) => {
   appStore.searchFilters.tags.includes(tag)
      ? appStore.searchFilters.tags = appStore.searchFilters.tags.filter(_tag => _tag != tag)
      : appStore.searchFilters.tags.push(tag);
}
function setTags(_route: RouteLocationNormalizedLoadedGeneric) {
   const tags = _route.query.tags
   if (tags) {
      if (Array.isArray(tags)) {
         appStore.searchFilters.tags = tags as string[]
      } else {
         appStore.searchFilters.tags = [tags as string]
      }
   }
}
watch(route, (newRoute) => setTags(newRoute))
onMounted(() => setTags(route))

const searchWithFilters = async () => {
   const res = await $api({
      base: 'query/book',
      query: {
         'book-filtered-search': {
            prompt: appStore.searchFilters.prompt.trim(),
            limit: 25,
            tags: appStore.searchFilters.tags,
            author: appStore.searchFilters.author?._id
         }
      }
   });
   console.log(res)
   if (res && res.length > 0) {
      searchedBooks.value = res
   }
}

const searchedBooks = ref<import('@/types/models').Book[] | undefined>()

const { data: tags } = useApi({ base: 'query/book', query: { 'book-most-tags': true } })
const { data: authors } = useApi({ base: 'query/book', query: { 'book-most-authors': true } })
const tagBooks_1 = ref<any[] | undefined>();
const tagBooks_2 = ref<any[] | undefined>();
const tagBooks_3 = ref<any[] | undefined>();
const tagBooks_4 = ref<any[] | undefined>();
const tagBooks_5 = ref<any[] | undefined>();

watch(tags, async () => {
   if (tags.value.length > 1) {
      const limits = [{ $limit: device.value === 'desktop' ? 6 : 8 }];
      if (tags.value[0]) {tagBooks_1.value = await $api({ base: 'query/book', query: { tags: tags.value[0].tag, $pipe: limits } })}

      if (tags.value[1]) {tagBooks_2.value = await $api({ base: 'query/book', query: { tags: tags.value[1].tag, $pipe: limits } })}

      if (tags.value[2]) {tagBooks_3.value = await $api({ base: 'query/book', query: { tags: tags.value[2].tag, $pipe: limits } })}

      if (tags.value[3]) {tagBooks_4.value = await $api({ base: 'query/book', query: { tags: tags.value[3].tag, $pipe: limits } })}

      if (tags.value[4]) {tagBooks_5.value = await $api({ base: 'query/book', query: { tags: tags.value[4].tag, $pipe: limits } })}

   }
})

onMounted(() => {
   setPageSubBackground();
})
</script>

<style scoped>
@reference "tailwindcss";

.desktop-grid-container {
   @apply grid gap-2;
}

.tag {
   color: var(--color-base-300);
   outline-color: var(--color-base-300);
}
</style>