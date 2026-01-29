<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let map = null;
let layerControl = null;

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

const mapContainer = ref(null);

onMounted(() => {
  map = L.map(mapContainer.value).setView(initialView, initialZoom);

  // 定义不同的底图
  const gaodeSatellite = L.tileLayer('https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德卫星地图</a>',
    name: '高德卫星地图'
  });

  const gaodeNormal = L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    name: '高德普通地图'
  });

  // 默认加载普通地图
  gaodeSatellite.addTo(map);

  // 定义叠加层
  const markers = L.layerGroup();
  L.marker([39.909186, 116.397479]).bindPopup("天安门广场").addTo(markers);
  L.marker([39.92, 116.42]).bindPopup("另一个标记点").addTo(markers);

  const shapes = L.layerGroup();
  L.polyline([[39.90, 116.35], [39.95, 116.40], [39.90, 116.45]], { color: 'red' }).addTo(shapes);
  L.polygon([[39.88, 116.38], [39.88, 116.42], [39.85, 116.42], [39.85, 116.38]], { color: 'blue', fillColor: '#f03', fillOpacity: 0.5 }).addTo(shapes);

  // 将叠加层默认添加到地图
  markers.addTo(map);
  shapes.addTo(map);

  // 创建底图对象
  const baseLayers = {
    "高德卫星地图": gaodeSatellite,
    "高德普通地图": gaodeNormal
  };

  // 创建叠加层对象
  const overlayLayers = {
    "标记点": markers,
    "绘制图形": shapes
  };

  // 添加图层控制器到地图
  layerControl = L.control.layers(baseLayers, overlayLayers).addTo(map);
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
