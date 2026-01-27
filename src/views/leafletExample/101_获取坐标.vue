<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>地图事件监听</h2>
      <div class="info-display">
        <p>点击地图获取坐标：</p>
        <p><strong>经度 (Lng):</strong> {{ clickedCoords.lng ? clickedCoords.lng.toFixed(6) : 'N/A' }}</p>
        <p><strong>纬度 (Lat):</strong> {{ clickedCoords.lat ? clickedCoords.lat.toFixed(6) : 'N/A' }}</p>
      </div>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-events" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let map = null;
const clickedCoords = ref({ lat: null, lng: null });

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map('map-events').setView(initialView, initialZoom);

  L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>'
  }).addTo(map);

  // 监听地图点击事件
  map.on('click', (e) => {
    clickedCoords.value = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    console.log('地图被点击:', e.latlng);
  });
});

onUnmounted(() => {
  if (map) {
    map.off('click'); // 移除事件监听器
    map.remove();
    map = null;
  }
});

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
    clickedCoords.value = { lat: null, lng: null }; // 重置坐标显示
  }
};
</script>

<style scoped>
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

.control-panel {
  flex-shrink: 0;
  width: 100%;
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