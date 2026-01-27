<template>
  <div class="map-wrapper">
    <div id="map-measurement" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import 'leaflet-measure/dist/leaflet-measure.css'; // 测量插件的CSS
import L from 'leaflet';
import 'leaflet-measure'; // 引入测量插件JS

let map = null;
let measureControl = null;

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map('map-measurement').setView(initialView, initialZoom);

  L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>'
  }).addTo(map);

  // 初始化测量工具
  measureControl = L.control.measure({
    position: 'topleft', // 控件位置
    primaryLengthUnit: 'meters', // 主要长度单位
    secondaryLengthUnit: 'kilometers', // 次要长度单位
    primaryAreaUnit: 'sqmeters', // 主要面积单位
    secondaryAreaUnit: 'hectares', // 次要面积单位
    activeColor: '#ff7800', // 绘制时的颜色
    completedColor: '#007bff', // 完成后的颜色
    localization: 'zh_CN', // 中文本地化
    popupOptions: { // 测量结果弹出窗口选项
      className: 'leaflet-measure-result-popup',
      autoPanPadding: [10, 10]
    }
  });
  measureControl.addTo(map);
});

onUnmounted(() => {
  if (map) {
    if (measureControl) {
      map.removeControl(measureControl); // 移除测量控件
    }
    map.remove();
    map = null;
    measureControl = null;
  }
});
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

.map-container {
  flex-grow: 1;
  height: 100%;
  min-height: 300px;
  background-color: #e0e0e0;
}
</style>