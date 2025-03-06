<template>
  <div class="payment-options">
    <div class="payment-options-header">
      <div class="bank-info">
        <div class="bank-logo">
          <img :src="getBankLogo(selectedBank)" :alt="selectedBank?.name" />
        </div>
        <div class="bank-name">
          <div class="bank-name-label">Paying from</div>
          <div class="bank-name-value">{{ selectedBank?.name }}</div>
        </div>
      </div>
      <button class="change-button" @click="$emit('change')">Change</button>
    </div>

    <div class="qr-section">
      <p class="qr-instructions-bold">Scan with your phone camera</p>
      <p class="qr-instructions">to confirm in your bank app.</p>
      <div class="qr-container">
        <div v-if="isLoading" class="qr-code-placeholder">
          <div class="loading-spinner"></div>
        </div>
        <div v-if="qrLoadError" class="qr-error">
          QR code failed to load. Please try refreshing the page.
        </div>
        <div v-if="svgContent" v-html="svgContent" class="qr-code"></div>
      </div>
    </div>

    <div class="divider">
      <span>Or</span>
    </div>

    <a :href="bankWebsiteUrl" target="_blank" class="bank-website-link">
      Go to your bank website
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import type BankData from '@/core/types/BankData';

defineProps<{
  selectedBank: BankData;
  bankWebsiteUrl: string;
}>();

// Inject the values provided by PaymentDialog
const qrCodeUrl = inject<string>('qrCodeUrl');
console.log(qrCodeUrl);
const emit = defineEmits<{
  (e: 'change'): void;
  (e: 'success'): void
}>();

const qrLoadError = ref(false);
const svgContent = ref<string | null>(null);
const isLoading = ref(true);

const getBankLogo = (bank: BankData | undefined) => {
  if (!bank) return '';
  const logoMedia = bank.media.find(m => m.type === 'logo');
  return logoMedia ? logoMedia.source : '';
};

const fetchSvgContent = async (url: string) => {
  try {
    isLoading.value = true;
    qrLoadError.value = false;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch SVG');
    const text = await response.text();
    // Basic validation that we received SVG content
    if (!text.includes('<svg')) throw new Error('Invalid SVG content');
    svgContent.value = text;
  } catch (error) {
    console.error('Failed to load QR code:', error);
    qrLoadError.value = true;
    svgContent.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (qrCodeUrl) {
    fetchSvgContent(qrCodeUrl);
  }

  setTimeout(() => {
    emit('success');
  }, 5000);
});
</script>

<style scoped>
.payment-options {
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.payment-options-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--grey-50);
  border-radius: 12px;
  margin-bottom: 24px;
  box-sizing: border-box;
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bank-logo {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--grey-200);
  border-radius: 8px;
  padding: 8px;
}

.bank-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.bank-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bank-name-label {
  font-size: 11px;
  color: var(--grey-500);
  font-weight: 500;
}

.bank-name-value {
  font-size: 14px;
  color: var(--base-black);
  font-weight: 600;
}

.change-button {
  color: var(--primary-500);
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  line-height: 150%;
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-decoration-skip-ink: none;
  text-decoration-thickness: 10%;
  text-underline-offset: 25%;
  text-underline-position: from-font;
}

.qr-section {
  text-align: center;
}

.qr-instructions-bold {
  font-size: 14px;
  color: var(--grey-600);
  margin: 0;
  margin-bottom: 8px;
  font-weight: 700;
}

.qr-instructions {
  font-size: 14px;
  color: var(--grey-600);
  margin: 0;
  margin-bottom: 8px;
  font-weight: 400;
}

.qr-container {
  background: white;
  padding: 16px;
  margin: 24px 0;
  border-radius: 12.8px;
  border: 0.8px solid var(--Neutral-Grey-200, #EAEEF0);
  background: var(--Neutral-Grey-50, #F6F8F9);
}

.qr-code {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code :deep(svg) {
  width: 100%;
  height: 100%;
}

.qr-code-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--grey-50);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--grey-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  width: 100%;
  text-align: center;
  border-bottom: 1px solid var(--grey-200);
  line-height: 0.1em;
}

.divider span {
  background: var(--base-white);
  padding: 0 16px;
  color: var(--grey-400);
  font-size: 14px;
}

.bank-website-link {
  color: var(--base-black);
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--base-black);
  padding-bottom: 2px;
  margin-top: 24px;
}

.bank-website-link:hover {
  opacity: 0.8;
}

.qr-error {
  color: var(--primary-500);
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}
</style>