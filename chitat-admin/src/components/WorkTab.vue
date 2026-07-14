<template>
    <div class="tab">
        <h1 class="font-semibold text-xl text-right pr-2">📚 admin-panel</h1>
        <el-tabs v-model="activeTab" @tab-click="handleNav" tabPosition="left" class="pt-5">
            <el-tab-pane v-for="schema in appStore.schemas" :label="`${schema.info.title} ${schema.info.icon || ''}`" :name="schema.name"/>
        </el-tabs>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import type { TabsPaneContext } from 'element-plus';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const appStore = useAppStore()
const router = useRouter()

const activeTab = ref(router.currentRoute.value.params.schema)

const handleNav = (tab: TabsPaneContext) => router.push(`/${tab.paneName}`)

watch(
    () => router.currentRoute.value.params.schema,
    (newTab) => {
        if (activeTab.value != newTab) {
            activeTab.value = newTab
        }
    })

</script>

<style>
@reference "tailwindcss";

.tab{
    @apply flex flex-col gap-2 w-fit h-full px-2 pt-5 border-l-2 border-gray-200;
}
</style>