<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="info">
        <p>缩放级别: {{ currentZoom }}</p>
        <p>分辨率: {{ currentResolution.toFixed(6) }}</p>
        <p>详细图层: {{ isDetailLayerActive ? '✅ 可见' : '❌ 隐藏' }}</p>
        <p>概览图层: {{ isOverviewLayerActive ? '✅ 可见' : '❌ 隐藏' }}</p>
      </div>
      <button @click="zoomToDetail">缩放到详细视图</button>
      <button @click="zoomToOverview">缩放到概览视图</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let detailLayer = null;
let overviewLayer = null;

// 响应式变量
const currentZoom = ref(10);
const currentResolution = ref(0);

// 分辨率阈值设置（适合EPSG:4326坐标系）
const DETAIL_MIN_RESOLUTION = 0.0001;  // 详细图层最小分辨率
const DETAIL_MAX_RESOLUTION = 0.001;   // 详细图层最大分辨率
const OVERVIEW_MIN_RESOLUTION = 0.001; // 概览图层最小分辨率  
const OVERVIEW_MAX_RESOLUTION = 0.1;   // 概览图层最大分辨率

// 计算属性 - 判断图层是否在分辨率范围内
const isDetailLayerActive = computed(() => {
  return currentResolution.value >= DETAIL_MIN_RESOLUTION && 
         currentResolution.value <= DETAIL_MAX_RESOLUTION;
});

const isOverviewLayerActive = computed(() => {
  return currentResolution.value >= OVERVIEW_MIN_RESOLUTION && 
         currentResolution.value <= OVERVIEW_MAX_RESOLUTION;
});

// 更新地图状态
const updateMapStatus = () => {
  if (map) {
    const view = map.getView();
    currentZoom.value = Math.round(view.getZoom() * 10) / 10;
    currentResolution.value = view.getResolution();
  }
};

// 缩放到详细视图（高分辨率）
const zoomToDetail = () => {
  if (map) {
    // 设置到详细图层分辨率范围内
    const targetResolution = (DETAIL_MIN_RESOLUTION + DETAIL_MAX_RESOLUTION) / 2;
    const view = map.getView();
    
    view.animate({
      resolution: targetResolution,
      duration: 1000
    });
  }
};

// 缩放到概览视图（低分辨率）
const zoomToOverview = () => {
  if (map) {
    // 设置到概览图层分辨率范围内
    const targetResolution = (OVERVIEW_MIN_RESOLUTION + OVERVIEW_MAX_RESOLUTION) / 2;
    const view = map.getView();
    
    view.animate({
      resolution: targetResolution,
      duration: 1000
    });
  }
};

onMounted(() => {
  // 创建详细图层（路网图）- 高缩放级别时显示
  detailLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
    minResolution: DETAIL_MIN_RESOLUTION,
    maxResolution: DETAIL_MAX_RESOLUTION,
  });

  // 创建概览图层（卫星图）- 低缩放级别时显示
  overviewLayer = new TileLayer({
    source: new XYZ({
      url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    }),
    minResolution: OVERVIEW_MIN_RESOLUTION,
    maxResolution: OVERVIEW_MAX_RESOLUTION,
  });

  // 创建视图
  const view = new View({
    center: [116.4074, 39.9042], // 北京市中心经纬度
    zoom: 10,
    projection: "EPSG:4326",
  });

  // 初始化地图
  map = new Map({
    target: mapContainer.value,
    layers: [overviewLayer, detailLayer], // 概览图层在下，详细图层在上
    view,
  });

  // 监听视图变化
  view.on('change:resolution', updateMapStatus);
  view.on('change:center', updateMapStatus);

  // 初始化状态
  updateMapStatus();
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 220px;
}

.info p {
  margin: 5px 0;
  font-size: 14px;
}

.controls button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.controls button:hover {
  background-color: #0056b3;
}
</style>
