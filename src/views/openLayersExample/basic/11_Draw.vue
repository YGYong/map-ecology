<template>
  <div class="map-container">
    <div ref="mapElement" class="map"></div>
    <div class="controls">
      <select v-model="drawType">
        <option value="Point">点</option>
        <option value="LineString">线</option>
        <option value="Polygon">多边形</option>
        <option value="Circle">圆</option>
      </select>
      <button @click="toggleDrawing">
        {{ isDrawing ? "停止绘制" : "开始绘制" }}
      </button>
      <button @click="clearAll">清除所有</button>
      <label> <input type="checkbox" v-model="freehandMode" /> 自由绘制 </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Map, View } from "ol";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";

const mapElement = ref(null);
const drawType = ref("Polygon");
const isDrawing = ref(false);
const freehandMode = ref(false);
let map = null;
let drawInteraction = null;
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
});

// 切换绘制类型和状态
watch([drawType, isDrawing, freehandMode], ([type, drawing, freehand]) => {
  if (drawInteraction) {
    map.removeInteraction(drawInteraction);
    drawInteraction = null;
  }

  if (drawing) {
    drawInteraction = new Draw({
      source: vectorSource,
      type: type,
      freehand: freehand,
      style: new Style({
        fill: new Fill({ color: "rgba(255,0,0,0.2)" }),
        stroke: new Stroke({
          color: "red",
          width: 2,
          lineDash: [5, 5],
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: "red" }),
        }),
      }),
    });

    // 事件监听
    drawInteraction.on("drawend", (event) => {
      console.log("绘制完成:", event.feature);
      // 添加自定义属性
      event.feature.set("type", type);
      event.feature.set("timestamp", new Date());
    });

    map.addInteraction(drawInteraction);
  }
});

const toggleDrawing = () => {
  isDrawing.value = !isDrawing.value;
};

const clearAll = () => {
  vectorSource.clear();
};
</script>

<style>
.map-container {
  position: relative;
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

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 4px;
  z-index: 100;
}

.controls select,
.controls button {
  margin-right: 10px;
}
</style>
