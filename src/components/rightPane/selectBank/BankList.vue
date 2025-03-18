<template>
  <div class="bank-list-container">
    <h2 class="section-title"> {{ !searchQuery ? 'ALL BANKS' : 'RESULTS' }} </h2>
    <div class="bank-list">
      <TransitionGroup name="bank-list" tag="div" class="transition-container">
        <div class="no-results-container" v-if="searchQuery && filteredBanks.length === 0">
          <div class="no-results-title">
            No results
          </div>
          <div class="no-results-message">
            {{ `No results for "${searchQuery}" in banks. Try using different keywords.` }}
          </div>
        </div>
        <BankCard v-else v-for="bank in filteredBanks" :key="bank.id" :bank="bank"
          :is-selected="selectedBank?.id === bank.id" @select="$emit('select', $event)"
          @show-overlay="(bankData) => emit('showOverlay', bankData)" />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type BankData from '@/core/types/BankData';
import BankCard from '@/components/rightPane/selectBank/BankCard.vue';

const props = defineProps<{
  banks: BankData[],
  searchQuery: string,
  selectedType: 'personal' | 'business',
  selectedBank?: BankData,
}>();

const emit = defineEmits<{
  (e: 'select', bank: BankData): void,
  (e: 'showOverlay', bank: BankData): void
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.transition-container {
  height: 100%;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--grey-500);
  margin-bottom: 16px;
  letter-spacing: 1.2px;
}

.bank-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.no-results-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.no-results-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--base-black);
}

.no-results-message {
  font-size: 14px;
  color: var(--grey-500);
}

:deep(.bank-card) {
  margin-bottom: 8px;
}

:deep(.bank-card:last-child) {
  margin-bottom: 0;
}

.bank-list-move,
.bank-list-enter-active,
.bank-list-leave-active {
  transition: all 0.3s ease;
}

.bank-list-enter-from,
.bank-list-leave-to {
  opacity: 0;
}

.bank-list-leave-active {
  position: absolute;
}
</style>