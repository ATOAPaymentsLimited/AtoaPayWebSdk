<template>
  <!-- Success -->
  <div class="status-section">
    <div class="status-icon">
      <img src="@/assets/images/icon_success.svg" alt="Payment Success" />
    </div>
    <div class="status-info">
      <div class="status-title">Paid</div>
      <div class="status-message">Payment successful.</div>
    </div>
  </div>

  <!-- Failed -->
  <!-- <div class="status-section">
    <div class="status-icon">
      <img src="@/assets/images/icon_failed.svg" alt="Payment Success" />
    </div>
    <div class="status-info">
      <div class="status-title">Failed</div>
      <div class="status-message">Atoa is working fine but your bank's network is experiencing issues. Please try
        the payment using a different bank app.</div>
    </div>
  </div> -->

  <!-- Expired -->
  <!-- <div class="status-section">
    <div class="status-icon">
      <img src="@/assets/images/icon_expired.svg" alt="Payment Success" />
    </div>
    <div class="status-info">
      <div class="status-title">Expired</div>
      <div class="status-message">The payment you're trying to make has expired.</div>
    </div>
  </div> -->

  <!-- Processing -->
  <!-- <div class="status-section">
    <div class="status-icon">
      <img src="@/assets/images/icon_processing.gif" alt="Payment Success" class="processing-icon" />
    </div>
    <div class="status-info">
      <div class="status-title">Processing</div>
      <div class="status-message">Payment under processing.</div>
    </div>
  </div> -->

  <PaymentDetailsInfo />
</template>

<script setup lang="ts">
import PaymentDetailsInfo from './PaymentDetailsInfo.vue';
</script>

<style scoped>
.status-section {
  display: flex;
  width: 100%;
  gap: 16px;
  padding: 16px;
  background-color: var(--positive-subtle);
  border-radius: 16px;
  margin: 16px 0px;
  box-sizing: border-box;
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
</style>
