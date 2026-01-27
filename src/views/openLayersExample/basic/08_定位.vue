<template>
  <div ref="mapContainer" id="map"></div>
  <div style="position: absolute; top: 10px; left: 100px; z-index: 1000">
    <button @click="goto">定位到polygon区域</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import "ol/ol.css";
import Polygon from "ol/geom/Polygon.js";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Vector from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Feature from "ol/Feature.js";

const mapContainer = ref(null);
let map = null;
let view = null;
let polygon = null;
onMounted(() => {
  initMap();
});
const initMap = () => {
  view = new View({
    center: [116.4, 39.9], // 北京市中心经纬度
    zoom: 10.5,
    projection: "EPSG:4326", // 默认使用球面墨卡托投影(EPSG:3857)，需要设置为WGS 84(EPSG:4326)经纬度
    // extent: [115.4, 39.4, 117.5, 41.0],
  });
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
    view,
  });

  polygon = new Polygon([
    [
      [117.4, 39.9],
      [117.5, 39.9],
      [117.5, 40.0],
      [117.4, 40.0],
      [117.4, 39.9],
    ],
  ]);
  // 将polygon渲染到地图上，设置颜色为红色
  const feature = new Feature({
    geometry: polygon,
  });
  const source = new Vector({
    features: [feature],
  });
  const layer = new VectorLayer({
    source,
    style: new Style({
      fill: new Fill({
        color: "rgba(255, 0, 0, 0.5)", // 半透明红色填充
      }),
      stroke: new Stroke({
        color: "red", // 红色边框
        width: 2,
      }),
    }),
  });
  map.addLayer(layer);
};
const goto = () => {
  // 定位到polygon区域
  view.fit(polygon, {
    padding: [50, 50, 50, 50], // 四周留白
    duration: 3000,
    maxZoom: 15,
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
</style>
