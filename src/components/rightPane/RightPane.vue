<template>
  <div class="content-right">
    <div class="sdk-right-pane">
      <div class="sdk-right-pane-header">
        <div class="sdk-right-pane-header-left">
          <div class="sdk-right-pane-header-actions">
            <button v-if="showBackButton" class="sdk-action-button" @click="goToPreviousView">
              <img src="@/assets/images/icon_back.svg" alt="Back" />
            </button>
          </div>
          <div v-if="!isFetchingInitialData" :key="currentView" class="sdk-right-pane-header-text">
            <div v-if="currentView === 'View1'">
              <h2>Continue to your bank</h2>
            </div>

            <div v-else-if="currentView === 'View2'">
              <h2>Select your bank to continue</h2>
            </div>

            <div v-else-if="currentView === 'View3'">
              <h2>Scan to pay</h2>
            </div>

            <div v-else-if="currentView === 'View4'">
              <h2>Payment in progress</h2>
            </div>

            <div v-else-if="currentView === 'View5'">
              <p class="payment-details-header">Payment details</p>
              <p class="payment-timestamp">{{ formattedTimestamp }}</p>
            </div>
          </div>
        </div>
        <button class="sdk-action-button" @click="$emit('close')">
          <img src="@/assets/images/icon_close.svg" alt="Close" />
        </button>
      </div>

      <div class="view-content">
        <Transition mode="out-in" name="fade-slide" @enter="enter" @leave="leave">
          <div :key="currentView" class="view">
            <div v-if="currentView === 'View1'" class="view-container-flex">
              <ExplainerUI v-on:continue="setCurrentView('View2')" :is-loading="isFetchingInitialData" />
            </div>

            <div v-else-if="currentView === 'View2'">
              <SelectBank v-on:select-bank="handleOnBankSelect" :selected-bank-id="selectedBank?.id" />
            </div>

            <div v-else-if="currentView === 'View3'">
              <PaymentOptions v-if="selectedBank" :selected-bank="selectedBank" :qr-code-url="qrCodeUrl"
                :bank-website-url="bankWebsiteUrl" @change="setCurrentView('View2')"
                @success="setCurrentView('View4')" />
            </div>

            <div v-else-if="currentView === 'View4'" class="view-container-flex">
              <PaymentVerification v-if="selectedBank" :selected-bank="selectedBank" @cancel="handleCancel"
                @success="setCurrentView('View5')" />
            </div>

            <div v-else-if="currentView === 'View5'" class="view-container-flex">
              <PaymentSuccess />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import ExplainerUI from '@/components/rightPane/explainer/ExplainerUI.vue'
import SelectBank from '@/components/rightPane/selectBank/SelectBank.vue'
import type BankData from '@/core/types/BankData'
import PaymentOptions from '@/components/rightPane/paymentOptions/PaymentOptions.vue'
import PaymentVerification from '@/components/rightPane/paymentVerification/PaymentVerification.vue'
import PaymentSuccess from '@/components/rightPane/paymentSuccess/PaymentSuccess.vue'

const props = defineProps({
  isFetchingInitialData: {
    type: Boolean,
    required: false,
  },
});

defineEmits<{
  close: [],
}>();

const { isFetchingInitialData } = toRefs(props);

const views = ['View1', 'View2', 'View3', 'View4', 'View5'] as const
type ViewType = typeof views[number]

const currentView = ref<ViewType>('View1')
const selectedBank = ref<BankData | null>();
const qrCodeUrl = ref<string>('');
const bankWebsiteUrl = ref<string>('');

const showBackButton = computed(() => currentView.value === 'View3' || currentView.value === 'View4');

const goToPreviousView = () => {
  const currentIndex = views.indexOf(currentView.value);
  const previousView = views[currentIndex - 1];
  setCurrentView(previousView);
};

const setCurrentView = (view: ViewType) => {
  currentView.value = view
}

const enter = (el: Element, done: () => void) => {
  const animation = (el as HTMLElement).animate(
    [
      // { opacity: 0, transform: 'translateX(50px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ],
    {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  )
  animation.onfinish = done
}

const leave = (el: Element, done: () => void) => {
  const animation = (el as HTMLElement).animate(
    [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(-50px)' }
    ],
    {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  )
  animation.onfinish = done
}

const handleOnBankSelect = (bank: BankData) => {
  selectedBank.value = bank;

  // TODO
  qrCodeUrl.value = 'https://atoa-merchant-dev.s3.eu-west-2.amazonaws.com/display_payment-qr-codes/ead72a5d-8852-4ffd-a97e-05d28a28c013/1741160236932.svg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASV2VH7U5MIC62E5K%2F20250305%2Feu-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250305T073717Z&X-Amz-Expires=3600&X-Amz-Signature=d6c637d59391731f24b611d21b0fb997a6cc14f3122667bcc7c629d759566e7f&X-Amz-SignedHeaders=host';
  bankWebsiteUrl.value = 'https://example.com/bank-website';
  setCurrentView('View3');
};

const handleCancel = () => {
  setCurrentView('View2');
};

const timestamp = ref(new Date()); // You would set this with the actual payment timestamp

const formattedTimestamp = computed(() => {
  const date = timestamp.value;

  // Format time (03:45 PM)
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const time = date.toLocaleTimeString('en-US', timeOptions);

  // Format date (5 Jun 2024)
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  const dateStr = date.toLocaleDateString('en-US', dateOptions);

  return `${time} on ${dateStr}`;
});
</script>

<style scoped>
.content-right {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sdk-right-pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px 0 16px 32px;
  overflow: hidden;
  height: 100%;
}

.sdk-right-pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
  flex-shrink: 0;
}

.sdk-right-pane-header-left {
  display: flex;
  align-items: center;
}

.sdk-right-pane-header-actions {
  display: flex;
  align-items: center;
}

.sdk-action-button {
  border: none;
  padding: 8px;
  margin-right: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--grey-50);
  transition: background-color 0.2s ease;
}

.sdk-action-button:hover {
  background-color: var(--grey-200);
}

.sdk-right-pane-header-text h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.view-content {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding-right: 24px;
}

.view {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;
}

/* Scrollbar styling */
.view::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.view::-webkit-scrollbar-track {
  background: transparent;
  margin: 24px 0;
}

.view::-webkit-scrollbar-thumb {
  background-color: var(--grey-200);
  border-radius: 3px;
}

.view::-webkit-scrollbar-thumb:hover {
  background-color: var(--grey-300);
}

.view-container-flex {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  /* opacity: 0; */
  transform: translateX(50px);
}

.fade-slide-leave-to {
  /* opacity: 0; */
  transform: translateX(-50px);
}

.payment-details-header {
  font-size: 14px;
  font-weight: 500;
  color: var(--grey-500);
  margin-bottom: 8px;
}

.payment-timestamp {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: var(--base-black);
}

@media (max-width: 768px) {
  .sdk-right-pane {
    padding: 16px;
  }

  .sdk-right-pane .explainer-ui {
    padding: 0px;
  }

  .sdk-right-pane-header-text h2 {
    text-align: center;
  }

  .view-content {
    padding: 0;
  }

  .sdk-action-button {
    padding: 0px;
    margin-right: 0px;
  }
}
</style>
