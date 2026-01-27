<template>
  <div ref="mapContainer" id="map"></div>
  <div style="position: absolute; top: 10px; left: 100px; z-index: 1000">
    <button @click="gotoNJ">去南京</button>
    <!-- <button @click="changeLayer" style="margin-left: 15px">切换地图</button> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import ImageLayer from "ol/layer/Image.js";
import Static from "ol/source/ImageStatic.js";
import Vector from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import GeoJSON from "ol/format/GeoJSON.js";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import "ol/ol.css";
import img from "../assets/vue.svg"; // 确保路径正确
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import Icon from "ol/style/Icon";
import CircleStyle from "ol/style/Circle.js";
import Text from "ol/style/Text.js";
import { LineString } from "ol/geom";
import Select from "ol/interaction/Select.js";
import { pointerMove } from "ol/events/condition";
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
        // source: new OSM(), // 官方使用OpenStreetMap作为底图
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 高德地图瓦片服务地址
          //   url: "https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}",
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
          // 设置天地图图层
          // url: "http://t0.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=05be06461004055923091de7f3e51aa6", // 替换为你的天地图API Key
        }),
      }),
    ],
    view,
  });

  // 加载jeojson数据，给每个省添加随机色
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      url: "https://geojson.cn/api/china/1.6.2/china.json", // 替换为你的GeoJSON数据URL
      format: new GeoJSON(),
    }),
    style: () => {
      return new Style({
        fill: new Fill({
          color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256
          )}, ${Math.floor(Math.random() * 256)}, 0.6)`, // 随机颜色
        }),
        stroke: new Stroke({
          color: "#000",
          width: 1,
        }),
      });
    },
  });
  map.addLayer(vectorLayer);

  // 选中省份变色
  const select = new Select({
    condition:pointerMove // 默认为选中，当前为触摸
  });
  map.addInteraction(select);
  select.on("select", (e) => {
    console.log(e);
    e.selected[0].setStyle(
      new Style({
        fill: new Fill({
          color: "red",
        }),
      })
    );
  });
});
const gotoNJ = () => {
  console.log(map.getView());
  // 定位到中国南京新街口
  map.getView().setCenter([118.7784, 32.0647]); // 南京新街口经纬度
  // map.getView().animate({
  //   center: [118.7784, 32.0647], // 南京新街口经纬度
  //   duration: 2000,
  //   zoom: 15,
  // });
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
