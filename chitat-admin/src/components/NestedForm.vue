<template>
  <el-form :model="localModel" ref="formRef" label-width="auto" :rules="localRules">
    <el-form-item v-for="(fieldInfo, fName) in fieldsEntries" :key="fName" :label="fName.toUpperCase()" :prop="fName">
      <el-tag v-if="fName.startsWith('_')">{{ localModel[fName] }}</el-tag>
      
      <!-- Enum (перед String, т.к. enum может иметь тип String) -->
      <el-select v-else-if="fieldInfo.enum && !fieldInfo.isArray" v-model="localModel[fName]" :placeholder="`Выберите ${fName}`" clearable filterable>
        <el-option v-for="option in fieldInfo.enum" :key="option" :label="option" :value="option" />
      </el-select>

      <!-- [Enum] -->
      <el-select v-else-if="fieldInfo.enum && fieldInfo.isArray" v-model="localModel[fName]" multiple :placeholder="`Выберите ${fName}`" clearable filterable>
        <el-option v-for="option in fieldInfo.enum" :key="option" :label="option" :value="option" />
      </el-select>

      <!-- Date -->
      <el-date-picker v-else-if="fieldInfo.type === 'Date' && !fieldInfo.isArray" v-model="localModel[fName]" type="datetime" placeholder="Выберите дату и время" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" clearable />

      <!-- [Date] -->
      <el-input-tag v-else-if="fieldInfo.type === 'Date' && fieldInfo.isArray" v-model="localModel[fName]" />

      <!-- String -->
      <el-input v-else-if="fieldInfo.type === 'String' && !fieldInfo.isArray" v-model="localModel[fName]" />

      <!-- Number -->
      <el-input-number v-else-if="fieldInfo.type === 'Number' && !fieldInfo.isArray" v-model="localModel[fName]" />

      <!-- Boolean -->
      <el-switch v-else-if="fieldInfo.type === 'Boolean' && !fieldInfo.isArray" v-model="localModel[fName]" />

      <!-- ObjectId -->
      <template v-else-if="fieldInfo.type === 'ObjectId' && !fieldInfo.isArray">
        <div class="flex w-full gap-2">
          <el-tag v-if="getObjectIdValue(fName)">
            {{ getObjectIdValue(fName) }}
          </el-tag>
          <el-select v-if="fieldInfo.ref" :model-value="getObjectIdValue(fName)" @update:model-value="(val: string) => setObjectIdValue(fName, val)" @focus="fetchRef(fieldInfo.ref)" filterable>
            <el-option v-if="refData" v-for="data in refData" :value="data._id">
              {{ data[Object.keys(data)[1] as string] }}
              <el-tag>{{ data._id }}</el-tag>
            </el-option>
          </el-select>
          <el-button v-if="!fieldInfo.required" @click="setObjectIdValue(fName, null)">Очистить</el-button>
        </div>
      </template>

      <!-- [ObjectId] -->
      <template v-else-if="fieldInfo.type === 'ObjectId' && fieldInfo.isArray">
        <div class="flex w-full gap-2">
          <el-select v-if="fieldInfo.ref" :model-value="getObjectIdArrayValue(fName)" @update:model-value="(val: string[]) => setObjectIdArrayValue(fName, val)" multiple filterable allow-create default-first-option @focus="fetchRef(fieldInfo.ref)">
            <el-option v-if="refData" v-for="data in refData" :value="data._id">
              {{ data[Object.keys(data)[1] as string] }}
              <el-tag>{{ data._id }}</el-tag>
            </el-option>
          </el-select>
        </div>
      </template>

      <!-- [String] -->
      <el-input-tag v-else-if="fieldInfo.type === 'String' && fieldInfo.isArray" v-model="localModel[fName]" />

      <!-- File -->
      <template v-else-if="fieldInfo.type === 'File'">
        <el-image v-if="typeof localModel[fName] === 'string' && fieldInfo.filetype === 'Image'" :preview-src-list="[`${API}/files/${localModel[fName]}`]" class="w-full h-30 rounded pb-1 cursor-pointer" fit="cover" :src="`${API}/files/${localModel[fName]}`" />
        <div v-else-if="typeof localModel[fName] === 'string'" class="w-full mb-1 rounded border-gray-300 border flex items-center justify-center">
          {{ `📁.${getFileExtension(localModel[fName])}` }}
        </div>
        <el-upload list-type="picture" drag action="#" :limit="1" :auto-upload="false" class="w-full" :name="fName" @change="(file: UploadFile) => { handleFileUpload(file, fName) }">
          <div class="el-upload__text">
            Перетащите файл сюда или <em>нажмите для выбора</em>
          </div>
        </el-upload>
      </template>

      <!-- Вложенный документ ($emb: true, не массив) -->
      <template v-else-if="fieldInfo.$emb && !fieldInfo.isArray">
        <el-card class="nested-form-card">
          <template #header>
            <el-tag size="small" type="info">Вложенный документ</el-tag>
          </template>
          <NestedForm v-model="nestedModelsStore[fName]" :fields="getNestedFields(fName)" @file-upload="handleNestedFileUpload" />
        </el-card>
      </template>

      <!-- Массив вложенных документов ($emb: true, isArray: true) -->
      <template v-else-if="fieldInfo.$emb && fieldInfo.isArray">
        <el-card class="nested-form-card">
          <template #header>
            <div class="flex justify-between items-center">
              <el-tag size="small" type="info">Массив вложенных документов</el-tag>
              <el-button type="primary" size="small" @click="openAddArrayItemDialog(fName)">
                + Добавить
              </el-button>
            </div>
          </template>
          <div v-if="nestedModelsStore[fName] && nestedModelsStore[fName].length > 0" class="flex flex-col gap-3">
            <el-card v-for="(item, index) in nestedModelsStore[fName]" :key="index" shadow="hover">
              <template #header>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold">Элемент {{ Number(index) + 1 }}</span>
                  <div class="flex gap-2">
                    <el-button size="small" @click="openEditArrayItemDialog(fName, Number(index))">
                      ✏ Редактировать
                    </el-button>
                    <el-button size="small" type="danger" plain @click="deleteArrayItem(fName, Number(index))">
                      ⨉ Удалить
                    </el-button>
                  </div>
                </div>
              </template>
              <el-descriptions :column="1" size="small" border>
                <el-descriptions-item v-for="[key, val] in Object.entries(item)" :key="key" :label="key">
                  <span v-if="typeof val === 'object' && val !== null">{{ JSON.stringify(val) }}</span>
                  <span v-else>{{ val }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </div>
          <el-empty v-else description="Нет элементов" :image-size="80" />
        </el-card>
      </template>
    </el-form-item>
  </el-form>

  <!-- Модальное окно для редактирования элемента массива вложенных документов -->
  <el-dialog v-model="editArrayItemDialog" :title="editingArrayIndex === -1 ? 'Добавить вложенный документ' : 'Редактировать вложенный документ'" width="600px">
    <NestedForm v-model="editingArrayItem" :fields="getNestedFields(editingArrayField)" @file-upload="handleNestedFileUpload" />
    <template #footer>
      <el-button type="primary" @click="confirmArrayItemEdit">Сохранить</el-button>
      <el-button plain @click="editArrayItemDialog = false">Отмена</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PropType } from 'vue';
import type { FieldInfo } from '@/config/types';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import { getFileExtension } from '@/config/api';
import Data from '@/config/api';
// --- ИМПОРТ cloneDeep ---
import { cloneDeep } from 'lodash-es'; 
// ------------------------

const props = defineProps({
  modelValue: {
    type: Object as PropType<Record<string, any>>,
    required: true,
    default: () => ({})
  },
  fields: {
    type: Object as PropType<Record<string, FieldInfo>>,
    required: true
  }
});

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>],
  'file-upload': [file: UploadFile, fieldName: string]
}>();

const formRef = ref();
const API = import.meta.env.VITE_API_URL;
const refData = ref<any[]>([]);

// Модальное окно для редактирования элемента массива вложенных документов
const editArrayItemDialog = ref(false);
const editingArrayField = ref('');
const editingArrayIndex = ref(-1);
const editingArrayItem = ref<Record<string, any>>({});

// Проверка, является ли поле полем верхнего уровня
function isTopLevelField(fieldName: string, allFields: Record<string, any>): boolean {
  for (const [otherName, otherInfo] of Object.entries(allFields)) {
    if (otherName !== fieldName &&
      otherInfo &&
      typeof otherInfo === 'object' &&
      otherInfo.$emb === true &&
      fieldName in otherInfo) {
      return false;
    }
  }
  return true;
}

// Преобразуем fields в массив кортежей для v-for (только поля верхнего уровня)
const fieldsEntries = computed(() => {
  const result: Record<string, FieldInfo> = {};
  for (const [fName, info] of Object.entries(props.fields)) {
    if (info && typeof info === 'object' && isTopLevelField(fName, props.fields)) {
      result[fName] = info;
    }
  }
  return result;
});

// Получение полей вложенного документа
function getNestedFields(parentName: string): Record<string, FieldInfo> {
  const parentField = props.fields[parentName];

  if (parentField && typeof parentField === 'object') {
    const nestedFields: Record<string, FieldInfo> = {};

    for (const [fieldName, fieldInfo] of Object.entries(parentField)) {
      if (fieldName !== '$emb' && fieldInfo && typeof fieldInfo === 'object') {
        nestedFields[fieldName] = fieldInfo as FieldInfo;
      }
    }

    return nestedFields;
  }

  return {};
}

// Реактивное хранилище для вложенных моделей
const nestedModelsStore = ref<Record<string, any>>({});

// Инициализация вложенных моделей при изменении modelValue
watch(() => props.modelValue, (newVal) => {
  const newStore: Record<string, any> = {};
  for (const [fName, fieldInfo] of Object.entries(props.fields)) {
    if (fieldInfo.$emb) {
      const currentVal = newVal[fName];

      if (fieldInfo.isArray) {
        // Массив вложенных документов
        if (Array.isArray(currentVal) && currentVal.length > 0) {
          // --- ИСПОЛЬЗУЕМ cloneDeep ---
          newStore[fName] = currentVal.map(item =>
            item && typeof item === 'object' ? cloneDeep(item) : {}
          );
        } else {
          newStore[fName] = [];
        }
      } else {
        // Одиночный вложенный документ
        if (currentVal && typeof currentVal === 'object' && !Array.isArray(currentVal)) {
          // --- ИСПОЛЬЗУЕМ cloneDeep ---
          newStore[fName] = cloneDeep(currentVal);
        } else {
          newStore[fName] = {};
        }
      }
    }
  }
  nestedModelsStore.value = newStore;
}, { immediate: true, deep: true });

// Синхронизация изменений обратно в parent — только при изменении store
watch(nestedModelsStore, (newStore) => {
  const updated = { ...props.modelValue }; // Копируем внешний объект
  let hasChanges = false;

  for (const [fName, fieldInfo] of Object.entries(props.fields)) {
    if (fieldInfo.$emb && newStore[fName]) {
      const oldVal = props.modelValue[fName]; // Старое значение из props
      const newVal = newStore[fName]; // Новое значение из store
      // --- СРАВНЕНИЕ ---
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        // --- КОПИРОВАНИЕ ---
        updated[fName] = cloneDeep(newVal);
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    emit('update:modelValue', updated);
  }
}, { deep: true });

// Функции для работы с массивом вложенных документов
function openAddArrayItemDialog(fName: string) {
  editingArrayField.value = fName;
  editingArrayIndex.value = -1;
  editingArrayItem.value = {};
  editArrayItemDialog.value = true;
}

function openEditArrayItemDialog(fName: string, index: number) {
  editingArrayField.value = fName;
  editingArrayIndex.value = index;
  // --- ГЛУБОКОЕ КОПИРОВАНИЕ ПРИ ОТКРЫТИИ ---
  editingArrayItem.value = cloneDeep(nestedModelsStore.value[fName][index]);
  editArrayItemDialog.value = true;
}

function confirmArrayItemEdit() {
  const fName = editingArrayField.value;
  const index = editingArrayIndex.value;

  if (index === -1) {
    // Добавление нового элемента
    const currentArray = nestedModelsStore.value[fName] || [];
    // --- КОПИРОВАНИЕ С cloneDeep ПРИ ДОБАВЛЕНИИ ---
    nestedModelsStore.value = {
      ...nestedModelsStore.value,
      [fName]: [...currentArray, cloneDeep(editingArrayItem.value)]
    };
  } else {
    // Редактирование существующего элемента
    // --- КОПИРОВАНИЕ С cloneDeep ПРИ РЕДАКТИРОВАНИИ ---
    const currentArray = [...nestedModelsStore.value[fName]]; // Копируем массив
    currentArray[index] = cloneDeep(editingArrayItem.value); // Копируем измененный элемент
    nestedModelsStore.value = {
      ...nestedModelsStore.value,
      [fName]: currentArray
    };
  }

  editArrayItemDialog.value = false;
}

function deleteArrayItem(fName: string, index: number) {
  const currentArray = [...(nestedModelsStore.value[fName] || [])];
  currentArray.splice(index, 1);
  nestedModelsStore.value = {
    ...nestedModelsStore.value,
    [fName]: currentArray
  };
}

// Локальная модель для привязки полей формы (для не-вложенных полей)
const localModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Helper для получения значения ObjectId поля (может быть строкой или объектом)
function getObjectIdValue(fName: string): string | null {
  const val = localModel.value[fName];
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object' && val._id) return val._id;
  return null;
}

// Helper для установки значения ObjectId поля
function setObjectIdValue(fName: string, val: string | null) {
  const updated = { ...localModel.value, [fName]: val };
  emit('update:modelValue', updated);
}

// Helper для получения значения массива ObjectId (может быть массивом строк или объектов)
function getObjectIdArrayValue(fName: string): string[] {
  const val = localModel.value[fName];
  if (!Array.isArray(val)) return [];
  return val.map(item => typeof item === 'string' ? item : (item._id || item));
}

// Helper для установки значения массива ObjectId
function setObjectIdArrayValue(fName: string, val: string[]) {
  const updated = { ...localModel.value, [fName]: val };
  emit('update:modelValue', updated);
}

// Загрузка данных для ObjectId ссылок
async function fetchRef(schema: string) {
  try {
    ElMessage.info({
      message: `Загрузка документов схемы \`${schema}\`...`,
      placement: 'bottom-left'
    });
    const response = await Data.query(schema, { query: {} });
    refData.value = response.data;
    ElMessage.success({
      message: `Загружено ${response.data.length} документа(ов)`,
      placement: 'bottom-left'
    });
  } catch (err) {
    ElMessage.error({
      message: "Ошибка при попытке загрузить данные, см. консоль",
      placement: 'bottom-left'
    });
  }
}

// Обработка загрузки файла
function handleFileUpload(file: UploadFile, fName: string) {
  if (file.raw) {
    emit('file-upload', file, fName);
  }
}

// Обработка загрузки файла из вложенной формы
function handleNestedFileUpload(file: UploadFile, nestedFieldName: string) {
  // Ищем родительское $emb поле
  for (const [fName, fieldInfo] of Object.entries(props.fields)) {
    if (fieldInfo.$emb) {
      const nestedFields = getNestedFields(fName);
      if (nestedFields[nestedFieldName]) {
        emit('file-upload', file, `${fName}.${nestedFieldName}`);
        return;
      }
    }
  }
}

// Правила валидации
const localRules = computed(() => {
  const rules: Record<string, [{ message: string, required: boolean, trigger: 'blur' }]> = {};

  for (const [fieldName, fieldInfo] of Object.entries(props.fields)) {
    // Пропускаем вложенные поля с точками для этого уровня
    if (fieldName.includes('.')) continue;

    if (fieldInfo && !fieldInfo.$emb) {
      rules[fieldName] = [{
        message: `Заполните поле \`${fieldName}\``,
        required: fieldInfo.required,
        trigger: 'blur'
      }];
    }
  }

  return rules;
});

// Метод для валидации из родителя
defineExpose({
  validate: async () => {
    if (formRef.value) {
      return await formRef.value.validate();
    }
    return true;
  }
});
</script>

<style scoped>
@reference "tailwindcss";

.nested-form-card {
  @apply mb-4 w-full;
}

:deep(.el-card__header) {
  @apply bg-gray-50 py-1;
}
</style>