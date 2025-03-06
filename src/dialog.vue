<template>
  <div class="sdk-dialog-container">
    <div class="sdk-dialog" role="dialog" aria-modal="true">
      <PaymentDialog :payment-request-id="paymentRequestId" :payment-url="paymentUrl" :qr-code-url="qrCodeUrl"
        @close="emit('close')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PaymentDialog from '@/components/PaymentDialog.vue';
import { onErrorCaptured, onMounted } from 'vue';
import { sdkTheme } from "@/assets/colors/colors";

defineProps<{
  paymentRequestId: string,
  qrCodeUrl: string,
  paymentUrl: string,
}>();

onErrorCaptured((error, instance, info) => {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    componentName: instance?.$options?.name || 'Dialog',
    errorInfo: info,
    componentData: instance ? JSON.stringify(instance.$data, null, 2) : null,
    props: instance ? JSON.stringify(instance.$props, null, 2) : null,
    timestamp: new Date().toISOString()
  };

  console.error('[Atoa Payment SDK Error]:', errorDetails);

  // Return false to prevent error from propagating
  return false;
});

// Function to load Figtree font globally
const loadFigtreeFont = () => {
  if (!document.querySelector('link[href*="Figtree"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }
};

// Load the font immediately
loadFigtreeFont();

onMounted(() => {
  Object.entries(sdkTheme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, String(value));
  });
});

const emit = defineEmits(['confirm', 'cancel', 'close']);
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

.padding-xl {
  padding: 20px;
}

.padding-huge {
  padding: 24px;
}

.lds-space-500-y {
  padding: 40px 0;
}
</style>