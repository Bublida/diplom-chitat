import { useAppStore } from "@/stores/app"
import { computed } from "vue";
import { SUBSCRIBTION_STYLE } from "../styles";

export const useSubStyle = () => {
   const appStore = useAppStore();
   return computed(() => {
      if (appStore.userData) {
         if (appStore.userData.subscribe && (appStore.userData.subscribe.type._id as string) in SUBSCRIBTION_STYLE) {
            return SUBSCRIBTION_STYLE[appStore.userData.subscribe.type._id as keyof typeof SUBSCRIBTION_STYLE]
         } else {
            throw new Error('Для такой подписки не существует стиля!')
         }
      } else {
         return SUBSCRIBTION_STYLE["69bb5fe8eddf54bccfde9576"]
      }
   })
}