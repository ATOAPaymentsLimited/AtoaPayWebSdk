<template>
  <div class="payment-dialog-container">
    <div class="payment-dialog" role="dialog" aria-modal="true">
      <div class="content-row">
        <LeftPane v-if="!isMobileWidth" :is-loading="isFetchingInitialData" />
        <RightPane :is-fetching-initial-data="isFetchingInitialData" @success="(data) => emit('success', data)"
          @close="(data) => emit('close', data)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide, computed, inject, onBeforeUnmount } from 'vue';
import LeftPane from '@/components/leftPane/LeftPane.vue';
import RightPane from "@/components/rightPane/RightPane.vue";
import type PaymentDetails from '@/core/types/PaymentDetails';
import type BankData from '@/core/types/BankData';
import { PaymentsService } from '@/core/services/PaymentsService';
import { EnvironmentTypeEnum } from '@/core/types/Environment';

const isFetchingInitialData = ref(true);
const paymentRequestDetails = ref<PaymentDetails>();
const banksList = ref<BankData[]>([]);
const paymentAmount = ref(0);
const storeImageUrl = ref("");
const merchantBusinessName = ref("");
const environment = inject<EnvironmentTypeEnum>('environment');
const errorHandler = inject<(error: Error, componentName: string) => void>('errorHandler');

const props = defineProps({
  paymentRequestId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  close: [data?: any],
  success: [data?: any],
}>();

const width = ref(window.innerWidth);
const isMobileWidth = computed(() => width.value < 1023);

provide("isMobileWidth", isMobileWidth);
provide('paymentRequestId', props.paymentRequestId);
provide('banksList', banksList);
provide('paymentRequestDetails', paymentRequestDetails);

onMounted(() => {
  fetchPaymentRequestDetails();
  fetchBanksList();
});

async function fetchPaymentRequestDetails() {
  isFetchingInitialData.value = true;

  try {
    const paymentsService = new PaymentsService();
    const paymentRequestResponseData: PaymentDetails = await paymentsService.fetchPaymentDetails(props.paymentRequestId,
      { env: environment || EnvironmentTypeEnum.PRODUCTION },
    );
    paymentRequestDetails.value = paymentRequestResponseData;
    paymentAmount.value = paymentRequestResponseData.amount.amount;
    storeImageUrl.value = paymentRequestResponseData.storeImg || "";
    merchantBusinessName.value =
      paymentRequestResponseData.merchantBusinessName;
    paymentAmount.value = paymentRequestResponseData.amount.amount;
    storeImageUrl.value = paymentRequestResponseData.storeImg || "";
    merchantBusinessName.value =
      paymentRequestResponseData.merchantBusinessName;
  } catch (error) {
    if (errorHandler) {
      errorHandler(Error(`Failed to fetch payment details: ${error}`), 'PaymentDialog');
    }
  } finally {
    isFetchingInitialData.value = false;
  }
}

async function fetchBanksList() {
  isFetchingInitialData.value = true;

  try {
    const paymentsService = new PaymentsService();
    const banksResponseData: BankData[] = await paymentsService.fetchConsumerBankInstitutions();
    banksList.value = banksResponseData;
  } catch (error) {
    if (errorHandler) {
      errorHandler(Error(`Failed to fetch banks: ${error}`), 'PaymentDialog');
    }
  } finally {
    isFetchingInitialData.value = false;
  }
}

const handleResize = () => {
  width.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.payment-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.payment-dialog {
  background: var(--base-white);
  border-radius: 16px;
  width: 60%;
  max-width: 1200px;
  max-width: 1200px;
  height: 60%;
  max-height: 60vh;
  overflow: hidden;
  max-height: 60vh;
  overflow: hidden;
}

.content-row {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}

.left-pane {
  overflow-y: auto;
  height: 100%;
}

/* Scrollbar styling */
.left-pane::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.left-pane::-webkit-scrollbar-track {
  background: transparent;
  margin: 24px 0;
}

.left-pane::-webkit-scrollbar-thumb {
  background-color: var(--grey-200);
  border-radius: 3px;
}

.left-pane::-webkit-scrollbar-thumb:hover {
  background-color: var(--grey-300);
}

/* Desktop and large tablets */
@media (min-width: 1025px) {
  .payment-dialog {
    height: 65%;
    max-height: 65vh;
  }
}

/* iPad Pro */
@media (min-width: 1024px) and (max-width: 1366px) {
  .payment-dialog {
    width: 85%;
    max-height: 60vh;
  }

  .left-pane,
  .right-pane {
    flex: 1;
    min-width: 50%;
  }
}

/* iPad Pro in portrait mode */
@media (min-width: 1024px) and (max-width: 1366px) and (orientation: portrait) {
  .payment-dialog {
    width: 85%;
    height: 40%;
    max-height: 40vh;
  }
}

/* iPad and smaller tablets */
@media (min-width: 768px) and (max-width: 1023px) {
  .payment-dialog {
    width: 80%;
    height: 80%;
    max-height: 80vh;
  }

  .left-pane {
    flex: 1;
    min-width: 50%;
  }

  .right-pane {
    flex: 1;
    min-width: 50%;
  }
}

/* iPad in portrait mode */
@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
  .payment-dialog {
    width: 100%;
    height: 45%;
    max-height: 45vh;
  }

  .left-pane {
    display: none;
  }

  .payment-dialog-container {
    align-items: end;
  }

  .content-row {
    flex-direction: column;
  }
}

/* Mobile devices */
@media (max-width: 768px) {
  .payment-dialog {
    width: 100%;
    height: 75%;
    max-height: 75vh;
    border-radius: 16px 16px 0 0;
  }

  .payment-dialog-container {
    align-items: end;
  }

  .content-row {
    flex-direction: column;
  }

  .left-pane {
    display: none;
  }
}

/* Small height screens */
@media (max-height: 668px) {
  .payment-dialog {
    height: 90%;
    max-height: 90vh;
  }
}

@media (max-height: 668px) and (orientation: landscape) {
  .payment-dialog {
    width: 100%;
  }

  .left-pane {
    display: none;
  }

  .payment-dialog-container {
    align-items: end;
  }

  .content-row {
    flex-direction: column;
  }
}
</style>
