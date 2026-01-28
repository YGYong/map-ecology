<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
/**
 * 依赖下载
 * npm install leaflet.markercluster
 */
import { ref, onMounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css'; // 聚合插件的CSS
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'; // 聚合插件默认主题CSS
import L from 'leaflet';
import 'leaflet.markercluster'; // 引入聚合插件JS

let map = null;
let markers = null;

const initialView = [39.909186, 116.397479];
const initialZoom = 10; // 初始缩放级别稍微小一点，更容易看到聚合效果

const mapContainer = ref(null);

onMounted(() => {
  map = L.map(mapContainer.value).setView(initialView, initialZoom);

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

</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
}
</style>
