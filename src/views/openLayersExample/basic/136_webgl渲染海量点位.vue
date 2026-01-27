<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="info">
        <h4>WebGL大数据点位渲染</h4>
        <p>当前渲染{{ currentPointCount.toLocaleString() }}个点位</p>
        <p>生成点位耗时：{{ generateTime }}ms</p>
        <p>渲染耗时：{{ renderTime }}ms</p>
      </div>

      <div class="control-group">
        <label>点位数量:</label>
        <select v-model="selectedPointCount" @change="regeneratePoints">
          <option :value="10000">1万个点</option>
          <option :value="50000">5万个点</option>
          <option :value="100000">10万个点</option>
          <option :value="500000">50万个点</option>
          <option :value="1000000">100万个点</option>
        </select>
      </div>

      <button @click="regeneratePoints" class="regenerate-btn">
        重新生成点位
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import "ol/ol.css";

const mapContainer = ref(null);
let map = null;
let vectorSource = null;
let webglLayer = null;

// 响应式变量
const selectedPointCount = ref(10000);
const currentPointCount = ref(10000);
const renderTime = ref(0);
const generateTime = ref(0);

// 北京坐标
const BEIJING_CENTER = [116.4074, 39.9042];

// WebGL样式配置
const webglStyle = {
  "circle-radius": ["interpolate", ["linear"], ["get", "value"], 0, 3, 100, 8],
  "circle-fill-color": [
    "interpolate",
    ["linear"],
    ["get", "value"],
    0,
    "#0066cc",
    50,
    "#ffcc00",
    100,
    "#ff3300",
  ],
  "circle-opacity": 0.8,
  "circle-stroke-color": "rgba(255,255,255,0.8)",
  "circle-stroke-width": 0.5,
};

// 生成北京周围的随机点位
const generateBeijingPoints = (count) => {
  const features = [];
  const [centerLon, centerLat] = BEIJING_CENTER;
  const range = 2.0; // 固定2度范围

  const startTime = performance.now();

  for (let i = 0; i < count; i++) {
    // 在北京周围生成随机坐标
    const lonOffset = (Math.random() - 0.5) * range * 2;
    const latOffset = (Math.random() - 0.5) * range * 2;

    const lon = centerLon + lonOffset;
    const lat = centerLat + latOffset;

    const feature = new Feature({
      geometry: new Point([lon, lat]),
      value: Math.random() * 100, // 0-100的随机值
      id: i,
    });

    features.push(feature);
  }

  generateTime.value = Math.round(performance.now() - startTime);

  return features;
};

// 重新生成点位
const regeneratePoints = () => {
  currentPointCount.value = selectedPointCount.value;
  const features = generateBeijingPoints(currentPointCount.value);

  vectorSource.clear();

  // // 高精度计时
  const startTime = performance.now();

  vectorSource.addFeatures(features);
  // 等待下一帧来测量实际渲染时间
  requestAnimationFrame(() => {
    renderTime.value = Math.round(performance.now() - startTime);
  });
};

onMounted(() => {
  // 创建底图
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });

  // 创建矢量数据源
  vectorSource = new VectorSource();

  // 创建WebGL图层
  webglLayer = new WebGLVectorLayer({
    source: vectorSource,
    style: webglStyle,
    disableHitDetection: true, // 提高性能
  });

  // 创建地图
  map = new Map({
    target: mapContainer.value,
    layers: [baseLayer, webglLayer],
    view: new View({
      center: BEIJING_CENTER,
      zoom: 10,
      projection: "EPSG:4326",
    }),
  });

  // 生成初始数据
  regeneratePoints();
});

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined);
    map = null;
  }
});
</script>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  font-family: sans-serif;
}

#map {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 250px;
}

.info h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 16px;
}

.info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
  font-size: 14px;
}

.control-group label {
  font-weight: 500;
  white-space: nowrap;
}

.control-group select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.regenerate-btn {
  width: 100%;
  padding: 10px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.regenerate-btn:hover {
  background-color: #0056b3;
}
</style>
