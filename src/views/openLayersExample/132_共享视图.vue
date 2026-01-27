<template>
  <div class="map-container">
    <div class="map-wrapper">
      <div class="map-section">
        <h3>路网地图</h3>
        <div ref="roadMapContainer" class="map"></div>
      </div>
      <div class="map-section">
        <h3>卫星地图</h3>
        <div ref="aerialMapContainer" class="map"></div>
      </div>
    </div>
    <div class="controls">
      <div class="info">
        <h4>视图共享演示</h4>
        <p>两个地图共享同一个视图，缩放和平移会同步</p>
        <p>当前缩放级别: {{ currentZoom }}</p>
        <p>当前中心点: {{ currentCenter }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import 'ol/ol.css';

const roadMapContainer = ref(null);
const aerialMapContainer = ref(null);
let map1 = null;
let map2 = null;
let sharedView = null;

// 响应式变量
const currentZoom = ref(10);
const currentCenter = ref([0, 0]);

// 更新视图信息
const updateViewInfo = () => {
  if (sharedView) {
    currentZoom.value = Math.round(sharedView.getZoom() * 100) / 100;
    const center = sharedView.getCenter();
    currentCenter.value = [
      Math.round(center[0] * 1000) / 1000,
      Math.round(center[1] * 1000) / 1000
    ];
  }
};

onMounted(() => {
  // 创建路网图层
  const roadLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });

  // 创建卫星图层
  const aerialLayer = new TileLayer({
    source: new XYZ({
      url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    }),
  });

  // 创建共享视图 - 关键：两个地图使用同一个View实例
  sharedView = new View({
    center: [116.4074, 39.9042], // 北京市中心经纬度
    zoom: 10,
    projection: "EPSG:4326",
  });
  sharedView = new View({
    center: [116.4074, 39.9042], // 北京市中心经纬度
    zoom: 10,
    projection: "EPSG:4326",
  });

  // 创建第一个地图（路网）
  map1 = new Map({
    target: roadMapContainer.value,
    layers: [roadLayer],
    view: sharedView, // 使用共享视图
  });

  // 创建第二个地图（卫星）
  map2 = new Map({
    target: aerialMapContainer.value,
    layers: [aerialLayer],
    view: sharedView, // 使用同一个共享视图
  });

  // 监听视图变化
  sharedView.on('change:resolution', updateViewInfo);
  sharedView.on('change:center', updateViewInfo);

  // 初始化视图信息
  updateViewInfo();
});

onUnmounted(() => {
  // 清理资源
  if (map1) {
    map1.setTarget(undefined);
    map1 = null;
  }
  if (map2) {
    map2.setTarget(undefined);
    map2 = null;
  }
  if (sharedView) {
    sharedView.un('change:resolution', updateViewInfo);
    sharedView.un('change:center', updateViewInfo);
    sharedView = null;
  }
});
</script>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  flex: 1;
  display: flex;
  gap: 2px;
}

.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.map-section h3 {
  margin: 0;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.map {
  flex: 1;
  min-height: 0;
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
</style>
