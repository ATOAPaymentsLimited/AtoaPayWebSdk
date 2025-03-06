<template>
  <div class="payment-dialog-container">
    <div class="payment-dialog" role="dialog" aria-modal="true">
      <div class="content-row">
        <LeftPane :is-loading="isFetchingInitialData" />
        <RightPane :is-fetching-initial-data="isFetchingInitialData" @close="emit('close')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LeftPane from '@/components/leftPane/LeftPane.vue';
import RightPane from "@/components/rightPane/RightPane.vue";
import { PaymentsService } from '@/core/services/PaymentsService';
import type BankData from '@/core/types/BankData';
import { EnvironmentTypeEnum } from '@/core/types/Environment';
import type PaymentDetails from '@/core/types/PaymentDetails';
import { onMounted, ref, provide, type PropType } from 'vue';

const isFetchingInitialData = ref(true);
const paymentRequestDetails = ref<PaymentDetails>();
const banksList = ref<BankData[]>([]);

const props = defineProps({
  paymentRequestId: {
    type: String,
    required: true,
  },
  qrCodeUrl: {
    type: String,
    required: true,
  },
  environment: {
    type: Object as PropType<EnvironmentTypeEnum>,
    required: true,
  }
});

const emit = defineEmits<{
  close: []
}>();

provide('paymentRequestId', props.paymentRequestId);
provide('qrCodeUrl', props.qrCodeUrl);
provide('banksList', banksList);
provide('paymentRequestDetails', paymentRequestDetails);
provide('environment', props.environment);

onMounted(() => {
  fetchPaymentRequestDetails();
  fetchBanksList();
});

async function fetchPaymentRequestDetails() {
  isFetchingInitialData.value = true;

  try {
    const paymentsService = new PaymentsService();
    const paymentRequestResponseData: PaymentDetails = await paymentsService.fetchPaymentDetails(props.paymentRequestId);
    paymentRequestDetails.value = paymentRequestResponseData;
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
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
    console.error('Failed to fetch banks:', error);
  } finally {
    isFetchingInitialData.value = false;
  }
}
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
  height: 60%;
}

.content-row {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}
</style>