<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>图层切换控制器</h2>
      <p>使用地图右上角的控件切换底图和叠加层。</p>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-layer-switcher" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let map = null;
let layerControl = null;

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map('map-layer-switcher').setView(initialView, initialZoom);

  // 定义不同的底图
  const gaodeNormal = L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    name: '高德普通地图'
  });

  const gaodeSatellite = L.tileLayer('https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德卫星地图</a>',
    name: '高德卫星地图'
  });

  // 默认加载普通地图
  gaodeNormal.addTo(map);

  // 定义叠加层
  const markers = L.layerGroup();
  L.marker([39.909186, 116.397479]).bindPopup("天安门广场").addTo(markers);
  L.marker([39.92, 116.42]).bindPopup("另一个标记点").addTo(markers);

  const shapes = L.layerGroup();
  L.polyline([[39.90, 116.35], [39.95, 116.40], [39.90, 116.45]], {color: 'red'}).addTo(shapes);
  L.polygon([[39.88, 116.38], [39.88, 116.42], [39.85, 116.42], [39.85, 116.38]], {color: 'blue', fillColor: '#f03', fillOpacity: 0.5}).addTo(shapes);

  // 将叠加层默认添加到地图
  markers.addTo(map);
  shapes.addTo(map);

  // 创建底图对象
  const baseLayers = {
    "高德普通地图": gaodeNormal,
    "高德卫星地图": gaodeSatellite
  };

  // 创建叠加层对象
  const overlayLayers = {
    "标记点": markers,
    "绘制图形": shapes
  };

  // 添加图层控制器到地图
  layerControl = L.control.layers(baseLayers, overlayLayers).addTo(map);
});

onUnmounted(() => {
  if (map) {
    if (layerControl) {
      map.removeControl(layerControl); // 移除图层控制器
    }
    map.remove();
    map = null;
    layerControl = null;
  }
});

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
  }
};
</script>

<style scoped>
.map-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  font-family: sans-serif;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: #e0e0e0;
}

.control-panel {
  position: absolute;
  top: 10px;
  left: 80px;
  z-index: 1000;
  width: 240px;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.control-panel h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.control-panel p {
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.reset-button {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
  margin-top: 5px;
}

.reset-button:hover {
  background-color: #0056b3;
}

.reset-button:active {
  background-color: #004085;
}
</style>
