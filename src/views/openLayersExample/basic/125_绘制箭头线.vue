<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="info">
        <p>点击地图开始绘制带箭头的线条</p>
        <p>双击结束绘制</p>
      </div>
      <button @click="clearLines">清除所有线条</button>
      <div class="control-group">
        <label>线条颜色:</label>
        <input type="color" v-model="lineColor" @input="updateStyle" />
      </div>
      <div class="control-group">
        <label>线条宽度:</label>
        <input
          type="range"
          min="1"
          max="10"
          v-model="lineWidth"
          @input="updateStyle"
        />
        <span>{{ lineWidth }}px</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import Draw from "ol/interaction/Draw";
import Point from "ol/geom/Point";
import { Style, Stroke, Icon } from "ol/style";
import "ol/ol.css";

const mapContainer = ref(null);
let map = null;
let source = null;
let vector = null;
let draw = null;

// 响应式变量
const lineColor = ref("#ffcc33");
const lineWidth = ref(2);

// 样式函数
const styleFunction = (feature) => {
  const geometry = feature.getGeometry();
  const styles = [
    // 线条样式
    new Style({
      stroke: new Stroke({
        color: lineColor.value,
        width: parseInt(lineWidth.value),
      }),
    }),
  ];

  // 为每个线段添加箭头
  geometry.forEachSegment((start, end) => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx);

    // 在线段末端添加箭头
    styles.push(
      new Style({
        geometry: new Point(end),
        image: new Icon({
          src: "/src/openLayers/assets/arrow.png",
          anchor: [0.75, 0.5],
          rotateWithView: true,
          rotation: -rotation,
          scale: 1.2,
        }),
      })
    );
  });

  return styles;
};

// 更新样式
const updateStyle = () => {
  if (vector) {
    vector.changed();
  }
};

// 清除所有线条
const clearLines = () => {
  if (source) {
    source.clear();
  }
};

// 添加绘制交互
const addDrawInteraction = () => {
  draw = new Draw({
    source: source,
    type: "LineString",
  });

  draw.on("drawstart", () => {
    console.log("开始绘制线条");
  });

  draw.on("drawend", (event) => {
    console.log("绘制完成", event.feature);
  });

  map.addInteraction(draw);
};

onMounted(() => {
  // 创建矢量数据源
  source = new VectorSource();

  // 创建矢量图层
  vector = new VectorLayer({
    source: source,
    style: styleFunction,
  });

  // 创建瓦片图层
  const raster = new TileLayer({
    source: new XYZ({
      url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    }),
  });

  // 创建视图
  const view = new View({
    center: [116.4074, 39.9042], // 北京市中心经纬度
    zoom: 10,
    projection: "EPSG:4326",
  });

  // 初始化地图
  map = new Map({
    target: mapContainer.value,
    layers: [raster, vector],
    view,
  });

  // 添加绘制交互
  addDrawInteraction();
});

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined);
    map = null;
  }
});
</script>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  font-family: sans-serif;
}

#map {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 220px;
}

.info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.control-group label {
  min-width: 80px;
  font-weight: 500;
}

.control-group input[type="color"] {
  width: 40px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.control-group input[type="range"] {
  flex: 1;
  min-width: 100px;
}

.control-group span {
  min-width: 40px;
  text-align: right;
  font-weight: bold;
  color: #007bff;
}

.controls button {
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.controls button:hover {
  background-color: #c82333;
}
</style>
