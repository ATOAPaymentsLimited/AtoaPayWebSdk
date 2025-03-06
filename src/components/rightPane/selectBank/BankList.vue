<template>
  <div class="bank-list-container">
    <h2 class="section-title">ALL BANKS</h2>
    <div class="bank-list">
      <BankCard v-for="bank in filteredBanks" :key="bank.id" :bank="bank" :is-selected="selectedBank?.id === bank.id"
        @select="$emit('select', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type BankData from '@/core/types/BankData';
import BankCard from './BankCard.vue';

const props = defineProps<{
  banks: BankData[]
  searchQuery: string
  selectedType: 'personal' | 'business',
  selectedBank?: BankData
}>();

defineEmits<{
  (e: 'select', bank: BankData): void
}>();

const filteredBanks = computed(() => {
  return props.banks
    .filter(bank => {
      const matchesType = props.selectedType === 'business' ? bank.businessBank : !bank.businessBank;
      const matchesSearch = props.searchQuery
        ? bank.name.toLowerCase().includes(props.searchQuery.toLowerCase())
        : true;
      return matchesType && matchesSearch;
    })
    .sort((a, b) => a.orderBy - b.orderBy);
});
</script>

<style scoped>
.bank-list-container {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--grey-500);
  margin-bottom: 16px;
  letter-spacing: 1.2px;
}

.bank-list {
  display: flex;
  flex-direction: column;
}

:deep(.bank-card) {
  margin-bottom: 8px;
}

:deep(.bank-card:last-child) {
  margin-bottom: 0;
}
</style>