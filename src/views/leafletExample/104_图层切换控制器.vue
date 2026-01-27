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
/* 样式与上一个案例类似，确保布局一致 */
.map-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  font-family: sans-serif;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .map-wrapper {
    flex-direction: row;
  }
}

.control-panel {
  flex-shrink: 0;
  width: 100%;
  padding: 20px;
  background-color: #f8f8f8;
  border-right: 1px solid #eee;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (min-width: 768px) {
  .control-panel {
    width: 280px;
    height: 100%;
  }
}

.control-panel h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2em;
}

.map-container {
  flex-grow: 1;
  height: 100%;
  min-height: 300px;
  background-color: #e0e0e0;
}

.reset-button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  margin-top: auto;
}

.reset-button:hover {
  background-color: #0056b3;
}

.reset-button:active {
  background-color: #004085;
}
</style>
