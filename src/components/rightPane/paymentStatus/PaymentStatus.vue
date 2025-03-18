<template>
  <div class="payment-status">
    <div v-show="showSuccessAnimation" class="success-content fade-out">
      <div class="success-animation">
        <img src="https://atoa-gifs.s3.eu-west-2.amazonaws.com/payment_success.gif" alt="Payment Success"
          class="success-gif" />
      </div>
      <div class="success-title">Payment successful</div>
    </div>

    <div v-if="isMobileWidth && !showSuccessAnimation">
      <PaymentMerchantDetails :amount="paymentDetails?.amount?.amount || 0"
        :merchant-business-name="paymentDetails?.merchantBusinessName || ''"
        :store-location-name="paymentDetails?.storeDetails?.locationName" :store-url="paymentDetails?.storeImg || ''" />
    </div>

    <div v-show="!showSuccessAnimation" class="next-content slide-up">
      <PaymentDetailsUI :request-status-details="requestStatusDetails" />
      <div v-show="showCountdown" class="redirect-message">
        You will be redirected in <strong>{{ countdown }}</strong> seconds
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, onUnmounted, type Ref, type ComputedRef } from 'vue';
import PaymentDetailsUI from '@/components/rightPane/paymentDetails/PaymentDetailsUI.vue';
import PaymentMerchantDetails from '@/components/rightPane/paymentDetails/PaymentMerchantDetails.vue';
import { EnvironmentTypeEnum } from '@/core/types/Environment';
import type PaymentDetails from '@/core/types/PaymentDetails';
import type PaymentRequestStatusDetails from '@/core/types/PaymentRequestStatusDetails';
import { PaymentsService } from '@/core/services/PaymentsService';

const emit = defineEmits<{
  success: [data?: any],
}>(); const showSuccessAnimation = ref(false);
const paymentService = new PaymentsService();
const requestStatusDetails = ref<PaymentRequestStatusDetails>();
const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');
const paymentRequestId = inject<string>('paymentRequestId');
const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const environment = inject<EnvironmentTypeEnum>('environment');
const errorHandler = inject<(error: Error, componentName: string) => void>('errorHandler');
const pollInterval = ref<number | null>(null);
const countdown = ref(5);
const showCountdown = ref(false);

const triggerSuccessView = () => {
  showSuccessAnimation.value = true;
  setTimeout(() => {
    showSuccessAnimation.value = false;
    showCountdown.value = true;
    startCountdown();
  }, 3000);
};

const pollPaymentStatus = async () => {
  try {
    const result = await paymentService.getPaymentStatusByID(
      paymentRequestId || "",
      { env: environment || EnvironmentTypeEnum.SANDBOX }
    );

    requestStatusDetails.value = result;

    if (result.status === "COMPLETED") {
      triggerSuccessView();
      if (pollInterval.value) {
        clearInterval(pollInterval.value);
      }
    } else if (['EXPIRED', 'FAILED'].includes(result.status)) {
      if (pollInterval.value) {
        clearInterval(pollInterval.value);
        showCountdown.value = true;
        startCountdown();
      }
    }
  } catch (error) {
    if (errorHandler) {
      errorHandler(Error(`Error while polling payment status:: ${error}`), 'PaymentDialog');
    }
  }
};

const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      emit(
        'success',
        {
          paymentIdempotencyId: requestStatusDetails.value?.transactionDetails?.[0]?.paymentIdempotencyId,
          status: requestStatusDetails.value?.status
        },
      );
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
.payment-status {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: center;
}

.success-content {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.success-animation {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  animation-duration: 0.5s !important;
  animation-timing-function: linear !important;
}

.success-gif {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.success-title {
  font-size: 16px;
  font-weight: 700;
  height: 1.45;
  color: var(--base-black);
}

.fade-out {
  animation: fadeOutUp 0.5s ease-out 1.5s forwards;
}

.slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

.next-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  /* Start hidden */
}

@keyframes fadeOutUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-100px);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.payment-amount-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--base-black);
}

.redirect-message {
  font-size: 14px;
  height: 1.5;
  color: var(--base-black);
  margin-top: 20px;
  width: 100%;
}
</style>
