<template>
  <div ref="mapContainer" id="map"></div>
  <div ref="overlay" class="overlay">这是overlay1</div>
  <div ref="overlay2" class="overlay">这是overlay2</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import "ol/ol.css";

import Overlay from "ol/Overlay.js";

const mapContainer = ref(null);
const overlay = ref(null);
const overlay2 = ref(null);
let map = null;
onMounted(() => {
  initMap();
});
const initMap = () => {
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 矢量图（含路网、含注记）
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7 ",
        }),
      }),
    ],
    view: new View({
      center: [116.4074, 39.9042], // 北京市中心经纬度
      zoom: 10,
      projection: "EPSG:4326", // 默认使用球面墨卡托投影(EPSG:3857)，需要设置为WGS 84(EPSG:4326)经纬度
    }),
    overlays: [
      new Overlay({
        id: "overlay1",
        element: overlay.value, // HTML元素
        position: [116.4074, 39.9042], // 设置overlay位置为北京市中心经纬度
        offset: [0, 0], // 设置overlay偏移量
        positioning: "center-center", // 设置overlay位置对齐方式
        stopEvent: false, // 设置为false可以使overlay不阻止事件传播
        autoPan: true, // 自动平移地图以显示overlay
      }),
      new Overlay({
        id: "overlay2",
        element: overlay2.value, // HTML元素
        position: [116.8074, 39.9042], // 设置overlay位置为北京市中心经纬度
        offset: [0, 0], // 设置overlay偏移量
        positioning: "center-center", // 设置overlay位置对齐方式
        stopEvent: false, // 设置为false可以使overlay不阻止事件传播
        autoPan: true, // 自动平移地图以显示overlay
      }),
    ],
  });
};
</script>
<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
.overlay {
  width: 200px;
  height: 100px;
  background: rgba(34, 212, 85, 0.8);
  padding: 10px;
  border: 1px solid aqua;
  border-radius: 4px;
}
</style>
