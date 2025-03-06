<template>
  <div v-if="transactionDetails?.status === 'COMPLETED'" class="status-section completed">
    <div class="status-icon">
      <img src="@/assets/images/icon_success.svg" alt="Payment Success" />
    </div>
    <div class="status-info">
      <div class="status-title">Paid</div>
      <div class="status-message">Payment successful.</div>
    </div>
  </div>

  <div v-else-if="transactionDetails?.status === 'FAILED'" class="status-section failed">
    <div class="status-icon">
      <img src="@/assets/images/icon_failed.svg" alt="Payment Success" />
    </div>
    <div class="status-info">
      <div class="status-title">Failed</div>
      <div class="status-message">Atoa is working fine but your bank's network is experiencing issues. Please try
        the payment using a different bank app.</div>
    </div>
  </div>

  <div v-else-if="transactionDetails?.status === 'EXPIRED'" class="status-section expired">
    <div class="status-icon">
      <img src="@/assets/images/icon_expired.svg" alt="Payment Success" />
    </div>
    <div class="status-info">
      <div class="status-title">Expired</div>
      <div class="status-message">The payment you're trying to make has expired.</div>
    </div>
  </div>

  <div v-else class="status-section processing">
    <div class="status-icon">
      <img src="@/assets/images/icon_processing.gif" alt="Payment Success" class="processing-icon" />
    </div>
    <div class="status-info">
      <div class="status-title">Processing</div>
      <div class="status-message">Payment under processing.</div>
    </div>
  </div>

  <PaymentDetailsInfo v-if="transactionDetails" :transaction-details="transactionDetails" />

  <div v-show="showCountdown" class="redirect-message">
    You will be redirected in <strong>{{ countdown }}</strong> seconds
  </div>
</template>

<script setup lang="ts">
import PaymentDetailsInfo from './PaymentDetailsInfo.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { PaymentsService } from '@/core/services/PaymentsService';
import type TransactionDetails from '@/core/types/TransactionDetails';
import { EnvironmentTypeEnum } from '@/core/types/Environment';

const paymentService = new PaymentsService();
const transactionDetails = ref<TransactionDetails | null>(null);
const paymentRequestId = inject<string>('paymentRequestId');
const environment = inject<EnvironmentTypeEnum>('environment');
const countdown = ref(5);
const showCountdown = ref(false);
const pollInterval = ref<number | null>(null);
const emit = defineEmits<{
  close: [],
}>();

const pollPaymentStatus = async () => {
  try {
    const result = await paymentService.getPaymentStatusByID(
      paymentRequestId || "",
      { env: environment || EnvironmentTypeEnum.SANDBOX }
    );

    console.log(JSON.stringify(result));
    transactionDetails.value = result;

    if (['COMPLETED', 'FAILED', 'EXPIRED'].includes(result.status)) {
      if (pollInterval.value) {
        clearInterval(pollInterval.value);
        showCountdown.value = true;
        startCountdown();
      }
    }
  } catch (error) {
    console.error('Error polling payment status:', error);
  }
};

const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      emit('close');
    }
  }, 1000);
};

onMounted(() => {
  pollPaymentStatus();
  pollInterval.value = setInterval(pollPaymentStatus, 3000);
});

onUnmounted(() => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value);
  }
});
</script>

<style scoped>
.status-section {
  display: flex;
  width: 100%;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  margin: 16px 0px;
  box-sizing: border-box;
}

.completed {
  background-color: var(--positive-subtle);
}

.failed {
  background-color: var(--negative-subtle);
}

.expired {
  background-color: var(--grey-100);
}

.processing {
  background-color: var(--notice-subtle);
}

.status-icon {
  width: 40px;
  height: 40px;
}

.status-info {
  flex: 1;
  justify-items: start;
}

.status-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: var(--base-black);
}

.status-message {
  font-size: 12px;
  color: var(--base-black);
  margin-top: 4px;
  text-align: left;
}

.processing-icon {
  width: 100%;
  border-radius: 50%;
  background-color: var(--notice-default);
  color: var(--base-white);
  object-fit: contain;
  box-sizing: border-box;
  padding: 4px;
}

.redirect-message {
  font-size: 14px;
  height: 1.5;
  color: var(--base-black);
  margin-top: 8px;
  width: 100%;
}
</style>
