<template>
  <div class="max-w-md mx-auto p-6 bg-white shadow-lg h-full">
    <h2 class="text-2xl text-gray-600 font-bold mb-4 text-center">Оплата</h2>

    <!-- Информация о товаре -->
    <div class="mb-6 text-center">
      <p class="text-lg text-gray-600 font-medium">{{ product }}</p>
      <p class="text-gray-600 text-sm">Стоимость: {{ price }} ₽</p>
    </div>

    <!-- Форма -->
    <form @submit.prevent="handleSubmit" class="space-y-4 text-gray-500">
      <!-- Поле для номера карты -->
      <div>
        <label for="cardNumber" class="block text-sm font-medium text-gray-700">Номер карты</label>
        <input id="cardNumber" v-model="formData.cardNumber" type="text" placeholder="1234 5678 9012 3456"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required />
      </div>

      <!-- Поле для срока действия -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="expiryDate" class="block text-sm font-medium text-gray-700">Срок действия</label>
          <input id="expiryDate" v-model="formData.expiryDate" type="text" placeholder="MM/YY"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required />
        </div>

        <!-- Поле для CVV -->
        <div>
          <label for="cvv" class="block text-sm font-medium text-gray-700">CVV</label>
          <input id="cvv" v-model="formData.cvv" type="text" placeholder="123"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required />
        </div>
      </div>

      <!-- Поле для имени владельца карты -->
      <div>
        <label for="cardHolder" class="block text-sm font-medium text-gray-700">Имя владельца карты</label>
        <input id="cardHolder" v-model="formData.cardHolder" type="text" placeholder="John Doe"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required />
      </div>

      <!-- Кнопка оплаты -->
      <button type="submit" :disabled="isLoading" title="Оплатить"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
        <span v-if="isLoading">Обработка...</span>
        <span v-else>Оплатить</span>
      </button>
    </form>

    <!-- Сообщение о статусе -->
    <p v-if="paymentStatus" class="mt-4 text-center" :class="paymentStatus.success ? 'text-green-600' : 'text-red-600'">
      {{ paymentStatus.message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { purchaseBook } from '@/api/authorization';
import { $api } from '@/api/composables/useApi';
import { onMounted, reactive, ref } from 'vue';

// Пропсы для товара и цены
const props = defineProps<{
  prodId?: string
  product?: string,
  price?: number
}>();

// Реактивные данные формы
const formData = reactive({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardHolder: ''
});

// Состояние загрузки и статус оплаты
const isLoading = ref(false);
const paymentStatus = ref<{ success: boolean, message: string } | undefined>(undefined);

// Обработчик отправки формы
const handleSubmit = async () => {
  isLoading.value = true;
  paymentStatus.value = undefined;

  try {
    if (props.prodId) {
      // Имитация отправки данных на сервер
      await new Promise((resolve) => setTimeout(resolve, 2000));

      purchaseBook(props.prodId, -1)

      paymentStatus.value = { success: true, message: 'Оплата успешно проведена!' };
    } else {
      paymentStatus.value = { success: false, message: 'Непредиденная ошибка' }
    }

  } catch (error) {
    paymentStatus.value = { success: false, message: (error as Error).message };
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (!props.price || !props.product || !props.prodId) {
    window.location.href = '/'
  }
})
</script>