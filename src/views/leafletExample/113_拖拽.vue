<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>高级地图事件 (拖拽标记点)</h2>
      <p>拖拽地图上的蓝色标记点，查看其坐标变化。</p>
      <div class="info-display">
        <p>标记点位置:</p>
        <p><strong>经度 (Lng):</strong> {{ markerCoords.lng ? markerCoords.lng.toFixed(6) : 'N/A' }}</p>
        <p><strong>纬度 (Lat):</strong> {{ markerCoords.lat ? markerCoords.lat.toFixed(6) : 'N/A' }}</p>
      </div>
      <button @click="resetMarkerPosition" class="action-button reset-button">重置标记点位置</button>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-draggable-marker" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let map = null;
let draggableMarker = null;

const initialMarkerPosition = [39.909186, 116.397479]; // 天安门广场
const markerCoords = ref({ lat: initialMarkerPosition[0], lng: initialMarkerPosition[1] });

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map('map-draggable-marker').setView(initialView, initialZoom);

  L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>'
  }).addTo(map);

  // 创建可拖拽标记点
  draggableMarker = L.marker(initialMarkerPosition, {
    draggable: true, // 设置为可拖拽
    autoPan: true // 拖拽时自动平移地图
  }).addTo(map)
    .bindPopup("拖拽我！")
    .openPopup();

  // 监听拖拽开始事件
  draggableMarker.on('dragstart', () => {
    console.log('标记点开始拖拽');
  });

  // 监听拖拽结束事件
  draggableMarker.on('dragend', (e) => {
    const newLatLng = e.target.getLatLng();
    markerCoords.value = { lat: newLatLng.lat, lng: newLatLng.lng };
    console.log('标记点拖拽结束，新位置:', newLatLng);
  });
});

onUnmounted(() => {
  if (map) {
    if (draggableMarker) {
      draggableMarker.off('dragstart');
      draggableMarker.off('dragend');
    }
    map.remove();
    map = null;
    draggableMarker = null;
  }
});

const resetMarkerPosition = () => {
  if (draggableMarker) {
    draggableMarker.setLatLng(initialMarkerPosition);
    markerCoords.value = { lat: initialMarkerPosition[0], lng: initialMarkerPosition[1] };
    map.setView(initialMarkerPosition, initialZoom); // 移动地图到标记点
    console.log('标记点位置已重置。');
  }
};

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
    resetMarkerPosition(); // 重置时也重置标记点位置
  }
};
</script>

<style scoped>
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

.info-display {
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  color: #495057;
}

.info-display p {
  margin: 5px 0;
  font-size: 0.95em;
}

.info-display strong {
  color: #007bff;
}

.map-container {
  flex-grow: 1;
  height: 100%;
  min-height: 300px;
  background-color: #e0e0e0;
}

.action-button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.action-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.reset-button {
  background-color: #007bff;
  color: white;
  margin-top: auto;
}

.reset-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.reset-button:active:not(:disabled) {
  background-color: #004085;
}
</style>
