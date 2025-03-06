<template>
  <div class="payment-details">
    <div class="payment-details-header">
      <img src="@/assets/images/icon_bill.svg" class="receipt-icon" />
      <div>Payment details</div>
    </div>

    <div class="debited-section">
      <div class="debited-from-text">Debited from</div>
      <div class="bank-details">
        <div class="bank-logo">
          <img src="@/assets/images/atoa_brand_logo.svg" alt="Lloyds Bank" />
        </div>
        <div class="bank-info">
          <div class="bank-name">Lloyds</div>
          <div class="account-number">XXXXXX047</div>
        </div>
      </div>
    </div>

    <div class="reference-section">
      <div class="reference-row">
        <div class="value-container">
          <div class="label-text">Reference ID</div>
          <div class="value-text">ATOA123131097763</div>
        </div>
        <button class="copy-button">
          <img src="@/assets/images/icon_copy.svg" alt="Copy" />
        </button>
      </div>

      <div class="reference-row">
        <div class="value-container">
          <div class="label-text">Order ID</div>
          <div class="value-text">abc12321334213</div>
        </div>
        <button class="copy-button">
          <img src="@/assets/images/icon_copy.svg" alt="Copy" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.payment-details {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--grey-200);
  width: 100%;
  box-sizing: border-box;
}

.payment-details-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 700;
  color: var(--base-black);
}

.receipt-icon {
  width: 20px;
  height: 20px;
}

.debited-section {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 8px;
}

.debited-from-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--base-black);
  margin-top: 24px;
  text-align: left;
}

.bank-details {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
}

.bank-logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  border: 1px solid var(--grey-200);
  border-radius: 8px;
  object-fit: contain;
  overflow: hidden;
}

.bank-info {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 2px;
}

.bank-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--base-black);
}

.account-number {
  font-size: 14px;
  color: var(--neutral-600);
}

.reference-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: none;
  padding-top: 20px;
  background-image: linear-gradient(to right, var(--grey-200) 2px, transparent 2px);
  background-size: 6px 2px;
  background-repeat: repeat-x;
}

.reference-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-text {
  font-size: 12px;
  color: var(--neutral-700);
}

.value-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
}

.value-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--base-black);
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
}

.copy-button img {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

.copy-button:hover img {
  opacity: 1;
}
</style>