<template>
  <div class="popular-banks" v-if="popularBanks.length">
    <div class="popular-banks-grid">
      <div v-for="bank in popularBanks" :key="bank.id" class="popular-bank-item"
        :class="{ 'selected': isSelected(bank) }" @click="handleBankSelect(bank)">
        <div class="bank-logo" :class="{ disabled: !bank.enabled }">
          <img :src="getBankLogo(bank)" :alt="bank.name" class="logo-image">
          <img v-if="isSelected(bank)" src="@/assets/images/black_check.svg" alt="Selected" class="check-icon">
        </div>
        <span class="bank-name">{{ bank.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type BankData from '@/core/types/BankData';

const props = defineProps<{
  banks: BankData[],
  selectedBank?: BankData
}>();

const emit = defineEmits<{
  (e: 'select', bank: BankData): void
}>();

const popularBanks = computed(() =>
  props.banks.filter(bank => bank.popularBank)
);

const getBankLogo = (bank: BankData) => {
  const logoMedia = bank.media.find(m => m.type === 'logo');
  return logoMedia ? logoMedia.source : '';
};

const isSelected = (bank: BankData) => {
  return props.selectedBank?.id === bank.id;
};

const handleBankSelect = (bank: BankData) => {
  if (bank.enabled) {
    emit('select', bank);
  }
};
</script>

<style scoped>
.popular-banks {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.popular-banks-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.popular-bank-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bank-logo {
  position: relative;
  width: 75px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  background: var(--base-white);
  border: 1px solid var(--grey-200);
  border-radius: 12px;
}

.bank-logo:hover:not(.disabled) {
  background: var(--grey-50);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.bank-logo.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.logo-image {
  max-width: 24px;
  max-height: 24px;
  object-fit: contain;
}

.bank-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--grey-500);
  text-align: center;
}

.popular-bank-item.selected .bank-logo {
  border: 2px solid var(--base-black);
}

.check-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>