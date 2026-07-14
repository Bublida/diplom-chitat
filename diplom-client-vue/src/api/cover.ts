import { FastAverageColor } from "fast-average-color";
import { useSubStyle } from "@api/composables/useSubStyle";

const baseURL = import.meta.env.VITE_API_BASE;
if (baseURL === undefined) throw Error("Не установлен apiBase")

export const getAverageColor = async (path: string) => {
   try {
      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.src = getFullPath(path)

      const fac = new FastAverageColor();

      return await fac.getColorAsync(img);
   } catch (err) {
      console.error(`Произошла ошибка при вычислении среднего цвета изображения:`, err)
   }
}

export const setPageBackground = (background: string) => {
   document.body.style.setProperty('--active-background', background);
}

export const setPageSubBackground = () => {
  setPageBackground(`var(${useSubStyle().value.var})`)
}

export const getFullPath = (path: string) => `${baseURL}/files/${path}`;

export const generateRgbArray = (step: number = 5) => {
  const rgbArray = [];
  for (let r = 0; r <= 255; r += step) {
    for (let g = 0; g <= 255; g += step) {
      for (let b = 0; b <= 255; b += step) {
        rgbArray.push(`rgb(${r}, ${g}, ${b})`);
      }
    }
  }
  return rgbArray;
}

export const parseDate = (datestamp: string) => {
  const [ year, month, day ] = datestamp.slice(0, datestamp.indexOf('T')).split('-')
  return `${day}.${month}.${year}`
}