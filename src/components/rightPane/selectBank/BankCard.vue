<template>
  <div class="bank-card" :class="{ disabled: !bank.enabled }" @click="handleClick">
    <div class="bank-logo">
      <img :src="bankLogo" :alt="bank.name" class="logo-image">
    </div>
    <div class="bank-info">
      <span class="bank-name">{{ bank.name }}</span>
    </div>
    <div class="radio-checkbox" :class="{ selected: isSelected }" v-if="bank.enabled">
      <img v-if="isSelected" src="@/assets/images/black_check.svg" alt="Selected" class="checkmark">
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type BankData from '@/core/types/BankData';

const props = defineProps<{
  bank: BankData;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', bank: BankData): void
}>();

const bankLogo = computed(() => {
  const logoMedia = props.bank.media.find(m => m.type === 'logo');
  return logoMedia ? logoMedia.source : '';
});

const handleClick = () => {
  if (props.bank.enabled) {
    emit('select', props.bank);
  }
};
</script>

<style scoped>
.bank-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.bank-card:hover:not(.disabled) {
  background: var(--grey-50);
}

.bank-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bank-logo {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  border: 1px solid var(--grey-100);
  border-radius: 6px;
}

.logo-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.bank-info {
  flex: 1;
}

.bank-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--grey-600);
}

.radio-checkbox {
  width: 20px;
  height: 20px;
  border: 1px solid var(--grey-300);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
}

.radio-checkbox.selected {
  border: none;
}

.radio-checkbox:not() .bank-card:hover:not(.disabled) .radio-checkbox {
  border-color: var(--grey-400);
}

.checkmark {
  width: 100%;
  height: 100%;
}
</style>