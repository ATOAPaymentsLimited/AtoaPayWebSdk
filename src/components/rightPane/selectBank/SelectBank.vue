<template>
  <div class="select-bank">
    <div class="search-container">
      <div class="search-input">
        <img :src="searchIcon" alt="Search" class="search-icon">
        <input type="text" v-model="searchQuery" :placeholder="`Search your ${selectedType} bank`">
      </div>
    </div>

    <div class="content" v-if="isLoading">
      <div class="loading-state">
        <img :src="animatedGrid" alt="Loading" class="loading-animation">
        <p class="loading-text">Fetching banks</p>
      </div>
    </div>

    <div class="content" v-else>
      <BankTabs v-model="selectedType" />

      <div class="banks-container">
        <PopularBanks :banks="banks" :selected-bank="selectedBank" @select="handleBankSelect" />
        <BankList :banks="banks" :search-query="searchQuery" :selected-type="selectedType" :selected-bank="selectedBank"
          @select="handleBankSelect" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import animatedGrid from '@/assets/images/animated_grid.gif';
import searchIcon from '@/assets/images/icon_search.svg';
import { PaymentsService } from '@/core/services/PaymentsService';
import type BankData from '@/core/types/BankData';
import BankTabs from '@/components/rightPane/selectBank/BankTabs.vue';
import PopularBanks from '@/components/rightPane/selectBank/PopularBanks.vue';
import BankList from '@/components/rightPane/selectBank/BankList.vue';

const emit = defineEmits<{
  (e: 'selectBank', bank: BankData): void
}>();

const props = defineProps({
  selectedBankId: {
    type: String,
    required: false,
  }
});

const searchQuery = ref('');
const isLoading = ref(true);
const banks = ref<BankData[]>([]);
const selectedType = ref<'personal' | 'business'>('personal');
const selectedBank = ref<BankData | undefined>();

const handleBankSelect = (bank: BankData) => {
  selectedBank.value = bank;
  emit('selectBank', bank);
};

onMounted(() => {
  fetchBanksList();
});

async function fetchBanksList() {
  const paymentsService = new PaymentsService();

  try {
    banks.value = await paymentsService.fetchConsumerBankInstitutions();

    if (props.selectedBankId !== undefined) {
      const bank = banks.value.find((bank) => props.selectedBankId == bank.id);

      if (bank !== undefined) {
        selectedBank.value = bank;
      }
    }
  } catch (error) {
    console.error('Failed to fetch banks:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.select-bank {
  padding: 24px 0;
  padding-right: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--grey-500);
  padding: 8px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-container {
  margin-bottom: 24px;
}

.search-input {
  background: var(--grey-50);
  border-radius: 100px;
  border: 1px solid var(--grey-200);
  padding: 10px 16px;
  height: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-icon {
  color: var(--grey-400);
  font-size: 20px;
}

.search-input input {
  border: none;
  background: none;
  width: 100%;
  font-size: 13px;
  color: var(--base-black);
  outline: none;
  font-family: inherit;
}

.search-input input::placeholder {
  color: var(--grey-400);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.loading-animation {
  width: 150px;
  height: 100px;
  transform: scale(2);
  aspect-ratio: 1/1;
  object-fit: contain;
}

.loading-text {
  color: var(--grey-600);
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.banks-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Remove all scrollbar styling */
:deep(.bank-list) {
  padding-right: 0;
}
</style>