<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>真实路径规划 (OSRM)</h2>
      <p>点击地图选择起点和终点，然后点击“规划路径”。</p>
      <div class="info-display">
        <p>
          <strong>起点:</strong>
          {{
            startPointCoords.lat
              ? startPointCoords.lat.toFixed(6) +
                ", " +
                startPointCoords.lng.toFixed(6)
              : "未选择"
          }}
        </p>
        <p>
          <strong>终点:</strong>
          {{
            endPointCoords.lat
              ? endPointCoords.lat.toFixed(6) +
                ", " +
                endPointCoords.lng.toFixed(6)
              : "未选择"
          }}
        </p>
        <p v-if="routeDistance">
          <strong>距离:</strong> {{ (routeDistance / 1000).toFixed(2) }} km
        </p>
        <p v-if="routeDuration">
          <strong>预计时间:</strong> {{ formatDuration(routeDuration) }}
        </p>
        <p v-if="loading" class="loading-text">规划中...</p>
        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
      <button
        @click="planRoute"
        :disabled="!startPointCoords.lat || !endPointCoords.lat || loading"
        class="action-button route-button"
      >
        规划路径
      </button>
      <button @click="clearRoute" class="action-button clear-button">
        清除路径
      </button>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-real-route" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

let map = null;
let startMarker = null;
let endMarker = null;
let routePolyline = null;

const startPointCoords = ref({ lat: null, lng: null });
const endPointCoords = ref({ lat: null, lng: null });
const routeDistance = ref(null);
const routeDuration = ref(null);
const loading = ref(false);
const error = ref(null);

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map("map-real-route").setView(initialView, initialZoom);

  L.tileLayer(
    // osm底图
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    }
  ).addTo(map);

  // 监听地图点击事件，用于选择起点和终点
  map.on("click", (e) => {
    if (!startPointCoords.value.lat) {
      startPointCoords.value = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (startMarker) map.removeLayer(startMarker);
      startMarker = L.marker(e.latlng).addTo(map).bindPopup("起点").openPopup();
    } else if (!endPointCoords.value.lat) {
      endPointCoords.value = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (endMarker) map.removeLayer(endMarker);
      endMarker = L.marker(e.latlng).addTo(map).bindPopup("终点").openPopup();
    } else {
      // 如果起点终点都已选择，则重置起点
      startPointCoords.value = { lat: e.latlng.lat, lng: e.latlng.lng };
      endPointCoords.value = { lat: null, lng: null };
      if (startMarker) map.removeLayer(startMarker);
      if (endMarker) map.removeLayer(endMarker);
      startMarker = L.marker(e.latlng).addTo(map).bindPopup("起点").openPopup();
      clearRoute();
    }
  });
});

onUnmounted(() => {
  if (map) {
    map.off("click");
    map.remove();
    map = null;
    startMarker = null;
    endMarker = null;
    routePolyline = null;
  }
});

const planRoute = async () => {
  if (!startPointCoords.value.lat || !endPointCoords.value.lat) {
    error.value = "请先选择起点和终点。";
    return;
  }

  loading.value = true;
  error.value = null;
  routeDistance.value = null;
  routeDuration.value = null;
  clearRoute(); // 清除旧路径

  const startLngLat = `${startPointCoords.value.lng},${startPointCoords.value.lat}`;
  const endLngLat = `${endPointCoords.value.lng},${endPointCoords.value.lat}`;

  // OSRM 路由 API URL
  // profile 可以是 'car', 'bike', 'foot'
  const osrmApiUrl = `https://router.project-osrm.org/route/v1/driving/${startLngLat};${endLngLat}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(osrmApiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const routeGeoJSON = route.geometry; // OSRM 返回的 GeoJSON LineString

      // 绘制路径
      routePolyline = L.geoJSON(routeGeoJSON, {
        style: {
          color: "#007bff", // 蓝色
          weight: 6,
          opacity: 0.7,
        },
      }).addTo(map);

      // 调整地图视图以适应路径
      map.fitBounds(routePolyline.getBounds());

      routeDistance.value = route.distance; // 距离，单位米
      routeDuration.value = route.duration; // 时间，单位秒
      console.log("路径规划成功:", route);
    } else {
      error.value = "未能找到路径。";
    }
  } catch (e) {
    console.error("路径规划失败:", e);
    error.value = `路径规划失败: ${e.message}. 请检查网络或稍后再试。`;
  } finally {
    loading.value = false;
  }
};

const clearRoute = () => {
  if (routePolyline) {
    map.removeLayer(routePolyline);
    routePolyline = null;
  }
  routeDistance.value = null;
  routeDuration.value = null;
  error.value = null;
  console.log("路径已清除。");
};

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    startMarker = null;
    endMarker = null;
    startPointCoords.value = { lat: null, lng: null };
    endPointCoords.value = { lat: null, lng: null };
    clearRoute();
  }
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const remainingSeconds = Math.floor(seconds % 60);

  let result = "";
  if (hours > 0) {
    result += `${hours}小时`;
  }
  if (remainingMinutes > 0) {
    result += `${remainingMinutes}分钟`;
  }
  if (remainingSeconds > 0 && hours === 0) {
    // 如果不足一小时，显示秒
    result += `${remainingSeconds}秒`;
  }
  return result || "不足1秒";
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
  color: #495057;
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

.loading-text {
  color: #007bff;
  font-weight: bold;
}

.error-text {
  color: #dc3545;
  font-weight: bold;
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

.route-button {
  background-color: #28a745; /* 绿色 */
  color: white;
}

.route-button:hover:not(:disabled) {
  background-color: #218838;
}

.clear-button {
  background-color: #dc3545;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background-color: #c82333;
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
