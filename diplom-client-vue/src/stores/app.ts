import type { Author, Book, Collection } from "@/types/models";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useAppStore = defineStore('app', () => {
   const isAuthorized = ref(localStorage.getItem('token') !== null)
   const userData = ref<any>();
   const collectionData = ref<Collection>();
   const bookData = ref<{ basecost: Book['basecost'], title: Book['title'], library: Book['library'] }>();
   const searchFilters = reactive<{
      prompt: string,
      tags: string[],
      author: Author | undefined
   }>({
      prompt: '',
      tags: [],
      author: undefined
   })
   const collectionIcons = [
      'mynaui:aeroplane',
      'mynaui:archive',
      'mynaui:academic-hat',
      'mynaui:annoyed-square',
      'mynaui:at',
      'mynaui:box',
      'mynaui:book-open',
      'mynaui:briefcase',
      'mynaui:components'
   ]
   function clearFilters() {
      searchFilters.author = undefined
      searchFilters.tags = []
      searchFilters.prompt = ''
   }

   return {
      isAuthorized,
      userData,
      collectionIcons,
      collectionData,
      bookData,
      searchFilters,
      clearFilters
   }
})