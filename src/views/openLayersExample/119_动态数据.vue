<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <button @click="toggleAnimation">
        {{ isAnimating ? "暂停动画" : "开始动画" }}
      </button>
      <button @click="resetAnimation">重置动画</button>
      <div class="control-group">
        <label>动画速度:</label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          v-model="speedMultiplier"
          @input="updateAnimationSpeed"
        />
        <span>{{ speedMultiplier }}x</span>
      </div>
      <div class="control-group">
        <label>螺旋点数:</label>
        <input type="range" min="50" max="500" step="10" v-model="pointCount" />
        <span>{{ pointCount }}</span>
      </div>
      <div class="control-group">
        <label>螺旋大小:</label>
        <input type="range" min="0.5" max="2" step="0.1" v-model="spiralSize" />
        <span>{{ spiralSize }}x</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import MultiPoint from "ol/geom/MultiPoint";
import Point from "ol/geom/Point";
import { getVectorContext } from "ol/render";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import "ol/ol.css";

const mapContainer = ref(null);
let map = null;
let tileLayer = null;
let animationId = null;

// 响应式变量
const isAnimating = ref(true);
const speedMultiplier = ref(1);
const pointCount = ref(200);
const spiralSize = ref(1);

// 动画参数
let startTime = Date.now();
let pauseTime = 0; // 暂停时间点
const baseOmegaTheta = 30000; // 基础旋转周期（毫秒）

// 样式定义
const imageStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "yellow" }),
    stroke: new Stroke({ color: "red", width: 1 }),
  }),
});

const headInnerImageStyle = new Style({
  image: new CircleStyle({
    radius: 2,
    fill: new Fill({ color: "blue" }),
  }),
});

const headOuterImageStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "black" }),
  }),
});

// 螺旋动画渲染函数
const renderSpiral = (event) => {
  const vectorContext = getVectorContext(event);
  const frameState = event.frameState;
  // 计算当前时间和角度
  const currentTime = frameState.time - startTime;
  const omegaTheta = baseOmegaTheta / speedMultiplier.value;
  const theta = (2 * Math.PI * currentTime) / omegaTheta;

  // 螺旋参数 - 适配EPSG:4326坐标系（经纬度）
  const R = 0.7 * spiralSize.value; // 外圆半径（度）
  const r = 0.2 * spiralSize.value; // 内圆半径（度）
  const p = 0.2 * spiralSize.value; // 螺旋参数（度）

  // 生成螺旋坐标点
  const coordinates = [];
  const n = pointCount.value;
  const center = [116.4074, 39.9042]; // 北京市中心经纬度

  for (let i = 0; i < n; ++i) {
    const t = theta + (2 * Math.PI * i) / n;
    const x = (R + r) * Math.cos(t) + p * Math.cos(((R + r) * t) / r);
    const y = (R + r) * Math.sin(t) + p * Math.sin(((R + r) * t) / r);
    // 将螺旋坐标添加到北京市中心
    coordinates.push([center[0] + x, center[1] + y]);
  }

  // 绘制螺旋点
  vectorContext.setStyle(imageStyle);
  vectorContext.drawGeometry(new MultiPoint(coordinates));

  // 绘制头部点
  const headPoint = new Point(coordinates[coordinates.length - 1]);

  vectorContext.setStyle(headOuterImageStyle);
  vectorContext.drawGeometry(headPoint);

  vectorContext.setStyle(headInnerImageStyle);
  vectorContext.drawGeometry(headPoint);

  // 继续动画
  if (isAnimating.value) {
    map.render();
  }
};

// 切换动画状态
const toggleAnimation = () => {
  if (isAnimating.value) {
    isAnimating.value = false;
    pauseTime = Date.now(); // 记录暂停时间
  } else {
    isAnimating.value = true;
    // 调整startTime，使动画从暂停位置继续
    if (pauseTime > 0) {
      startTime += Date.now() - pauseTime;
      pauseTime = 0;
    }
    map.render(); // 重新开始渲染
  }
};

// 重置动画
const resetAnimation = () => {
  startTime = Date.now();
  map.render();
};

// 更新动画速度
const updateAnimationSpeed = () => {
  // 速度改变时重新计算起始时间，保持动画连续性
  startTime = Date.now();
};

onMounted(() => {
  // 创建瓦片图层
  tileLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });

  // 创建视图
  const view = new View({
    center: [116.4074, 39.9042], // 北京市中心经纬度
    zoom: 9,
    projection: "EPSG:4326",
  });

  // 初始化地图
  map = new Map({
    target: mapContainer.value,
    layers: [tileLayer],
    view,
  });

  // 添加postrender事件监听器
  tileLayer.on("postrender", renderSpiral);

  // 开始渲染
  map.render();
});

onUnmounted(() => {
  // 清理资源
  if (tileLayer) {
    tileLayer.un("postrender", renderSpiral);
  }
  if (map) {
    map.setTarget(undefined);
    map = null;
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
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
  min-width: 250px;
}

.controls button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.controls button:hover {
  background-color: #0056b3;
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
</style>
