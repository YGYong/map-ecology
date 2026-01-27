<template>
  <div class="map-wrapper">
    <div id="map-cluster" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css'; // 聚合插件的CSS
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'; // 聚合插件默认主题CSS
import L from 'leaflet';
import 'leaflet.markercluster'; // 引入聚合插件JS

let map = null;
let markers = null;

const initialView = [39.909186, 116.397479];
const initialZoom = 10; // 初始缩放级别稍微小一点，更容易看到聚合效果

onMounted(() => {
  map = L.map('map-cluster').setView(initialView, initialZoom);

  L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>'
  }).addTo(map);

  // 创建一个标记点聚合图层
  markers = L.markerClusterGroup();

  // 随机生成1000个标记点
  const dummyMarkers = [];
  for (let i = 0; i < 1000; i++) {
    const lat = 39.909186 + (Math.random() - 0.5) * 0.5; // 在中心点附近随机生成
    const lng = 116.397479 + (Math.random() - 0.5) * 0.5;
    const marker = L.marker([lat, lng]).bindPopup(`标记点 ${i + 1}`);
    dummyMarkers.push(marker);
  }

  // 将所有标记点添加到聚合图层
  markers.addLayers(dummyMarkers);
  map.addLayer(markers);

  // 调整地图视图以适应所有标记点（可选，如果标记点范围很大）
  // map.fitBounds(markers.getBounds());
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    markers = null;
  }
});

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
  }
};
</script>

<style scoped>
/* 样式与上一个案例类似，确保布局一致 */
.map-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  font-family: sans-serif;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .map-wrapper {
    flex-direction: row;
  }
}

.map-container {
  flex-grow: 1;
  height: 100%;
  min-height: 300px;
  background-color: #e0e0e0;
}
</style>
