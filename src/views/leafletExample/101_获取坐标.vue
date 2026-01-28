<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>地图事件监听</h2>
      <div class="info-display">
        <p>点击地图获取坐标：</p>
        <p><strong>经度 (Lng):</strong> {{ lng !== null ? lng.toFixed(6) : "N/A" }}</p>
        <p><strong>纬度 (Lat):</strong> {{ lat !== null ? lat.toFixed(6) : "N/A" }}</p>
      </div>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-events" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

let map = null;
const lat = ref(null);
const lng = ref(null);

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map("map-events").setView(initialView, initialZoom);

  L.tileLayer(
    "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    },
  ).addTo(map);

  // 监听地图点击事件
  map.on("click", (e) => {
    lat.value = e.latlng.lat;
    lng.value = e.latlng.lng;
    console.log("地图被点击:", e.latlng);
  });
});

onUnmounted(() => {
  if (map) {
    map.off("click"); // 移除事件监听器
    map.remove();
    map = null;
  }
});

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
    lat.value = null;
    lng.value = null;
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
  right: 10px;
  z-index: 1000;
  width: 240px;
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

.info-display {
  background-color: rgba(233, 236, 239, 0.8);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  color: #495057;
}

.info-display p {
  margin: 5px 0;
  font-size: 14px;
}

.info-display strong {
  color: #007bff;
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
