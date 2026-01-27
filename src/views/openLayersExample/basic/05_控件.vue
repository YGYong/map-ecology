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
import Zoom from "ol/control/Zoom.js";
import ScaleLine from "ol/control/ScaleLine.js";
import FullScreen from "ol/control/FullScreen.js";
import MousePosition from "ol/control/MousePosition.js";
import Rotate from "ol/control/Rotate.js";
import Attribution from "ol/control/Attribution.js";
import OverviewMap from "ol/control/OverviewMap.js";
import ZoomSlider from "ol/control/ZoomSlider.js";
import ZoomToExtent from "ol/control/ZoomToExtent.js";

// interaction
import { defaults as defaultInteractions } from "ol/interaction";

const mapContainer = ref(null);
let map = null;
onMounted(() => {
  initMap();
});
const initMap = () => {
  map = new Map({
    target: mapContainer.value,
    controls: [
      new Zoom(), // 添加缩放控件
      new ScaleLine(), // 添加比例尺控件
      new FullScreen(), // 添加全屏控件
      new MousePosition(), // 添加鼠标位置控件
      new Rotate(), // 添加旋转控件
      new Attribution(), // 添加版权信息控件
      new OverviewMap(), // 添加概览图控件
      new ZoomSlider(), // 添加缩放滑块控件
      new ZoomToExtent({
        // 缩放至特定位置控件
        extent: [12667718, 2562800, 12718359, 2597725],
      }),
    ],
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 高德地图瓦片服务地址
          url: "https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}",
          // 设置路网图层
          // url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
          // 设置天地图图层
          // url: "http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=token", // token替换为你的天地图API Key
        }),
      }),
    ],
    view: new View({
      center: [116.4074, 39.9042], // 北京市中心经纬度
      zoom: 10,
      projection: "EPSG:4326", // 默认使用球面墨卡托投影(EPSG:3857)，需要设置为WGS 84(EPSG:4326)经纬度
    }),
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
