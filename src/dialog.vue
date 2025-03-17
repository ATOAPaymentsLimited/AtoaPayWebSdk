<template>
  <script type="application/javascript" defer src="qrcode.vue.browser.min.js"></script>

  <link rel="preload" as="image" href="https://atoa-gifs.s3.eu-west-2.amazonaws.com/animated_grid.gif"
    fetchpriority="high" type="image/gif">
  <link rel="preload" as="image" href="https://atoa-gifs.s3.eu-west-2.amazonaws.com/loading_dots.gif"
    fetchpriority="high" type="image/gif">
  <link rel="preload" as="image" href="https://atoa-gifs.s3.eu-west-2.amazonaws.com/icon_processing.gif"
    fetchpriority="high" type="image/gif">
  <link rel="preload" as="image" href="https://atoa-gifs.s3.eu-west-2.amazonaws.com/payment_success.gif"
    fetchpriority="high" type="image/gif">

  <div class="sdk-dialog-container" ref="dialogContainer">
    <div class="sdk-dialog" role="dialog" aria-modal="true">
      <PaymentDialog :environment="environment" :payment-request-id="paymentRequestId"
        @success="(data) => emit('success', data)" @close="handleClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PaymentDialog from '@/components/PaymentDialog.vue';
import { onErrorCaptured, onMounted, provide, ref } from 'vue';
import { sdkTheme } from "@/assets/colors/colors";
import { EnvironmentTypeEnum } from '@/core/types/Environment';

const dialogContainer = ref<HTMLElement | null>(null);

const props = defineProps<{
  paymentRequestId: string,
  environment: EnvironmentTypeEnum,
  paymentUrl: string,
}>();

provide('environment', props.environment);
provide('paymentUrl', props.paymentUrl);

const handleError = (error: Error, componentName: string): void => {
  const errorDetails = {
    message: error.message,
    details: {
      componentName: componentName || 'Unknown',
      timestamp: new Date().toISOString()
    }
  };

  if (dialogContainer.value) {
    const event = new CustomEvent('error', {
      detail: errorDetails,
      bubbles: true,
      composed: true
    });
    dialogContainer.value.dispatchEvent(event);
  }
};

provide('errorHandler', handleError);

onErrorCaptured((error, instance) => {
  handleError(error, instance?.$options?.name || 'Dialog');
  // Return false to prevent error from propagating
  return false;
});

const loadFigtreeFont = () => {
  if (!document.querySelector('link[href*="Figtree"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }
};

loadFigtreeFont();

onMounted(() => {
  Object.entries(sdkTheme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, String(value));
  });
});

const emit = defineEmits<{
  close: [data?: any],
  success: [data?: any],
}>();

function handleClose(data: any) {
  if (dialogContainer.value) {
    const event = new CustomEvent('close', {
      detail: data,
      bubbles: true,
      composed: true
    });
    dialogContainer.value.dispatchEvent(event);
  }
}
</script>

<style>
.sdk-dialog-container {
  font-family: 'Figtree', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.lds-space-500-y {
  padding: 40px 0;
}
</style>