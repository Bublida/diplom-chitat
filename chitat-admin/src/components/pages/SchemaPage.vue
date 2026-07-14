<template>
  <div class="w-full h-full pt-4 flex flex-col gap-5 overflow-scroll">
    <!-- Верхняя панель управления -->
    <nav class="flex justify-between pb-4 px-5">
      <el-button size="large" type="danger" plain @click="logout">Выйти</el-button>
      <div class="flex gap-2">
        <el-button size="large" plain @click="updateConfig">Обновить конфигурацию</el-button>
        <el-button size="large" plain @click="fetchData">Обновить</el-button>
        <el-button type="primary" size="large" @click="openEditModalWrapper({})">+ Добавить</el-button>
      </div>
    </nav>

    <!-- Таблица данных -->
    <el-table class="pl-4" v-if="data.length > 0" :data="data" table-layout="auto" stripe :height="windowHeight">
      <el-table-column v-for="[fName, { type, isArray, ref, required, about, filetype, enum: enumValues, $emb }] in fields" :prop="fName">
        <!-- Названия столбцов -->
        <template #header>
          <el-popover placement="bottom">
            <template #default>
              <div class="flex flex-col gap-2">
                <h1 class="text-xl font-semibold">{{ fName }}</h1>
                <code>
                  <p>type: {{ typeof type === 'string' ? type : 'Embedded' }}</p>
                  <p>required: {{ required ? 'true' : 'false' }}</p>
                  <p v-if="ref">ref:
                    <router-link :to="`/${ref.toLowerCase()}`">
                      <el-tag>
                        {{ ref }}
                      </el-tag>
                    </router-link>
                  </p>
                </code>
              </div>
              <template v-if="about">
                <el-divider />
                <p>{{ about }}</p>
              </template>
            </template>
            <template #reference>
              {{ fName.toUpperCase() }}
            </template>
          </el-popover>
          <span class="text-red-500 text-lg pl-0.5" v-if="required">*</span>
        </template>

        <!-- Отображение данных -->
        <template #default="scope">
          <el-popover :content="`${scope.row[fName]}`" width="200" :trigger="type === 'ObjectId' ? `click` : `hover`">
            <template #reference>
              <!-- Undefined (Пустое поле) -->
              <span v-if="!scope.row[fName] || scope.row[fName].length < 1" class="uppercase text-gray-300 font-semibold">
                null
              </span>
              
              <!-- String -->
              <div v-else-if="type === 'String' && !isArray" class="w-25 overflow-hidden text-ellipsis line-clamp-3 leading-5">
                {{ scope.row[fName] }}
              </div>
              
              <!-- Boolean -->
              <span v-else-if="type === 'Boolean' && !isArray">
                {{ scope.row[fName] ? "✔" : "❌" }}
              </span>
              
              <!-- ObjectId -->
              <template v-else-if="type === 'ObjectId' && !isArray">
                <el-tag v-if="typeof scope.row[fName] === 'string'">
                  {{ scope.row[fName] }}
                </el-tag>
                <div v-else>
                  <el-popover :width="Math.min(Object.keys(scope.row[fName]).length * 100, 500)">
                    <el-table :data="[scope.row[fName]]" table-layout="auto">
                      <el-table-column v-for="[fieldName, fData] in Object.entries(scope.row[fName])" :prop="fieldName" :label="fieldName">
                        <template #default>
                          <span v-if="fieldName === '_id'"> <el-tag>{{ fData }}</el-tag> </span>
                          <p v-else>{{ fData }}</p>
                        </template>
                      </el-table-column>
                    </el-table>
                    <template #reference>
                      <el-tag effect="dark" size="large">
                        <p class="max-w-20 overflow-clip text-ellipsis">
                          {{ scope.row[fName][Object.keys(scope.row[fName])[1] as string] }}
                        </p>
                      </el-tag>
                    </template>
                  </el-popover>
                </div>
              </template>
              
              <!-- [ObjectId] -->
              <template v-else-if="type === 'ObjectId' && isArray">
                <div>
                  <el-popover :width="Math.min(Object.keys(scope.row[fName][0]).length * 100, 500)">
                    <el-table :data="scope.row[fName]" table-layout="auto">
                      <el-table-column v-for="fieldName in Object.keys(scope.row[fName][0])" :prop="fieldName" :label="fieldName">
                        <template #default="scope">
                          <span v-if="fieldName === '_id'"> <el-tag>{{ scope.row[fieldName] }}</el-tag> </span>
                          <p v-else>{{ scope.row[fieldName] }}</p>
                        </template>
                      </el-table-column>
                    </el-table>
                    <template #reference>
                      <el-tag effect="plain" size="large">
                        {{ `\`${ref}\` (${scope.row[fName].length})` }}
                      </el-tag>
                    </template>
                  </el-popover>
                </div>
              </template>
              
              <!-- [String] -->
              <div v-else-if="type === 'String' && isArray" class="flex flex-wrap gap-1">
                <template v-for="(val, idx) in scope.row[fName]" :key="idx">
                  <el-tag v-if="idx < 3" effect="plain">{{ val }}</el-tag>
                </template>
                <el-tag v-if="scope.row[fName].length > 3">{{ `+${scope.row[fName].length - 3}` }}</el-tag>
              </div>
              
              <!-- Number -->
              <span v-else-if="type === 'Number' && !isArray" class="font-semibold italic">
                {{ scope.row[fName] }}
              </span>
              
              <!-- Date -->
              <span v-else-if="type === 'Date' && !isArray">
                {{ new Date(scope.row[fName]).toLocaleString() }}
              </span>
              
              <!-- Enum -->
              <el-tag v-else-if="enumValues && !isArray" effect="plain">
                {{ scope.row[fName] }}
              </el-tag>
              
              <!-- Вложенный документ ($emb) -->
              <template v-else-if="$emb && typeof scope.row[fName] === 'object' && scope.row[fName]">
                <el-popover :width="Math.min(400, windowWidth)" trigger="hover">
                  <template #default>
                    <div class="nested-doc-preview">
                      <el-descriptions :column="1" size="small" border>
                        <el-descriptions-item v-for="[key, val] in Object.entries(scope.row[fName])" :key="key" :label="key">
                          <span v-if="typeof val === 'object'">{{ JSON.stringify(val) }}</span>
                          <span v-else>{{ val }}</span>
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>
                  </template>
                  <template #reference>
                    ↳
                  </template>
                </el-popover>
              </template>
              <span v-else-if="$emb && !scope.row[fName]" class="text-gray-400 text-sm">— пустой —</span>
              
              <!-- File -->
              <template v-else-if="type === 'File'">
                <el-image v-if="filetype === 'Image'" :src="`${API}/files/${scope.row[fName]}`" class="w-15 h-15 rounded" show-progress fit="cover" />
                <div v-else class="w-15 h-15 rounded border border-gray-300 flex items-center justify-center">
                  {{ `📁.${getFileExtension(scope.row[fName])}` }}
                </div>
              </template>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      
      <el-table-column align="center" fixed="right" label="ОПЕРАЦИИ">
        <template #default="scope">
          <!-- Edit button -->
          <el-button size="small" @click="openEditModalWrapper(scope.row)">
            ✏
          </el-button>
          <!-- Delete button -->
          <el-button plain size="small" type="danger" @click="deleteRow(scope.row._id)">
            ⨉
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Шаблон нулевой загрузки -->
    <div v-else-if="!loading" class="center-container">
      <div class="text-center">
        <span v-if="schema.info.icon" class="text-5xl">{{ schema.info.icon }}</span>
        <h1 class="text-2xl font-bold">Таблица пуста!</h1>
        <h2 class="text-gray-500">Добавьте первую сущность для отображения таблицы</h2>
      </div>
    </div>
  </div>

  <!-- Редактирование/добавление сущности -->
  <el-dialog v-model="visibleEdit" title="Редактирование сущности" :before-close="handleClose" width="85%">
    <template #default>
      <NestedForm ref="formRef" v-model="form" :fields="Object.fromEntries(fields)" @file-upload="handleFileUpload" />
    </template>
    <template #footer>
      <el-button type="primary" @click="handleConfirm(formRef)">Сохранить</el-button>
      <el-button plain @click="handleClose(() => { visibleEdit = false })">Отмена</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import Data, { getFileExtension } from '@/config/api';
import type { Schema } from '@/config/types';
import { useAppStore } from '@/stores/app';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus';
import { parseSchemaFields } from '@/config/parse';
import NestedForm from '@/components/NestedForm.vue';

// Общие параметры
const route = useRoute()
const schema = computed<Schema>(() => useAppStore().schemas.find(_schema => _schema.name === route.params.schema))
const fields = computed(() => Object.entries(parseSchemaFields(schema.value.fields)))

const logout = () => {
  ElMessageBox.confirm("Вы действительно хотите выйти из системы?")
    .then(() => {
      useAppStore().authorized = false
      localStorage.clear()
    })
}

const windowHeight = window.screen.height
const windowWidth = Math.min(400, window.screen.width / 2)
const data = ref<any[]>([])
const API = import.meta.env.VITE_API_URL
const loading = ref(false)

// Форма редактирования
const visibleEdit = ref(false)
const form = ref<any>({})
const formRef = ref<InstanceType<typeof NestedForm>>()

function deleteRow(id: string) {
  ElMessageBox.confirm("Вы действительно хотите удалить сущность?")
    .then(async () => {
      await Data.delete(schema.value.name, { query: { _id: id } }).then(fetchData)
      ElMessage.success({
        message: `Сущность успешно удалена`,
        placement: 'bottom-left'
      })
    })
}

// --- УПРОЩЕННАЯ ФУНКЦИЯ openEditModal ---
function openEditModal(row: any): any {
  console.log('[openEditModal] Input row:', row);
  // Просто глубоко копируем входящий объект/массив
  const cleanForm = JSON.parse(JSON.stringify(row)); 
  console.log('[openEditModal] Result cleanForm:', cleanForm);
  return cleanForm;
}
// -----------------------------------------

function openEditModalWrapper(row: any) {
  form.value = openEditModal(row);
  visibleEdit.value = true;
}

function handleFileUpload(file: UploadFile, fName: string) {
  if (file.raw) {
    // Если поле вложенное (содержит точку), создаём вложенную структуру
    if (fName.includes('.')) {
      const parts = fName.split('.')
      const currentFile = file.raw

      // Проходим по форме и создаём вложенную структуру
      let targetObj: any = form.value
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i] as string
        if (!targetObj[part]) {
          targetObj[part] = {}
        }
        targetObj = targetObj[part]
      }
      targetObj[parts[parts.length - 1] as string] = currentFile
    } else {
      form.value[fName] = file.raw
    }
  } else {
    console.log("Файла нет?!")
  }
}

function handleClose(done: () => void) {
  ElMessageBox.confirm("Вы действительно хотите закрыть это диалоговое окно?")
    .then(() => {
      done()
    })
}

async function handleConfirm(formEl?: InstanceType<typeof NestedForm>) {
  if (!formEl) return

  const valid = await formEl.validate()

  if (valid) {
    ElMessageBox.confirm("Вы действительно хотите сохранить данные сущности?")
      .then(() => {
        // Отправка формы (mutation)
        const formData = new FormData()
        const query: Record<string, any> = {}

        Object.entries(form.value).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value)
          } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
            // Вложенные объекты (включая вложенные документы) - отправляем как JSON
            query[key] = value 
          } else {
            query[key] = value
          }
        })

        visibleEdit.value = false
        formData.append('query', JSON.stringify(query))

        Data.mutation(schema.value.name, formData)
          .then(fetchData)
      })
  }
}

function updateConfig() {
  ElMessageBox.confirm("Обновить полную конфигурацию схем таблиц?")
    .then(() => {
      ElMessage.info({ message: "Обновление конфигурации...", placement: "bottom-left" })
      useAppStore().fetchInit()
        .then(() => ElMessage.success({ message: "Конфигурация обновлена", placement: "bottom-left" }))
        .catch(err => {
          if (err.response) {
            ElMessage.error(`Ошибка сервера: ${err.response.status}`)
          }
        })
    })
}

async function fetchData() {
  if (!schema) return;

  try {
    ElMessage.primary({
      message: "Идёт загрузка...",
      placement: 'bottom-left'
    })
    loading.value = true
    const response = await Data.query(schema.value.name, { query: {} })
    data.value = response.data;
    ElMessage.success({
      message: `Загрузка \`${schema.value.name}\` прошла успешно`,
      placement: 'bottom-left'
    })
  } catch (err) {
    console.error(`Fetch data error!`, err)
    ElMessage.error({
      message: "Ошибка загрузки данных, см. консоль",
      placement: 'bottom-left',
      duration: 0,
      showClose: true
    })
  } finally {
    loading.value = false
    ElMessage.warning({
      message: `Загружено ${data.value.length} сущности(ей)`,
      placement: 'bottom-left'
    })
  }
}

onMounted(() => {
  fetchData()
})

watch(
  () => route.params.schema,
  (newSchema, oldSchema) => {
    if (newSchema !== oldSchema) {
      data.value = []
      fetchData();
    }
  }
)
</script>

<style scoped>
@reference "tailwindcss";

.nested-doc-preview {
  @apply max-h-64 overflow-auto;
}

:deep(.el-descriptions__label) {
  @apply font-semibold w-32;
}
</style>