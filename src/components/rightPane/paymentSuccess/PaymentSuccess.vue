<template>
  <div class="payment-success">
    <div v-show="!showNextUI" class="success-content fade-out">
      <div class="success-animation">
        <img src="@/assets/images/payment_success.gif" alt="Payment Success" class="success-gif" />
      </div>
      <div class="success-title">Payment successful</div>
    </div>

    <div v-show="showNextUI" class="next-content slide-up">
      <div
        v-if="isMobile"
        class="image-container"
        style="margin-top: 12px; margin-bottom: 12px"
      >
        <img
          :src="storeImageUrl || '@/assets/images/store-image-placeholder.png'"
          alt="Store Image"
          class="store-image"
          width="40px"
          height="40px"
          style="border-radius: 8px; margin-bottom: 12px"
        />
        <div class="merchant-business-name" style="margin-bottom: 12px">
          To <b>{{ merchantBusinessName }}</b>
        </div>
        <span class="payment-amount-text"
          >£ {{ paymentAmount?.toFixed(2) }}</span
        >
      </div>
      <PaymentDetails />
      <div class="redirect-message">
        You will be redirected in <strong>{{ countdown }}</strong> seconds
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from "vue";
import PaymentDetails from "@/components/rightPane/paymentDetails/PaymentDetails.vue";

const emit = defineEmits(['close']);
const showNextUI = ref(false);
const countdown = ref(5);
const paymentAmount: number | undefined = inject("paymentAmount");
const storeImageUrl: string | undefined = inject("storeImageUrl");
const merchantBusinessName: string | undefined = inject("merchantBusinessName");
const isMobile: boolean = inject("isMobile") || false;

onMounted(() => {
  setTimeout(() => {
    showNextUI.value = true;
    startCountdown();
  }, 2000);
});

const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      emit('close');
    }
  }, 1000);
};
</script>

<style scoped>
.payment-success {
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

.redirect-message {
  font-size: 14px;
  height: 1.5;
  color: var(--base-black);
  margin-top: 8px;
  width: 100%;
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
</style>
