<template>
  <div class="payment-options">
    <div v-if="isMobileWidth" class="bank-app-info">
      <img src="@/assets/images/icon_info.svg" height="16px" width="16px" />
      <p class="bank-app-confirmation">
        We'll send you to your bank's app or website to confirm this payment.
      </p>
    </div>

    <div v-if="isMobileWidth" class="mobile-merchant-details">
      <div class="payment-options-header">
        <div class="merchant-details-row">
          <div class="store-image">
            <img :src="!(paymentRequestDetails?.storeImg) ? storeImagePlaceholder : paymentRequestDetails?.storeImg"
              height="40px" width="40px" />
          </div>
          <div class="merchant-details-column">
            <div class="paying-to">
              Paying to
            </div>
            <div class="merchant-business-name">
              {{ paymentRequestDetails?.merchantBusinessName }}
            </div>
          </div>
        </div>
        <div class="payment-amount">
          £{{ paymentRequestDetails?.amount?.amount.toFixed(2) ?? 0.00 }}
        </div>
      </div>
    </div>

    <div class="payment-options-header">
      <div class="bank-info">
        <div class="bank-logo">
          <img :src="getBankLogo(selectedBank)" :alt="selectedBank?.name" />
        </div>
        <div class="bank-name">
          <div class="bank-name-label">Paying from</div>
          <div class="bank-name-value">{{ selectedBank?.name }}</div>
        </div>
      </div>
      <button class="change-button" @click="$emit('bankChange')">Change</button>
    </div>

    <div v-if="fetchAuthorisationError" class="authorisation-error-container">
      <div class="error-icon">
        <img src="@/assets/images/icon_warning.svg" alt="Warning" class="error-warning-image">
        <p>Downtime</p>
      </div>
      <div class="error-message">
        <p><strong>{{ selectedBank?.name }}</strong> bank is currently down for maintenance. Please select a
          different bank and try
          again.</p>
      </div>
      <button class="error-overlay-btn" @click="$emit('bankChange')">Select different bank</button>
    </div>
    <div v-else>
      <div v-if="isMobile()" class="mobile-footer-section">
        <button class="go-to-bank-button" @click="handleGoToBankButtonClick">
          Go to {{ selectedBank.name }}
        </button>
        <div class="powered-by">
          Powered by <img src="@/assets/images/atoa_logo.svg" alt="AtoA" class="atoa-small-logo" />
        </div>
        <div class="atoa-terms">
          <a href="https://paywithatoa.co.uk/terms/" class="footer-link">Atoa's terms</a> and
          <a href="https://paywithatoa.co.uk/atoa-business-privacy-policy/" class="footer-link">privacy policy</a>.
        </div>
      </div>
      <div v-else class="desktop-footer-section">
        <div class="qr-section">
          <p class="qr-instructions-bold">Scan with your phone camera</p>
          <p class="qr-instructions">to confirm in your bank app.</p>
          <div class="qr-container">
            <div v-if="isLoading" class="qr-code-placeholder">
              <div class="loading-spinner"></div>
            </div>
            <div v-else-if="qrLoadError" class="qr-error">
              QR code failed to load. Please try refreshing the page.
            </div>
            <div v-else class="qrcode">
              <vue-qrcode :value="paymentUrl" tag="svg" :options="{
                errorCorrectionLevel: 'Q',
                width: 250,
              }"></vue-qrcode>
              <img class="qrcode-mask-image" src="@/assets/images/atoa_logo_primary.svg" alt="Atoa Logo" />
            </div>
          </div>
        </div>

        <div class="divider">
          <span>Or</span>
        </div>

        <a :href="bankWebsiteUrl" target="_blank" class="bank-website-link">
          Go to your bank website
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import storeImagePlaceholder from "@/assets/images/store_image_placeholder.svg";
import { ref, onMounted, inject, type Ref, type ComputedRef, onBeforeUnmount } from 'vue';
import type BankData from '@/core/types/BankData';
import type PaymentDetails from '@/core/types/PaymentDetails';
import { PaymentsService } from '@/core/services/PaymentsService';
import type PaymentAuthResponse from '@/core/types/PaymentAuthResponse';
import { EnvironmentTypeEnum } from '@/core/types/Environment';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import type PaymentRequestStatusDetails from '@/core/types/PaymentRequestStatusDetails';
import { goToBank, isMobile } from '@/core/utils/common';

const props = defineProps<{
  selectedBank: BankData;
  paymentDetails: PaymentDetails,
}>();

const bankWebsiteUrl = ref('');
const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');

const emit = defineEmits<{
  (e: 'bankChange'): void;
  (e: 'statusChange', requestStatusDetails: PaymentRequestStatusDetails): void;
}>();

const paymentRequestId = inject<string>('paymentRequestId');
const paymentRequestDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const environment = inject<EnvironmentTypeEnum>('environment');
const paymentUrl = inject<string>('paymentUrl');
const errorHandler = inject<(error: Error, componentName: string) => void>('errorHandler');
const qrLoadError = ref(false);
const paymentAuthResponse = ref<PaymentAuthResponse | null>(null);
const isLoading = ref(true);
const pollInterval = ref<number | null>(null);
const fetchAuthorisationError = ref<string | null>(null);
const paymentsService = new PaymentsService();

const getBankLogo = (bank: BankData | undefined) => {
  if (!bank) return '';
  const logoMedia = bank.media.find(m => m.type === 'logo');
  return logoMedia ? logoMedia.source : '';
};

const handleGoToBankButtonClick = () => {
  goToBank(
    {
      authorisationUrl: paymentAuthResponse.value?.authorisationUrl ?? '',
      deepLinkAuthorisationUrlIOS: paymentAuthResponse.value?.deepLinkAuthorisationUrlIOS,
      businessAppDeepLinkAuthorisationUrl:
        paymentAuthResponse.value?.businessAppDeepLinkAuthorisationUrl,
      businessAppDeepLinkAndroidAuthorisationUrl:
        paymentAuthResponse.value?.businessAppDeepLinkAndroidAuthorisationUrl,
      deepLinkAuthorisationUrl: paymentAuthResponse.value?.deepLinkAuthorisationUrl,
      businessAppDeepLinkAuthorisationUrlIOS:
        paymentAuthResponse.value?.businessAppDeepLinkAuthorisationUrlIOS,
    },
    props.selectedBank.businessBank,
  );
}

const fetchAuthorisationData = async () => {
  try {
    fetchAuthorisationError.value = null;
    isLoading.value = true;
    const authResponseData = await paymentsService.callBankAuthorisationUrl(paymentRequestId, props.paymentDetails, props.selectedBank);
    paymentAuthResponse.value = authResponseData;
    bankWebsiteUrl.value = authResponseData?.authorisationUrl;
  } catch (error: unknown) {
    if (errorHandler) {
      errorHandler(Error(`Failed to fetch authorisation URL: ${error}`), 'PaymentDialog');
    }
    fetchAuthorisationError.value = error instanceof Error ? error.message : String(error);
  } finally {
    isLoading.value = false;
  }
}

const checkPaymentStatus = async () => {
  try {
    // TODO: Confirm this logic
    const requestStatusData = await paymentsService.getPaymentStatusByID(
      paymentRequestId || "",
      { env: environment || EnvironmentTypeEnum.PRODUCTION }
    );

    if (!['PAYMENT_NOT_INITIATED', 'AWAITING_AUTHORIZATION'].includes(requestStatusData.status)) {
      clearInterval(pollInterval.value!);
      emit('statusChange', requestStatusData);
    }
  } catch (error) {
    if (errorHandler) {
      errorHandler(Error(`Failed to check payment status: ${error}`), 'PaymentDialog');
    }
  }
};

onMounted(() => {
  fetchAuthorisationData();
  pollInterval.value = setInterval(checkPaymentStatus, 1000);
});

onBeforeUnmount(() => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value);
  }
});
</script>

<style scoped>
.payment-options {
  height: 100%;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.payment-options-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--grey-50);
  border-radius: 12px;
  margin-bottom: 24px;
  box-sizing: border-box;
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bank-app-info {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  background: var(--info-subtle);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--info-darker);
  box-sizing: border-box;
}

.bank-app-confirmation {
  margin: 0;
  font-size: 12px;
}

.bank-logo {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--grey-200);
  border-radius: 8px;
  padding: 8px;
}

.bank-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.bank-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bank-name-label {
  font-size: 11px;
  color: var(--grey-500);
  font-weight: 500;
}

.bank-name-value {
  font-size: 14px;
  color: var(--base-black);
  font-weight: 600;
}

.change-button {
  color: var(--primary-500);
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  line-height: 150%;
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-decoration-skip-ink: none;
  text-decoration-thickness: 10%;
  text-underline-offset: 25%;
  text-underline-position: from-font;
}

.qr-section {
  text-align: center;
}

.qr-instructions-bold {
  font-size: 14px;
  color: var(--grey-600);
  margin: 0;
  margin-bottom: 8px;
  font-weight: 700;
}

.qr-instructions {
  font-size: 14px;
  color: var(--grey-600);
  margin: 0;
  margin-bottom: 8px;
  font-weight: 400;
}

.qr-container {
  background: var(--base-white);
  margin: 24px 0;
  border-radius: 12.8px;
  border: 0.8px solid var(--Neutral-Grey-200, #EAEEF0);
  background: var(--Neutral-Grey-50, #F6F8F9);
}

.qrcode {
  padding: 12px;
  display: inline-block;
  font-size: 0;
  margin-bottom: 0;
  position: relative;
}

.qrcode-mask-image {
  background-color: var(--base-white);
  border-radius: 6px;
  overflow: hidden;
  position: absolute;
  padding: 14px 6px;
  top: 43%;
  left: 43%;
  margin: auto;
}

.qr-code :deep(svg) {
  width: 100%;
  height: 100%;
}

.qr-code-placeholder {
  width: 250px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--grey-50);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--grey-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  width: 100%;
  text-align: center;
  border-bottom: 1px solid var(--grey-200);
  line-height: 0.1em;
}

.divider span {
  background: var(--base-white);
  padding: 0 16px;
  color: var(--grey-400);
  font-size: 14px;
}

.bank-website-link {
  color: var(--base-black);
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--base-black);
  padding-bottom: 2px;
  margin-top: 24px;
}

.bank-website-link:hover {
  opacity: 0.8;
}

.qr-error {
  color: var(--primary-500);
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}

.desktop-footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mobile-merchant-details {
  width: 100%;
}

.mobile-footer-section {
  width: 100%;
}

.merchant-details-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.merchant-details-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.paying-to {
  font-size: 12px;
  color: var(--grey-500);
  font-weight: 600;
}

.merchant-business-name {
  font-size: 14px;
  color: var(--base-black);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.store-image {
  border: 1px solid var(--grey-100);
  border-radius: 6px;
  width: 40px;
  height: 40px;
}

.payment-amount {
  font-size: 16px;
  color: var(--base-black);
  font-weight: 700;
}

.store-image img {
  border-radius: 6px;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.go-to-bank-button {
  width: 100%;
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  font-family: inherit;
}

.atoa-terms {
  color: var(--grey-500);
  font-size: 11px;
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 4px;
}

.footer-link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  font-size: 11px;
}

.powered-by {
  text-align: center;
  color: var(--grey-500);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.atoa-small-logo {
  height: 12px;
  filter: invert(49%) sepia(17%) saturate(486%) hue-rotate(163deg) brightness(95%) contrast(89%);
}

.authorisation-error-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.error-icon {
  background-color: var(--error-subtle);
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding: 8px 12px;
  gap: 6px;
  width: fit-content;
}

.error-icon p {
  margin: 0px;
  padding: 0px;
  font-size: 11px;
  font-weight: 700;
  color: var(--error-default);
}

.error-warning-image {
  width: 24px;
  height: 24px;
}

.error-message p {
  margin: 0px;
  font-size: 16px;
  color: var(--base-black);
  margin-bottom: 24px;
  line-height: 1.45;
  text-align: center;
}

.error-overlay-btn {
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

.error-overlay-btn:hover {
  background-color: var(--grey-100);
}
</style>