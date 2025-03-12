<template>
  <div v-if="requestStatusDetails?.status === 'COMPLETED'" class="status-section completed">
    <div class="status-icon">
      <img src="@/assets/images/icon_success.svg" alt="Payment Success" />
    </div>
    <div class="status-info">
      <div class="status-title">Paid</div>
      <div class="status-message">Payment successful.</div>
    </div>
  </div>

  <div v-else-if="requestStatusDetails?.status === 'FAILED'" class="status-section failed">
    <div class="status-icon">
      <img src="@/assets/images/icon_failed.svg" alt="Payment Success" />
    </div>
    <div class="status-info">
      <div class="status-title">Failed</div>
      <div class="status-message">Atoa is working fine but your bank's network is experiencing issues. Please try
        the payment using a different bank app.</div>
    </div>
  </div>

  <div v-else-if="requestStatusDetails?.status === 'EXPIRED'" class="status-section expired">
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

  <PaymentDetailsInfo v-if="requestStatusDetails" :request-status-details="requestStatusDetails" />
</template>

<script setup lang="ts">
import PaymentDetailsInfo from '@/components/rightPane/paymentDetails/PaymentDetailsInfo.vue';
import type PaymentRequestStatusDetails from '@/core/types/PaymentRequestStatusDetails';
import type { PropType } from 'vue';

defineProps({
  requestStatusDetails: {
    type: Object as PropType<PaymentRequestStatusDetails>,
    required: false,
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
