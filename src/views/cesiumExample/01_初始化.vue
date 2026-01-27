<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

// 设置访问令牌
Cesium.Ion.defaultAccessToken = window.CESIUM_ION_TOKEN;

onMounted(() => {
  // 初始化Viewer
  viewer = new Cesium.Viewer(cesiumContainer.value, {});
});
</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
