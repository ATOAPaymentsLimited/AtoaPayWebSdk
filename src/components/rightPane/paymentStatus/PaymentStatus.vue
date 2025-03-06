<template>
  <div class="payment-status">
    <div v-show="!showNextUI" class="success-content fade-out">
      <div class="success-animation">
        <img src="@/assets/images/payment_success.gif" alt="Payment Success" class="success-gif" />
      </div>
      <div class="success-title">Payment successful</div>
    </div>

    <div v-show="showNextUI" class="next-content slide-up">
      <PaymentDetails @close="emit('close')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType } from 'vue';
import PaymentDetails from '@/components/rightPane/paymentDetails/PaymentDetails.vue';
import type TransactionDetails from '@/core/types/TransactionDetails';

const emit = defineEmits(['close']);
const props = defineProps({
  transactionDetails: {
    type: Object as PropType<TransactionDetails>,
    required: false,
  }
});

const showNextUI = ref(false);

onMounted(() => {
  if (props.transactionDetails?.status !== "COMPLETED") {
    triggerStatusUI();
  } else {
    setTimeout(() => {
      triggerStatusUI();
    }, 2000);
  }
});

const triggerStatusUI = () => {
  showNextUI.value = true;
};
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
  color: var(--base-black)
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
</style>