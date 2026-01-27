<template>
  <div class="heatmap-container">
    <div ref="mapContainer" class="map"></div>

    <div class="control-panel">
      <div class="panel-section">
        <h3>热力图控制</h3>

        <div class="control-group">
          <div class="control-item">
            <label for="radius">点半径: {{ pointRadius }}</label>
            <input
              type="range"
              id="radius"
              min="1"
              max="30"
              v-model="pointRadius"
              @input="updateHeatmapStyle"
            />
          </div>

          <div class="control-item">
            <label for="blur">模糊度: {{ blurSize }}</label>
            <input
              type="range"
              id="blur"
              min="1"
              max="30"
              v-model="blurSize"
              @input="updateHeatmapStyle"
            />
          </div>
        </div>

        <div class="control-group">
          <div class="control-item">
            <label for="gradient">颜色渐变</label>
            <select
              id="gradient"
              v-model="selectedGradient"
              @change="updateHeatmapStyle"
            >
              <option
                v-for="(grad, name) in gradients"
                :key="name"
                :value="name"
              >
                {{ name }}
              </option>
            </select>
          </div>

          <div class="control-item">
            <label for="opacity">不透明度: {{ opacity }}</label>
            <input
              type="range"
              id="opacity"
              min="0"
              max="1"
              step="0.1"
              v-model="opacity"
              @input="updateHeatmapStyle"
            />
          </div>
        </div>
      </div>

      <div class="panel-section">
        <h3>数据生成</h3>

        <div class="data-controls">
          <button
            v-for="btn in dataButtons"
            :key="btn.count"
            class="data-btn"
            @click="generateData(btn.count)"
          >
            {{ btn.label }}
          </button>

          <button class="clear-btn" @click="clearData">
            <i class="fas fa-trash-alt"></i> 清除数据
          </button>
        </div>

        <div class="data-info">
          <div class="info-item">
            <span class="label">数据点数:</span>
            <span class="value">{{ pointCount }}</span>
          </div>
          <div class="info-item">
            <span class="label">最大权重:</span>
            <span class="value">{{ maxWeight }}</span>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <h3>热力分布说明</h3>
        <div class="gradient-preview" :style="gradientStyle"></div>
        <div class="legend">
          <span>低密度</span>
          <span>中密度</span>
          <span>高密度</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer } from "ol/layer";
import { XYZ } from "ol/source";
import { Heatmap as HeatmapLayer, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls, FullScreen } from "ol/control";
import "ol/ol.css";

// 热力图参数
const pointRadius = ref(15);
const blurSize = ref(15);
const opacity = ref(0.7);
const selectedGradient = ref("Jet");

// 数据统计
const pointCount = ref(0);
const maxWeight = ref(0);
const intensity = ref(0);
const hotspots = ref([]);

// 地图实例
const map = ref(null);
const mapContainer = ref(null);
const heatmapSource = ref(null);

// 颜色渐变方案
const gradients = ref({
  Jet: ["#0000FF", "#00FFFF", "#00FF00", "#FFFF00", "#FF0000"],
  Hot: ["#000000", "#800000", "#FF0000", "#FF8000", "#FFFF00"],
  Cool: ["#00FFFF", "#00BFFF", "#0000FF", "#8A2BE2", "#FF00FF"],
  Earth: ["#000000", "#006400", "#00FF00", "#FFFF00", "#FFA500", "#FF0000"],
  Viridis: ["#440154", "#3B528B", "#21908C", "#5DC963", "#FDE725"],
});

// 数据生成按钮
const dataButtons = ref([
  { count: 500, label: "生成500点" },
  { count: 1000, label: "生成1000点" },
  { count: 2000, label: "生成2000点" },
  { count: 5000, label: "生成5000点" },
]);

// 计算渐变样式
const gradientStyle = computed(() => {
  const colors = gradients.value[selectedGradient.value];
  return {
    background: `linear-gradient(to right, ${colors.join(", ")})`,
  };
});

// 初始化地图
onMounted(() => {
  // 创建热力图数据源
  heatmapSource.value = new VectorSource();

  // 创建热力图层
  const heatmapLayer = new HeatmapLayer({
    source: heatmapSource.value,
    blur: parseInt(blurSize.value),
    radius: parseInt(pointRadius.value),
    opacity: parseFloat(opacity.value),
    gradient: gradients.value[selectedGradient.value],
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
    layers: [baseLayer, heatmapLayer],
    view: new View({
      center: fromLonLat([116.4, 39.9]),
      zoom: 10,
    }),
    controls: defaultControls().extend([new FullScreen()]),
  });

  // 初始生成数据
  generateData(1000);
});

// 更新热力图样式
function updateHeatmapStyle() {
  const layers = map.value.getLayers();
  const heatmapLayer = layers.item(1);

  heatmapLayer.setBlur(parseInt(blurSize.value));
  heatmapLayer.setRadius(parseInt(pointRadius.value));
  heatmapLayer.setOpacity(parseFloat(opacity.value));
  heatmapLayer.setGradient(gradients.value[selectedGradient.value]);
}

// 生成随机数据点
function generateData(count) {
  heatmapSource.value.clear();
  pointCount.value = count;
  maxWeight.value = 0;

  // 创建几个热点区域
  const view = map.value.getView();
  const extent = view.calculateExtent(map.value.getSize());
  const width = extent[2] - extent[0];
  const height = extent[3] - extent[1];

  // 生成3-5个热点区域
  const hotspotCount = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < hotspotCount; i++) {
    hotspots.value.push({
      x: extent[0] + Math.random() * width,
      y: extent[1] + Math.random() * height,
      radius: 10000 + Math.random() * 20000,
      intensity: 0.2 + Math.random() * 0.8,
    });
  }

  // 生成数据点
  let totalWeight = 0;
  let points = [];
  for (let i = 0; i < count; i++) {
    // 决定点在哪个热点区域
    const hotspotIndex =
      Math.random() < 0.7 ? Math.floor(Math.random() * hotspotCount) : -1;
    let x, y, weight;

    if (hotspotIndex >= 0) {
      // 在热点区域内生成点
      const hotspot = hotspots.value[hotspotIndex];
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * hotspot.radius;

      x = hotspot.x + Math.cos(angle) * distance;
      y = hotspot.y + Math.sin(angle) * distance;
      weight = hotspot.intensity * (1 - distance / hotspot.radius);
    } else {
      // 在区域内随机生成点
      x = extent[0] + Math.random() * width;
      y = extent[1] + Math.random() * height;
      weight = Math.random() * 0.3; // 低权重
    }

    // 创建点要素
    const point = new Feature({
      geometry: new Point([x, y]),
    });

    points.push(point);

    // 设置权重 (0~1)
    point.set("weight", weight);

    totalWeight += weight;
    if (weight > maxWeight.value) maxWeight.value = weight;
  }
  heatmapSource.value.addFeatures(points);

  // 计算平均密度
  intensity.value = totalWeight / count;
}

// 清除数据
function clearData() {
  heatmapSource.value.clear();
  pointCount.value = 0;
  maxWeight.value = 0;
  intensity.value = 0;
  hotspots.value = [];
}

// 组件卸载时清理
onUnmounted(() => {
  if (map.value) {
    map.value.dispose();
  }
});
</script>

<style scoped>
.heatmap-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a237e, #4a148c);
}

.map {
  width: 100%;
  height: 100%;
  background: #0d47a1;
}

.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 320px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1;
}

.panel-section {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.panel-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.panel-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.3rem;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
}

.control-group {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.control-item {
  flex: 1;
}

.control-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.control-item input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.control-item input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.control-item select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  color: #2c3e50;
  background: #f8f9fa;
  font-weight: 500;
  cursor: pointer;
}

.data-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.data-btn {
  padding: 10px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.data-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.clear-btn {
  grid-column: span 2;
  padding: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.clear-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

.data-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item .label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.info-item .value {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.2rem;
}

.gradient-preview {
  height: 25px;
  border-radius: 5px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
}

.legend {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #7f8c8d;
}
</style>
