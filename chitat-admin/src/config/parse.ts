import type { FieldInfo } from "./types";

export function parseSchemaFields(fields: Record<string, FieldInfo>): Record<string, any> {
   const result: Record<string, any> = {};

   // Сначала добавляем все поля без точек (и не содержащие $)
   for (const field in fields) {
      if (!field.includes('.') && !field.includes('$')) {
         result[field] = fields[field];
      }
   }

   // Обрабатываем поля с точками
   for (const field in fields) {
      if (field.includes('.')) {
         const pathParts = field.split('.');
         let currentLevel = result;

         for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i] || '';

            // Пропускаем символ $ — это маркер массива
            if (part === '$') {
               continue;
            }

            if (i === pathParts.length - 1) {
               // Последняя часть пути — это само поле
               currentLevel[part] = fields[field];
            } else {
               // Проверяем, следующий элемент после текущей части — это $?
               const nextPart = pathParts[i + 1];
               const isArray = nextPart === '$';

               // Создаем промежуточные уровни, если их еще нет
               if (!currentLevel[part]) {
                  currentLevel[part] = isArray
                     ? { $emb: true, isArray: true }
                     : { $emb: true };
               } else if (typeof currentLevel[part] === 'object' && currentLevel[part] !== null) {
                  // Если объект уже существует, добавляем $emb флаг
                  currentLevel[part].$emb = true;
                  // Если это массив, устанавливаем isArray
                  if (isArray) {
                     currentLevel[part].isArray = true;
                  }
               }
               currentLevel = currentLevel[part];
            }
         }
      }
   }

   return result;
}