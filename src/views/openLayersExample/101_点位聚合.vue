<template>
  <div class="cluster-map-container">
    <div ref="mapContainer" class="map"></div>

    <div class="map-controls">
      <div class="control-section">
        <h3>点聚合控制</h3>
        <div class="control-group">
          <button class="control-btn" @click="generateRandomPoints(100)">
            <span class="icon">🎲</span> 生成100点
          </button>
          <button class="control-btn" @click="generateRandomPoints(500)">
            <span class="icon">🎲</span> 生成500点
          </button>
        </div>
        <div class="control-group">
          <button class="control-btn" @click="clearAllPoints">
            <span class="icon">🗑️</span> 清除所有点
          </button>
          <button class="control-btn" @click="toggleAnimation">
            <span class="icon">{{ animationEnabled ? "⏸️" : "▶️" }}</span>
            {{ animationEnabled ? "暂停动画" : "开启动画" }}
          </button>
        </div>

        <div class="slider-group">
          <label for="distance">聚合距离: {{ clusterDistance }} 像素</label>
          <input
            type="range"
            id="distance"
            min="10"
            max="200"
            v-model="clusterDistance"
            @input="updateClusterDistance"
          />
        </div>
      </div>

      <div class="stats-section">
        <h3>统计信息</h3>
        <div class="stats-item">
          <div class="stats-label">总点数:</div>
          <div class="stats-value">{{ totalPoints }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">聚合点数:</div>
          <div class="stats-value">{{ clusterCount }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">显示比例:</div>
          <div class="stats-value">{{ displayRatio }}%</div>
        </div>
      </div>
    </div>

    <div class="coordinates-display">
      <div class="coords-label">当前坐标:</div>
      <div class="coords-value">{{ coordinates }}</div>
      <div class="zoom-level">缩放级别: {{ currentZoom.toFixed(2) }}</div>
    </div>

    <div class="animation-points">
      <div
        v-for="(point, index) in animatedPoints"
        :key="index"
        class="animated-point"
        :style="{
          left: point.x + 'px',
          top: point.y + 'px',
          backgroundColor: point.color,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, Vector as VectorSource, Cluster } from "ol/source";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import { Style, Fill, Stroke, Circle, Text } from "ol/style";
import { defaults as defaultControls, FullScreen, ScaleLine } from "ol/control";
import { fromLonLat, toLonLat } from "ol/proj";
import "ol/ol.css";

// 地图实例
const map = ref(null);
const mapContainer = ref(null);
const vectorSource = ref(null);
const clusterSource = ref(null);

// 坐标显示
const coordinates = ref("经度: 0.00, 纬度: 0.00");
const currentZoom = ref(0);
const clusterDistance = ref(60);
const animationEnabled = ref(true);
const animatedPoints = ref([]);
const animationInterval = ref(null);

// 点数据统计
const totalPoints = ref(0);
const clusterCount = ref(0);

// 计算显示比例
const displayRatio = computed(() => {
  if (totalPoints.value === 0) return 0;
  return ((clusterCount.value / totalPoints.value) * 100).toFixed(1);
});

// 初始化地图
onMounted(() => {
  // 创建矢量数据源
  vectorSource.value = new VectorSource();

  // 创建聚合数据源
  clusterSource.value = new Cluster({
    source: vectorSource.value,
    distance: clusterDistance.value,
  });

  // 创建聚合图层样式
  const clusterStyle = (feature) => {
    const size = feature.get("features").length;
    const radius = Math.min(20 + Math.sqrt(size) * 5, 40);
    const color =
      size > 50
        ? "#d32f2f"
        : size > 20
        ? "#f57c00"
        : size > 5
        ? "#1976d2"
        : "#388e3c";

    return new Style({
      image: new Circle({
        radius: radius,
        fill: new Fill({ color: `${color}80` }),
        stroke: new Stroke({
          color: "#fff",
          width: 3,
        }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({ color: "#fff" }),
        font: "bold 16px sans-serif",
      }),
    });
  };

  // 创建聚合图层
  const clusterLayer = new VectorLayer({
    source: clusterSource.value,
    style: clusterStyle,
  });

  // 创建高德地图图层
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });

  // 创建地图
  map.value = new Map({
    target: mapContainer.value,
    layers: [baseLayer, clusterLayer],
    view: new View({
      center: fromLonLat([116.4, 39.9]), // 北京
      zoom: 10,
    }),
    controls: defaultControls().extend([new FullScreen(), new ScaleLine()]),
  });

  // 添加坐标显示事件
  map.value.on("pointermove", (event) => {
    const coord = toLonLat(event.coordinate);
    coordinates.value = `经度: ${coord[0].toFixed(4)}, 纬度: ${coord[1].toFixed(
      4
    )}`;
  });

  // 监听缩放变化
  map.value.getView().on("change:resolution", () => {
    currentZoom.value = map.value.getView().getZoom();
    updateClusterStats();
  });

  // 监听聚合源变化
  clusterSource.value.on("change", updateClusterStats);

  // 初始生成一些点
  generateRandomPoints(100);

  // 启动动画
  startAnimation();
});

// 更新聚合统计信息
function updateClusterStats() {
  const features = clusterSource.value.getFeatures();
  clusterCount.value = features.length;
  // 计算所有聚合点包含的总点数
  let total = 0;
  features.forEach((feature) => {
    total += feature.get("features").length;
  });
  totalPoints.value = total;
}

// 更新聚合距离
function updateClusterDistance() {
  clusterSource.value.setDistance(parseInt(clusterDistance.value));
}

// 生成随机点
function generateRandomPoints(count) {
  const view = map.value.getView();
  const extent = view.calculateExtent(map.value.getSize());
  let points = [];  // 优化后方法
  console.time("500点位生成所需时间");
  for (let i = 0; i < count; i++) {
    const x = extent[0] + Math.random() * (extent[2] - extent[0]);
    const y = extent[1] + Math.random() * (extent[3] - extent[1]);

    const point = new Feature({
      geometry: new Point([x, y]),
      id: `point-${Date.now()}-${i}`,
    });
    points.push(point); // 优化后方法
    // vectorSource.value.addFeature(point); // 开始方法
  }
  vectorSource.value.addFeatures(points); // 优化后方法
  console.timeEnd("500点位生成所需时间");

  // 触发动画效果
  if (animationEnabled.value) {
    animatePoints(count);
  }
}

// 清除所有点
function clearAllPoints() {
  vectorSource.value.clear();
  totalPoints.value = 0;
  clusterCount.value = 0;
  animatedPoints.value = [];
}

// 点动画效果
function animatePoints(count) {
  const newPoints = [];
  const colors = [
    "#FF5252",
    "#FF4081",
    "#E040FB",
    "#7C4DFF",
    "#536DFE",
    "#448AFF",
    "#40C4FF",
    "#18FFFF",
    "#64FFDA",
    "#69F0AE",
  ];

  for (let i = 0; i < Math.min(count, 50); i++) {
    newPoints.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 20 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 100,
    });
  }

  animatedPoints.value = [...animatedPoints.value, ...newPoints];
}

// 开始动画
function startAnimation() {
  if (animationInterval.value) clearInterval(animationInterval.value);

  animationInterval.value = setInterval(() => {
    if (!animationEnabled.value) return;

    // 更新动画点
    animatedPoints.value = animatedPoints.value
      .map((p) => ({ ...p, life: p.life - 2 }))
      .filter((p) => p.life > 0);

    // 添加新点
    if (Math.random() > 0.7) {
      animatePoints(1);
    }
  }, 100);
}

// 切换动画状态
function toggleAnimation() {
  animationEnabled.value = !animationEnabled.value;
  if (animationEnabled.value) {
    startAnimation();
  } else {
    if (animationInterval.value) {
      clearInterval(animationInterval.value);
      animationInterval.value = null;
    }
  }
}

// 组件卸载时清理
onUnmounted(() => {
  if (map.value) {
    map.value.dispose();
  }
  if (animationInterval.value) {
    clearInterval(animationInterval.value);
  }
});
</script>

<style scoped>
.cluster-map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #1a237e, #4a148c);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.map {
  width: 100%;
  height: 100%;
  background: #0d47a1;
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1;
  width: 320px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.control-section h3,
.stats-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3f51b5;
  color: #1a237e;
  font-size: 1.4rem;
}

.control-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.control-btn {
  padding: 12px 15px;
  border: none;
  border-radius: 8px;
  background: #3f51b5;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background: #303f9f;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.control-btn .icon {
  font-size: 1.2rem;
}

.slider-group {
  margin-top: 20px;
  padding: 10px 0;
}

.slider-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #1a237e;
}

.slider-group input {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.slider-group input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3f51b5;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stats-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.stats-label {
  font-weight: 500;
  color: #333;
}

.stats-value {
  font-weight: 700;
  color: #3f51b5;
  font-size: 1.1rem;
}

.coordinates-display {
  position: absolute;
  bottom: 40px;
  left: 20px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 10px;
  padding: 15px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 260px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.coords-label {
  font-weight: 600;
  color: #3f51b5;
  font-size: 0.9rem;
}

.coords-value {
  font-family: "Courier New", monospace;
  font-size: 1.1rem;
  color: #1a237e;
  font-weight: bold;
}

.zoom-level {
  font-family: "Courier New", monospace;
  font-size: 1rem;
  color: #f57c00;
  font-weight: bold;
  margin-top: 5px;
}

.animation-points {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.animated-point {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 15px currentColor;
  opacity: 0.7;
  animation: float 3s infinite ease-in-out;
}

@keyframes float {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -60%) scale(1.2);
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
}
</style>
