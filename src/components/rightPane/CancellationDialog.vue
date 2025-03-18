<template>
  <Transition name="fade">
    <div v-if="show" class="cancellation-overlay">
      <div class="cancellation-dialog">
        <h2 class="dialog-title">Cancel the payment?</h2>
        <p class="dialog-warning">Are you sure you want to cancel this payment?<br />This action cannot be undone.</p>

        <div class="dialog-actions">
          <button class="dialog-button dismiss" @click="$emit('dismiss')">
            No, dismiss
          </button>
          <button class="dialog-button confirm" @click="$emit('confirm')">
            Yes, cancel payment
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>();

defineEmits<{
  dismiss: [],
  confirm: []
}>();
</script>

<style scoped>
.cancellation-overlay {
  border-top-right-radius: 16px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.cancellation-dialog {
  background-color: var(--base-white);
  border-radius: 16px 16px 0 0;
  padding: 24px;
  width: 100%;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--base-black);
}

.dialog-warning {
  font-size: 14px;
  color: var(--grey-500);
}

.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.dialog-button {
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dialog-button.dismiss {
  background-color: var(--grey-50);
  border: none;
  color: var(--base-black);
}

.dialog-button.dismiss:hover {
  background-color: var(--grey-100);
}

.dialog-button.confirm {
  background-color: var(--base-black);
  border: none;
  color: white;
}

.dialog-button.confirm:hover {
  background-color: var(--grey-900);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>