import { useWindowSize } from "@vueuse/core";
import { computed } from "vue";

export const useDevice = () => {
   const { width } = useWindowSize()
   return computed(() => width.value <= 600 ? 'mobile' : 'desktop')
}