<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>加载 WMS 图层</h2>
      <p>地图上叠加了一个来自外部服务的 WMS 图层。</p>
      <div class="info-display">
        <p>
          WMS 服务地址: <code>{{ wmsUrl }}</code>
        </p>
        <p>
          WMS 图层名称: <code>{{ wmsLayers }}</code>
        </p>
      </div>
      <button @click="toggleWMSLayer" class="action-button toggle-button">
        {{ showWMS ? "隐藏 WMS 图层" : "显示 WMS 图层" }}
      </button>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-wms" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

let map = null;
let wmsLayer = null;
const showWMS = ref(true);

const wmsUrl = "https://ows.terrestris.de/osm/service"; // 示例公共 WMS 服务
const wmsLayers = "OSM-WMS"; // 示例图层名称

const initialView = [51.1657, 10.4515]; // 德国中心，因为示例WMS服务可能覆盖欧洲
const initialZoom = 7;

onMounted(() => {
  map = L.map("map-wms").setView(initialView, initialZoom);

  // 添加高德地图瓦片图层作为底图
  L.tileLayer(
    "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    }
  ).addTo(map);

  // 创建 WMS 图层
  wmsLayer = L.tileLayer
    .wms(wmsUrl, {
      layers: wmsLayers, // WMS 服务中的图层名称
      format: "image/png", // 图像格式
      transparent: true, // 是否透明
      version: "1.1.1", // WMS 版本
      attribution: "terrestris GmbH & Co. KG", // 归属信息
    })
    .addTo(map);
});

onUnmounted(() => {
  if (map) {
    if (wmsLayer) {
      map.removeLayer(wmsLayer);
    }
    map.remove();
    map = null;
    wmsLayer = null;
  }
});

const toggleWMSLayer = () => {
  if (map && wmsLayer) {
    if (showWMS.value) {
      map.removeLayer(wmsLayer);
    } else {
      map.addLayer(wmsLayer);
    }
    showWMS.value = !showWMS.value;
  }
};

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
    if (!showWMS.value && wmsLayer) {
      // 如果WMS图层被隐藏，重置时显示
      map.addLayer(wmsLayer);
      showWMS.value = true;
    }
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

.info-display {
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  color: #495057;
  word-break: break-all; /* 确保长URL能换行 */
}

.info-display p {
  margin: 5px 0;
  font-size: 0.95em;
}

.info-display code {
  background-color: #e0e0e0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
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

.toggle-button {
  background-color: #28a745; /* 绿色 */
  color: white;
}

.toggle-button:hover {
  background-color: #218838;
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
