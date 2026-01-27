<template>
  <div class="map-container">
    <div ref="mapElement" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Map, View } from "ol";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { Translate, Select } from "ol/interaction";
import { Circle, Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";

const mapElement = ref(null);

let map = null;
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({ source: vectorSource });

const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 10,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});

// 初始化地图
onMounted(() => {
  map = new Map({
    target: mapElement.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
      vectorLayer,
    ],
    view,
  });
  toggleTranslate();
});

// 切换平移模式
const toggleTranslate = () => {
  // 创建多边形要素
  const polygonCoords = [
    [116.4074, 39.9042],
    [116.5074, 39.9042],
    [116.5074, 39.8042],
    [116.4074, 39.8042],
    [116.4074, 39.9042],
  ];
  const polygon = new Feature({
    geometry: new Polygon([polygonCoords]),
    name: "Polygon",
  });
  vectorSource.addFeature(polygon);

  const select = new Select({
    style: new Style({
      fill: new Fill({ color: "rgba(255, 0, 0, 0.5)" }),
      stroke: new Stroke({ color: "red", width: 3 }),
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: "red" }),
      }),
    }),
  });
  map.addInteraction(select);

  // 创建平移交互
  const translateInteraction = new Translate({
    features: select.getFeatures(),
  });

  // 添加事件监听
  translateInteraction.on("translatestart", (event) => {
    console.log("开始平移:");
  });

  translateInteraction.on("translating", (event) => {
    console.log("平移中:", event.coordinate);
  });

  translateInteraction.on("translateend", (event) => {
    console.log("平移结束");
  });

  map.addInteraction(translateInteraction);
};
</script>

<style>
.map-container {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
}

.map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
