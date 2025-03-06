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
              <PaymentOptions v-if="selectedBank && paymentDetails" :selected-bank="selectedBank"
                :qr-code-url="qrCodeUrl" :bank-website-url="bankWebsiteUrl" @bank-change="setCurrentView('View2')"
                @status-change="setCurrentView('View4')" :payment-details="paymentDetails" />
            </div>

            <div v-else-if="currentView === 'View4'" class="view-container-flex">
              <PaymentVerification v-if="selectedBank" :selected-bank="selectedBank" @cancel="handleCancel"
                @success="setCurrentView('View5')" />
            </div>

            <div v-else-if="currentView === 'View5'" class="view-container-flex">
              <PaymentStatus @close="emit('close')" />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, toRefs, type Ref } from 'vue'
import ExplainerUI from '@/components/rightPane/explainer/ExplainerUI.vue'
import SelectBank from '@/components/rightPane/selectBank/SelectBank.vue'
import type BankData from '@/core/types/BankData'
import PaymentOptions from '@/components/rightPane/paymentOptions/PaymentOptions.vue'
import PaymentVerification from '@/components/rightPane/paymentVerification/PaymentVerification.vue'
import PaymentStatus from '@/components/rightPane/paymentStatus/PaymentStatus.vue'
import type PaymentDetails from '@/core/types/PaymentDetails'

const props = defineProps({
  isFetchingInitialData: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits<{
  close: [],
}>();

const { isFetchingInitialData } = toRefs(props);
const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');

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
  setCurrentView('View3');
};

const handleCancel = () => {
  setCurrentView('View2');
};

// TODO: Update this value
const timestamp = ref(new Date());

const formattedTimestamp = computed(() => {
  const date = timestamp.value;

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const time = date.toLocaleTimeString('en-US', timeOptions);

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
  transform: translateX(50px);
}

.fade-slide-leave-to {
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
</style>