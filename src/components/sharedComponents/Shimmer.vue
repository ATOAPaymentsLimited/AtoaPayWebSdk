<template>
  <div class="shimmer" :style="shimmerStyles">
    <div class="shimmer-animation"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: [String, Number],
    default: "100%",
  },
  height: {
    type: [String, Number],
    default: "20px",
  },
});

const shimmerStyles = computed(() => ({
  width: typeof props.width === "number" ? `${props.width}px` : props.width,
  height: typeof props.height === "number" ? `${props.height}px` : props.height,
}));
</script>

<style>
.shimmer {
  position: relative;
  background: var(--grey-50);
  border-radius: 6px;
  overflow: hidden;
}

.shimmer-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0%,
      var(--grey-100) 50%,
      rgba(255, 255, 255, 0) 100%,
    );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>