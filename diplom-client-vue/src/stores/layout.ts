import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { HatInfo, SearchView } from '@/types'

export const useLayoutStore = defineStore('layout', () => {
  const searchView = ref<SearchView>('full')
  const footerView = ref(true)
  const isAnyModalOpen = ref(false)
  const hatInfo = ref<HatInfo | undefined>()
  const error = ref<string | undefined>()
  const footerLinks = ref([
    { url: '/', name: "Партнёрам" },
    { url: '/', name: "Авторам" },
    { url: '/', name: "Публикации" },
    { url: '/', name: "Новинки" },
  ])

  return { searchView, hatInfo, footerLinks, error, footerView, isAnyModalOpen }
})
