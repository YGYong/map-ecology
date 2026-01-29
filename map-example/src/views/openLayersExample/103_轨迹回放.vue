<template>
  <div ref="mapContainer" class="map-container"></div>
  <div class="map-controls-car">
    <h3>小车轨迹回放 🚗</h3>
    <div class="control-group">
      <button class="control-btn" @click="startTrack" :disabled="playing">
        开始
      </button>
      <button class="control-btn" @click="pauseTrack" :disabled="!playing">
        暂停
      </button>
      <button
        class="control-btn"
        @click="resumeTrack"
        :disabled="playing || finished"
      >
        继续
      </button>
      <button class="control-btn" @click="resetTrack">重置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, Vector as VectorSource } from "ol/source";
import { LineString, Point } from "ol/geom";
import Feature from "ol/Feature";
import { Style, Stroke, Icon } from "ol/style";
import { defaults as defaultControls, FullScreen, ScaleLine } from "ol/control";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import carIconUrl from "./imgs/car.png";

const map = ref(null);
const mapContainer = ref(null);
const vectorSource = ref(null);
const carFeature = ref(null);
const trackFeature = ref(null);
const playing = ref(false);
const finished = ref(false);
const progress = ref(0);
const timer = ref(null);

// 预设轨迹点（经纬度）
const trackPoints = ref([
  [116.39, 39.9],
  [116.392, 39.901],
  [116.395, 39.902],
  [116.398, 39.903],
  [116.4, 39.905],
  [116.402, 39.908],
  [116.404, 39.91],
  [116.406, 39.912],
  [116.408, 39.914],
  [116.41, 39.916],
]);

const statusText = computed(() => {
  if (finished.value) return "已完成";
  if (playing.value) return "播放中";
  if (progress.value > 0) return "已暂停";
  return "未开始";
});

// 计算两点间的角度（弧度，正北为0，顺时针）
function getAngle(p1, p2) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.atan2(dy, dx);
}

function carStyle(angle = 0) {
  return new Style({
    image: new Icon({
      src: carIconUrl,
      anchor: [0.5, 0.5],
      rotateWithView: true,
      rotation: -angle, // 加上这一行实现方向旋转
    }),
  });
}

function trackLineStyle() {
  return new Style({
    stroke: new Stroke({ color: "#1976d2", width: 4, lineDash: [8, 8] }),
  });
}

// 绘制轨迹线
function drawTrack() {
  if (trackFeature.value) vectorSource.value.removeFeature(trackFeature.value);
  const coords = trackPoints.value.map((pt) => fromLonLat(pt));
  trackFeature.value = new Feature({ geometry: new LineString(coords) });
  trackFeature.value.setStyle(trackLineStyle());
  vectorSource.value.addFeature(trackFeature.value);
}

// 绘制小车
function drawCar(idx = 0, angle = 0) {
  if (carFeature.value) vectorSource.value.removeFeature(carFeature.value);
  const coord = fromLonLat(trackPoints.value[idx]);
  carFeature.value = new Feature({ geometry: new Point(coord) });
  carFeature.value.setStyle(carStyle(angle));
  vectorSource.value.addFeature(carFeature.value);
}

// 开始
function startTrack() {
  if (playing.value || finished.value) return;
  playing.value = true;
  finished.value = false;
  if (progress.value === 0) {
    drawCar(0, getAngle(trackPoints.value[0], trackPoints.value[1]));
  }
  runTrack();
}

// 开始
function runTrack() {
  if (timer.value) clearInterval(timer.value);
  timer.value = setInterval(() => {
    if (!playing.value) return;
    if (progress.value >= trackPoints.value.length - 1) {
      playing.value = false;
      finished.value = true;
      clearInterval(timer.value);
      return;
    }
    const idx = progress.value;
    const nextIdx = idx + 1;
    const angle = getAngle(trackPoints.value[idx], trackPoints.value[nextIdx]);
    drawCar(nextIdx, angle);
    progress.value = nextIdx;
  }, 600);
}

// 暂停
function pauseTrack() {
  playing.value = false;
  if (timer.value) clearInterval(timer.value);
}

// 继续
function resumeTrack() {
  if (playing.value || finished.value) return;
  playing.value = true;
  runTrack();
}

// 重置
function resetTrack() {
  playing.value = false;
  finished.value = false;
  progress.value = 0;
  if (timer.value) clearInterval(timer.value);
  drawCar(0, getAngle(trackPoints.value[0], trackPoints.value[1]));
}

onMounted(() => {
  vectorSource.value = new VectorSource();
  const vectorLayer = new VectorLayer({
    source: vectorSource.value,
    zIndex: 10,
  });
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });
  map.value = new Map({
    target: mapContainer.value,
    layers: [baseLayer, vectorLayer],
    view: new View({
      center: fromLonLat(trackPoints.value[0]),
      zoom: 14,
    }),
    controls: defaultControls().extend([new FullScreen(), new ScaleLine()]),
  });
  drawTrack();
  drawCar(0, getAngle(trackPoints.value[0], trackPoints.value[1]));
});

onUnmounted(() => {
  if (map.value) map.value.dispose();
  if (timer.value) clearInterval(timer.value);
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
.map-controls-car {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 2;
  width: 320px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.map-controls-car h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #1a237e;
  font-size: 1.4rem;
}
.control-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.control-btn {
  flex: 1 1 45%;
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
.control-btn:disabled {
  background: #b0bec5;
  cursor: not-allowed;
}
.control-btn:hover:not(:disabled) {
  background: #303f9f;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}
.stats-section {
  margin-top: 10px;
  font-size: 1.1rem;
  color: #1976d2;
}
.progress {
  font-weight: bold;
  color: #ffc107;
}
.status {
  font-weight: bold;
  color: #388e3c;
}
</style>
