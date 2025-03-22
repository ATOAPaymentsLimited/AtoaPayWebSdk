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
              <h2 v-if="currentView !== ViewType.PaymentStatusView">{{ viewTitleMap[currentView].title }}</h2>
              <p v-else class="payment-details-header">{{ viewTitleMap[currentView].title }}</p>
              <p v-if="viewTitleMap[currentView].showTimestamp" class="payment-timestamp">{{ formattedTimestamp }}</p>
            </div>
          </div>
        </div>
        <div class="sdk-action-row">
          <button v-if="currentView === ViewType.SelectBankView" class="sdk-action-button" @click="handleHelpAction">
            <img src="@/assets/images/icon_help.svg" alt="Help" />
          </button>
          <button class="sdk-action-button" @click="handleClose">
            <img src="@/assets/images/icon_close.svg" alt="Close" />
          </button>
        </div>
      </div>

      <div class="view-content">
        <Transition mode="out-in" name="fade-slide" @enter="enter" @leave="leave">
          <div :key="currentView" class="view">
            <div v-if="currentView === ViewType.ExplainerView" class="view-container-flex">
              <ExplainerUI v-on:continue="goToNextView" :is-loading="isFetchingInitialData" />
            </div>

            <div v-else-if="currentView === ViewType.SelectBankView" class="view-container-flex">
              <SelectBank v-on:select-bank="handleOnBankSelect" :selected-bank-id="selectedBank?.id"
                @show-overlay="handleShowOverlay" />
            </div>

            <div v-else-if="currentView === ViewType.PaymentOptionsView" class="view-container-flex">
              <PaymentOptions v-if="selectedBank && paymentDetails" :selected-bank="selectedBank"
                :payment-details="paymentDetails" @bank-change="goToPreviousView" @status-change="goToNextView" />
            </div>

            <div v-else-if="currentView === ViewType.PaymentInProgressView" class="view-container-flex">
              <PaymentVerification v-if="selectedBank" :selected-bank="selectedBank" @success="goToNextView" />
            </div>

            <div v-else-if="currentView === ViewType.PaymentStatusView" class="view-container-flex">
              <PaymentStatus />
            </div>
          </div>
        </Transition>
      </div>

      <div v-if="showDisabledBankOverlay" class="bank-overlay">
        <div class="overlay-content">
          <div class="overlay-icon">
            <img src="@/assets/images/icon_warning.svg" alt="Warning" class="overlay-warning-image">
            <p>Downtime</p>
          </div>
          <div class="overlay-message">
            <p><strong>{{ disabledBank?.name }}</strong> bank is currently down for maintenance. Please select a
              different bank and try
              again.</p>
          </div>
          <button class="close-overlay-btn" @click.stop="closeOverlay">Select different bank</button>
        </div>
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
import type { UserCancelPaymentEventHandler } from '@/core/types/SdkOptions'

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

const viewTitleMap: Record<ViewType, ViewConfig> = {
  [ViewType.ExplainerView]: {
    title: 'How to pay with bank app?',
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
const cancelPaymentHandler = inject<UserCancelPaymentEventHandler>('cancelPaymentHandler');

const views = ViewType.values();
const currentView = ref<ViewType>(ViewType.SelectBankView)
const selectedBank = ref<BankData | null>();
const showDisabledBankOverlay = ref(false);
const disabledBank = ref<BankData | null>(null);

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

const handleHelpAction = () => {
  setCurrentView(ViewType.ExplainerView);
}

const confirmClose = () => {
  showCancellationDialog.value = false;
  if (cancelPaymentHandler) {
    cancelPaymentHandler(paymentRequestId ?? '');
  }
};

const timestamp = ref(new Date());

const formattedTimestamp = computed(() => {
  const date = timestamp.value;

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const time = date.toLocaleTimeString('en-GB', timeOptions);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  const dateStr = date.toLocaleDateString('en-GB', dateOptions);

  return `${time} on ${dateStr}`;
});

const handleShowOverlay = (bank: BankData) => {
  disabledBank.value = bank;
  showDisabledBankOverlay.value = true;
};

const closeOverlay = () => {
  showDisabledBankOverlay.value = false;
  disabledBank.value = null;
};
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
  margin: 0px;
  font-size: 14px;
  font-weight: 500;
  color: var(--grey-500);
  margin-bottom: 2px;
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

.sdk-action-row {
  display: flex;
}

.bank-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-content {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 90%;
  width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overlay-icon {
  background-color: var(--error-subtle);
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding: 8px 12px;
  gap: 6px;
}

.overlay-icon p {
  margin: 0px;
  padding: 0px;
  font-size: 11px;
  font-weight: 700;
  color: var(--error-default);
}

.overlay-warning-image {
  width: 24px;
  height: 24px;
}

.overlay-message p {
  margin: 0px;
  font-size: 16px;
  color: var(--base-black);
  margin-bottom: 24px;
}

.close-overlay-btn {
  width: 100%;
  background-color: var(--grey-50);
  color: var(--base-black);
  border: none;
  border-radius: 10px;
  padding: 14px 0px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-overlay-btn:hover {
  background-color: var(--grey-100);
}
</style>
