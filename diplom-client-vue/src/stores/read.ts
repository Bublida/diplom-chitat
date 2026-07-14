import { $api } from "@/api/composables/useApi";
import { getFullPath } from "@/api/cover";
import type { Bookmark, TableContents } from "@/types";
import { HtmlPageSplitter } from "@talers/html-pages";
import { marked } from "marked";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

export const useReadStore = defineStore('read', () => {
   const scale = ref(1);
   const originalHTML = ref<string>()
   const fetchedHTML = ref<string>()
   const pages = ref<(string | undefined)[]>([]);
   const isTwoWided = ref(false);
   const progress = computed(() => Math.min(Math.floor(currentPage.value * 100 / totalPages.value), 100));
   const currentPage = ref(1);
   const totalPages = ref(0);
   const tableOfContents = ref<TableContents[]>()
   const isLoading = ref(false);
   const tips = ref<Bookmark[]>([]);
   const currentTipId = ref<string | null>(null);

   function switchTwoWided() {
      isTwoWided.value = !isTwoWided.value
   }

   function generateTipId() {
      return `tip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
   }

   function addTip(tipData: { tip: string, comment: string, pagelink?: number }) {
      tips.value.push({
         id: generateTipId(),
         tip: tipData.tip,
         comment: tipData.comment,
         pagelink: tipData.pagelink || currentPage.value
      });
   }

   function editTip(id: string, newData: { tip?: string, comment?: string }) {
      const tipIndex = tips.value.findIndex(t => t.id === id);
      if (tipIndex !== -1 && tips.value[tipIndex]) {
         if (newData.tip !== undefined) tips.value[tipIndex].tip = newData.tip;
         if (newData.comment !== undefined) tips.value[tipIndex].comment = newData.comment;
      }
   }

   function removeTip(id: string) {
      tips.value = tips.value.filter(t => t.id !== id);
   }

   function setCurrentTipId(id: string | null) {
      currentTipId.value = id;
   }

   function getTipById(id: string) {
      return tips.value.find(t => t.id === id);
   }

   async function fetchBookFile(bookid: string) {
      const { bookfile } = await $api({ base: 'query/book', first: true, query: { $idx: { field: '_id', id: bookid } } })
      if (bookfile) {
         const path = getFullPath(bookfile)
         const res = await fetch(path)
         if (res.ok) {
            const text = await res.text()
            const html = await marked.parse(text)
            originalHTML.value = html
         }
      }
   }

   const scaleClases = {
      '0,8': 'reader-text-08',
      '1': 'reader-text-1',
      '1,2': 'reader-text-12',
      '1,4': 'reader-text-14',
      '1,6': 'reader-text-16',
      '1,8': 'reader-text-18',
      '2': 'reader-text-2'
   }

   function escapeRegExp(string: string): string {
      return string.replace(/[.*+?^${}()|\\[\]\\]/g, '\\$&');
   }

   function highlightText(html: string, searchItems: Bookmark[], pageNum?: number): string {
      if (searchItems.length < 1) return html;
      
      // Если указан номер страницы, фильтруем закладки по этой странице
      const validItems = searchItems.filter(item => {
         if (pageNum !== undefined) {
            return item.pagelink === pageNum && item.tip && item.tip.length >= 2;
         }
         return item.tip && item.tip.length >= 2;
      });
      
      if (validItems.length === 0) return html;

      // Сортируем по длине (длинные сначала, чтобы не ломать вложенные)
      validItems.sort((a, b) => b.tip.length - a.tip.length);

      let result = html;
      
      // Проходим по каждой закладке и заменяем текст на span
      for (const item of validItems) {
         const { tip, comment, id } = item;
         if (!tip) continue;

         const escapedTip = escapeRegExp(tip);
         const commentEscaped = (comment || '').replace(/"/g, '&quot;');
         const idEscaped = id || '';
         
         // Создаем regex для поиска
         const regex = new RegExp(escapedTip, 'g');
         
         // Заменяем все совпадения
         let firstReplacementDone = false;
         result = result.replace(regex, (match) => {
            // Пропускаем если уже внутри span.reader-tip
            if (match.includes('class="reader-tip"')) {
               return match;
            }

            // Для первой закладки с данным текстом - заменяем
            if (firstReplacementDone) {
               return match;
            }
            
            firstReplacementDone = true;
            return `<span class="reader-tip" data-reader-tip="${commentEscaped}" data-tip-id="${idEscaped}">${match}</span>`;
         });
      }
      
      return result;
   }

   function pushTableOfContents(pageHtml: string, id: number) {
      const headings = extractHeadingsFast(pageHtml);
      if (headings.length > 0) {
         if (!tableOfContents.value) tableOfContents.value = [];
         headings.forEach(head => {
            if (tableOfContents.value) tableOfContents.value.push({ title: head, pagelink: id });
         });
      }
   }

   function extractHeadingsFast(html: string): string[] {
      const headings: string[] = [];
      const regex = /<h[1-6][^>]*>([^<]*)<\/h[1-6]>/gi;
      let match;
      while ((match = regex.exec(html)) !== null) {
         if (match[1]) headings.push(match[1].trim());
      }
      return headings;
   }

   async function splitPages(containerEl: HTMLElement) {
      isLoading.value = true
      try {
         const htmlToProcess = originalHTML.value || ''
         pages.value = [];
         if (!htmlToProcess || !containerEl) throw new Error('no html or container provided!');

         const classes = ['reader-page'];
         const idx = scale.value.toLocaleString();

         if (idx in scaleClases) classes.push(scaleClases[idx as keyof typeof scaleClases]);
         const splitter = new HtmlPageSplitter({ classes })

         const pagesContent: string[] = [];
         if(tableOfContents.value && tableOfContents.value?.length > 0){
            tableOfContents.value = [];
         }
         for await (const pageHtml of splitter.split(htmlToProcess)) {
            pagesContent.push(pageHtml);
            pushTableOfContents(pageHtml, pagesContent.length);
         }
         
         // Выделяем закладки в каждой странице
         for (let i = 0; i < pagesContent.length; i++) {
            const pageNum = i + 1;
            const pageTips = tips.value.filter(tip => tip.pagelink === pageNum);
            if (pageTips.length > 0) {
               pagesContent[i] = highlightText(pagesContent[i], pageTips, pageNum);
            }
         }
         
         fetchedHTML.value = pagesContent.join('');
         totalPages.value = pagesContent.length;
         pages.value = pagesContent;
         currentPage.value = Math.max(1, Math.min(currentPage.value, totalPages.value))
      } catch (error) {
         console.error(error)
      } finally {
         isLoading.value = false
      }
   }

   const handleNextPage = () => {
      currentPage.value = Math.min(totalPages.value + 1, currentPage.value + 1)
   };
   const handlePrevPage = () => {
      currentPage.value = Math.max(1, currentPage.value - 1)
   };

   watch(currentPage, () => window.scrollY = 0)

   return {
      isTwoWided,
      switchTwoWided,
      pages,
      progress,
      tableOfContents,
      currentPage,
      fetchedHTML,
      originalHTML,
      totalPages,
      splitPages,
      handleNextPage,
      handlePrevPage,
      fetchBookFile,
      scale,
      isLoading,
      tips,
      currentTipId,
      addTip,
      editTip,
      removeTip,
      setCurrentTipId,
      getTipById,
      generateTipId
   }
})
