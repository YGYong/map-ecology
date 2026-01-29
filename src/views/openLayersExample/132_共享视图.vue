<template>
  <div class="map-all-container">
    <div ref="roadMapContainer" class="road-map-container"></div>
    <div ref="aerialMapContainer" class="aerial-map-container"></div>
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
.map-all-container {
  width: 100%;
  height: 100%;
  display: flex;
}

.road-map-container,
.aerial-map-container {
  flex: 1;
  min-height: 0;
}
</style>
