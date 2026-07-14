<template>
   <div class="modal" @click.self="close">
      <div class="ui-border modal-box color-auto">
         <div>
            <slot>
               <h3 class="text-lg font-bold">Hello!</h3>
               <p class="py-4">Base slot text</p>
            </slot>
         </div>
         <div class="modal-action">
            <slot name="actions">
               <button class="btn btn-border" @click="close" title="Закрыть">Close</button>
            </slot>
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { useLayoutStore } from '@/stores/layout';
import { onMounted, onUnmounted } from 'vue';

const layout = useLayoutStore()

const emits = defineEmits(['closeModal'])

const close = () => emits('closeModal')

onMounted(() => {
   layout.isAnyModalOpen = true
})

onUnmounted(() => {
   layout.isAnyModalOpen = false
})

</script>

<style scoped>
@reference "tailwindcss";

.modal {
   @apply fixed z-9999 top-0 left-0 size-full flex justify-center items-center;
   background: rgba(0, 0, 0, 0.5);
}

.modal-box {
   @apply p-2 min-w-[40vw] min-h-[20vh] flex flex-col justify-between;
   background: var(--color-base-100);
}

.modal-action {
   @apply flex justify-end gap-2 h-10;
}
</style>