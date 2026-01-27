<template>
  <div ref="mapContainer" id="map"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import "ol/ol.css";
import { platformModifierKeyOnly } from "ol/events/condition";
import DragZoom from "ol/interaction/DragZoom.js";

const mapContainer = ref(null);
let map = null;
const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 10,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});
onMounted(async () => {
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });

  // const dragBox = new DragBox({
  const dragBox = new DragZoom({
    condition: platformModifierKeyOnly, // 按住ctrl键,鼠标拖拽绘制矩形
  });

  map.addInteraction(dragBox);

  // 监听矩形绘制事件
  dragBox.on("boxstart", (event) => {
    console.log(event, "绘制开始");
  });

  // 监听矩形绘制过程事件
  dragBox.on("boxdrag", (event) => {
    console.log(event, "绘制过程中");
  });

  // 监听选择完成事件
  dragBox.on("boxend", (event) => {
    const extent = dragBox.getGeometry().getExtent();
    console.log("绘制结束，选择的区域范围:", extent);
    // 此处可添加区域选择逻辑
  });
});
</script>
<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
