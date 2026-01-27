<template>
  <div class="map-container">
    <div ref="mapElement" class="map"></div>
    <div class="controls">
      <button @click="toggleEditing">
        {{ editingActive ? "停止编辑" : "开始编辑" }}
      </button>
      <button @click="clearAll">清除所有要素</button>
      <div v-if="selectedFeature" style="color: #4a6fa5">
        <p>当前要素: {{ selectedFeature.get("name") }}</p>
        <p>类型: {{ selectedFeature.getGeometry().getType() }}</p>
      </div>
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
import Feature from "ol/Feature";
import { Modify, Select } from "ol/interaction";
import { Circle, Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";
import { Polygon, Point } from "ol/geom";

const mapElement = ref(null);
const editingActive = ref(false);
const selectedFeature = ref(null);

let map = null;
const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 10,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});
let modifyInteraction = null;
let selectInteraction = null;
const vectorSource = new VectorSource({
  features: [
    new Feature({
      // geometry: new Point([116.4074, 39.9042]),
      geometry: new Polygon([
        [
          [116.4074, 39.9042],
          [116.4074, 40.0042],
          [116.5074, 40.0042],
          [116.5074, 39.9042],
          [116.4074, 39.9042],
        ],
      ]),
      name: "北京",
    }),
  ],
});
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: new Style({
    fill: new Fill({ color: "rgba(0, 255, 0, 0.3)" }),
    stroke: new Stroke({ color: "green", width: 2 }),
    image: new Circle({
      radius: 7,
      fill: new Fill({ color: "green" }),
    }),
  }),
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

  // 添加选择交互
  selectInteraction = new Select({
    style: new Style({
      fill: new Fill({ color: "rgba(255, 0, 0, 0.3)" }),
      stroke: new Stroke({ color: "red", width: 3 }),
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: "red" }),
      }),
    }),
  });

  map.addInteraction(selectInteraction);

  // 监听选择变化
  selectInteraction.on("select", (event) => {
    selectedFeature.value = event.selected[0] || null;
  });
});

// 监听编辑状态变化
watch([editingActive], ([active]) => {
  if (modifyInteraction) {
    map.removeInteraction(modifyInteraction);
    modifyInteraction = null;
  }

  if (active) {
    // 创建自定义顶点样式
    const vertexStyle = new Style({
      image: new Circle({
        radius: 7,
        fill: new Fill({ color: "rgba(255, 0, 0, 0.8)" }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    });

    // 创建Modify交互
    modifyInteraction = new Modify({
      source: vectorSource,
      style: vertexStyle,
    });

    // 事件监听
    modifyInteraction.on("modifystart", (event) => {
      console.log("开始编辑:", event.features.getLength(), "个要素");
    });

    modifyInteraction.on("modifyend", (event) => {
      // 更新修改时间
      event.features.forEach((feature) => {
        feature.set("lastModified", new Date());
      });
      console.log("编辑完成", event.features);
    });

    map.addInteraction(modifyInteraction);
  }
});

const toggleEditing = () => {
  editingActive.value = !editingActive.value;
};

const clearAll = () => {
  vectorSource.clear();
  selectedFeature.value = null;
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

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.controls button {
  padding: 6px 12px;
  background: #4a6fa5;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.controls button:hover {
  background: #3a5a80;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
