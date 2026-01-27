<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>时间维度数据可视化</h2>
      <p>拖动滑块查看不同时间段的数据点。</p>
      <div class="time-slider-container">
        <label for="time-slider">当前时间: {{ currentYear }}年</label>
        <input
          type="range"
          id="time-slider"
          min="2020"
          max="2024"
          step="1"
          v-model="currentYear"
          @input="updateVisibleData"
        />
      </div>
      <div class="info-display">
        <p>
          当前显示数据点数量: <strong>{{ visibleDataCount }}</strong>
        </p>
      </div>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-time-data" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

let map = null;
let dataLayerGroup = null; // 用于存储时间数据点

const currentYear = ref(2022); // 初始年份
const visibleDataCount = ref(0);

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

// 模拟数据点，每个点包含一个年份属性
const allDataPoints = [];
for (let i = 0; i < 500; i++) {
  const lat = 39.909186 + (Math.random() - 0.5) * 0.5;
  const lng = 116.397479 + (Math.random() - 0.5) * 0.5;
  const year = 2020 + Math.floor(Math.random() * 5); // 2020-2024年
  allDataPoints.push({ lat, lng, year, id: i });
}

onMounted(() => {
  map = L.map("map-time-data").setView(initialView, initialZoom);

  L.tileLayer(
    "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    }
  ).addTo(map);

  dataLayerGroup = L.layerGroup().addTo(map);

  // 初始加载数据
  updateVisibleData();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    dataLayerGroup = null;
  }
});

const updateVisibleData = () => {
  if (!map || !dataLayerGroup) return;

  dataLayerGroup.clearLayers(); // 清除当前显示的所有点
  let count = 0;

  allDataPoints.forEach((point) => {
    if (point.year <= currentYear.value) {
      // 显示当前年份及之前的数据
      L.circleMarker([point.lat, point.lng], {
        radius: 5,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup(`数据点 ID: ${point.id}<br>年份: ${point.year}`)
        .addTo(dataLayerGroup);
      count++;
    }
  });
  visibleDataCount.value = count;
};

// 监听 currentYear 变化，实时更新地图
watch(currentYear, updateVisibleData);

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
    currentYear.value = 2022; // 重置年份
    updateVisibleData(); // 重新更新数据
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
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: #333;
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

.time-slider-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.time-slider-container label {
  font-weight: bold;
  color: #333;
}

.time-slider-container input[type="range"] {
  width: 100%;
  -webkit-appearance: none; /* 移除默认样式 */
  height: 8px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
  border-radius: 5px;
}

.time-slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.time-slider-container input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
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

.reset-button {
  background-color: #007bff;
  color: white;
  margin-top: auto;
}

.reset-button:hover {
  background-color: #0056b3;
}

.reset-button:active {
  background-color: #004085;
}
</style>
