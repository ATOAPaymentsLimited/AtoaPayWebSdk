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
          <div class="spacer" :style="{
            width: isMobileWidth
              ? currentView === ViewType.SelectBankView
                ? '15vw'
                : currentView === ViewType.PaymentInProgressView
                  ? '20vw'
                  : '25vw'
              : '0px',
          }"></div>
          <div v-if="!isFetchingInitialData" :key="currentView" class="sdk-right-pane-header-text">
            <div>
              <h2>{{ viewTitleMap[currentView].title }}</h2>
              <p v-if="viewTitleMap[currentView].showTimestamp" class="payment-timestamp">{{ formattedTimestamp }}</p>
            </div>
          </div>
        </div>
        <button class="sdk-action-button" @click="handleClose">
          <img src="@/assets/images/icon_close.svg" alt="Close" />
        </button>
      </div>

      <div class="view-content">
        <Transition mode="out-in" name="fade-slide" @enter="enter" @leave="leave">
          <div :key="currentView" class="view">
            <div v-if="currentView === ViewType.ExplainerView" class="view-container-flex">
              <ExplainerUI v-on:continue="goToNextView" :is-loading="isFetchingInitialData" />
            </div>

            <div v-else-if="currentView === ViewType.SelectBankView" class="view-container-flex">
              <SelectBank v-on:select-bank="handleOnBankSelect" :selected-bank-id="selectedBank?.id" />
            </div>

            <div v-else-if="currentView === ViewType.PaymentOptionsView">
              <PaymentOptions v-if="selectedBank && paymentDetails" :selected-bank="selectedBank"
                :payment-details="paymentDetails" @bank-change="goToPreviousView" @status-change="goToNextView" />
            </div>

            <div v-else-if="currentView === ViewType.PaymentInProgressView" class="view-container-flex">
              <PaymentVerification v-if="selectedBank" :selected-bank="selectedBank" @success="goToNextView" />
            </div>

            <div v-else-if="currentView === ViewType.PaymentStatusView" class="view-container-flex">
              <PaymentStatus @success="(data) => emit('success', data)" />
            </div>
          </div>
        </Transition>
      </div>
      <CancellationDialog :show="showCancellationDialog" @dismiss="showCancellationDialog = false"
        @confirm="confirmClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, toRefs, type ComputedRef, type Ref } from 'vue'
import ExplainerUI from '@/components/rightPane/explainer/ExplainerUI.vue'
import SelectBank from '@/components/rightPane/selectBank/SelectBank.vue'
import type BankData from '@/core/types/BankData'
import PaymentOptions from '@/components/rightPane/paymentOptions/PaymentOptions.vue'
import PaymentVerification from '@/components/rightPane/paymentVerification/PaymentVerification.vue'
import PaymentStatus from '@/components/rightPane/paymentStatus/PaymentStatus.vue'
import type PaymentDetails from '@/core/types/PaymentDetails'
import CancellationDialog from '@/components/rightPane/CancellationDialog.vue'
import { ViewType } from '@/core/types/ViewTypeEnum'

// Add this type definition before the viewTitleMap
type ViewConfig = {
  title: string;
  showTimestamp?: boolean;
};

const props = defineProps({
  isFetchingInitialData: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits<{
  close: [data?: any],
  success: [data?: any],
}>();

const viewTitleMap: Record<ViewType, ViewConfig> = {
  [ViewType.ExplainerView]: {
    title: 'Continue to your bank',
  },
  [ViewType.SelectBankView]: {
    title: 'Select your bank to continue',
  },
  [ViewType.PaymentOptionsView]: {
    title: 'Scan to pay',
  },
  [ViewType.PaymentInProgressView]: {
    title: 'Payment in progress',
  },
  [ViewType.PaymentStatusView]: {
    title: 'Payment details',
    showTimestamp: true
  }
} as const;

const { isFetchingInitialData } = toRefs(props);
const paymentRequestId = inject<string>('paymentRequestId');
const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');

const views = ViewType.values();
const currentView = ref<ViewType>(ViewType.ExplainerView)
const selectedBank = ref<BankData | null>();

const showBackButton = computed(
  () => currentView.value === ViewType.PaymentOptionsView || currentView.value === ViewType.PaymentInProgressView
);

const goToPreviousView = () => {
  const currentIndex = views.indexOf(currentView.value);
  if (currentIndex < views.length - 1) {
    const previousView = views[currentIndex - 1];
    setCurrentView(previousView);
  }
};

const goToNextView = () => {
  const currentIndex = views.indexOf(currentView.value);
  if (currentIndex < views.length - 1) {
    const nextView = views[currentIndex + 1];
    setCurrentView(nextView);
  }
};

const setCurrentView = (view: ViewType) => {
  currentView.value = view;
};

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
  setCurrentView(ViewType.PaymentOptionsView);
};

const showCancellationDialog = ref(false);

const handleClose = () => {
  showCancellationDialog.value = true;
};

const confirmClose = () => {
  showCancellationDialog.value = false;
  emit('close', { paymentRequestId: paymentRequestId });
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
  position: relative;
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

@media (max-width: 768px) {
  .view {
    padding-right: 0px;
  }

  .sdk-right-pane {
    padding: 16px;
  }

  .sdk-right-pane .explainer-ui {
    padding: 0px;
  }

  .sdk-right-pane-header-text p {
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

.spacer-hidden {
  display: none;
}
</style>
