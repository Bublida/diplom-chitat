import { useReadStore } from "@/stores/read";
import type { FontScaleOptions } from "@/types";
import { useLocalStorage } from "@vueuse/core";

export const useFontScale = (options: FontScaleOptions = {
   min: 0.8, 
   max: 2.0, 
   step: 0.2, 
   initial: 1.0
}) => {
  const { min, max, step, initial } = options;
  
  const scale = useLocalStorage('reader-font-scale', initial);

  const { isLoading } = useReadStore();

  const increase = () => {if(!isLoading) scale.value = Math.min(max, scale.value + step)};
  const decrease = () => {if(!isLoading) scale.value = Math.max(min, scale.value - step)};
  const reset = () => scale.value = initial;
    
  return {
    scale,
    increase,
    decrease,
    reset
  };
};