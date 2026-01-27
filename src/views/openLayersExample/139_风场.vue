<template>
  <div class="wind-map-container">
    <div ref="mapRef" class="map">
      <div class="controls">
        <button @click="toggleWindLayer" class="control-btn">
          {{ windLayerVisible ? "隐藏风场" : "显示风场" }}
        </button>
        <div class="slider-control">
          <label for="windSpeed">风速: {{ windSpeed }}m/s</label>
          <input
            type="range"
            id="windSpeed"
            min="1"
            max="20"
            v-model="windSpeed"
            @input="updateWindSpeed"
          />
        </div>
        <div class="slider-control">
          <label for="particleCount">粒子数量: {{ particleCount }}</label>
          <input
            type="range"
            id="particleCount"
            min="500"
            max="5000"
            step="500"
            v-model="particleCount"
            @input="updateParticleCount"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import XYZ from "ol/source/XYZ.js";
import "ol/ol.css";
// 导入ol-wind库
import { WindLayer } from "ol-wind";

// 地图容器引用
const mapRef = ref(null);
// 地图实例
let map = null;
// 风场图层实例
let windLayer = null;
// 风场数据
let windData = null;

// 响应式状态
const windLayerVisible = ref(true);
const windSpeed = ref(8);
const particleCount = ref(2000);

// 北京中心点坐标
const center = [116.3972, 39.9075];

// 切换风场图层显示/隐藏
const toggleWindLayer = () => {
  if (windLayer) {
    windLayer.setVisible(!windLayerVisible.value);
    windLayerVisible.value = !windLayerVisible.value;
  }
};

// 更新风速
const updateWindSpeed = () => {
  if (windLayer) {
    windLayer.setWindOptions({
      speedFactor: windSpeed.value / 10,
    });
  }
};

// 更新粒子数量
const updateParticleCount = () => {
  if (windLayer) {
    windLayer.setWindOptions({
      particleCount: particleCount.value,
    });
  }
};

// 初始化地图
const initMap = () => {
  // 创建地图实例
  map = new Map({
    target: mapRef.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view: new View({
      center: center,
      zoom: 5,
      projection: "EPSG:4326",
    }),
  });
};

// 初始化风场图层
const initWindLayer = async () => {
  // 生成模拟风场数据
  windData = await fetch(
    "https://blog.sakitam.com/wind-layer/data/wind.json"
  ).then((res) => res.json());

  // 创建风场图层
  windLayer = new WindLayer(windData, {
    windOptions: {
      // colorScale: scale,
      velocityScale: 1 / 20,
      paths: 5000,
      // eslint-disable-next-line no-unused-vars
      colorScale: [
        "rgb(36,104, 180)",
        "rgb(60,157, 194)",
        "rgb(128,205,193 )",
        "rgb(151,218,168 )",
        "rgb(198,231,181)",
        "rgb(238,247,217)",
        "rgb(255,238,159)",
        "rgb(252,217,125)",
        "rgb(255,182,100)",
        "rgb(252,150,75)",
        "rgb(250,112,52)",
        "rgb(245,64,32)",
        "rgb(237,45,28)",
        "rgb(220,24,32)",
        "rgb(180,0,35)",
      ],
      lineWidth: 2,
      // colorScale: scale,
      generateParticleOption: false,
    },
    fieldOptions: {
      wrapX: true,
      // flipY: true,
    },
  });
  // 添加风场图层到地图
  map.addLayer(windLayer);
};

onMounted(() => {
  // 初始化地图
  initMap();
  // 初始化风场图层
  initWindLayer();
});

onUnmounted(() => {
  // 组件卸载时清理
  if (map) {
    map.setTarget(null);
    map = null;
  }
  windLayer = null;
  windData = null;
});
</script>

<style scoped>
.wind-map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.map {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 220px;
}

.control-btn {
  padding: 8px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.control-btn:hover {
  background-color: #359469;
}

.slider-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  color: #333;
}

input[type="range"] {
  width: 100%;
}
</style>
