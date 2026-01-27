<template>
  <div ref="hostEl" class="sandbox-host"></div>
</template>

<script setup>
import { onUnmounted, ref } from "vue";

const hostEl = ref(null);

function getHostElement() {
  return hostEl.value;
}

function clear() {
  if (hostEl.value) hostEl.value.innerHTML = "";
}

onUnmounted(() => {
  clear();
});

defineExpose({ getHostElement, clear });
</script>

<style scoped>
.sandbox-host {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #111827;
}
</style>

