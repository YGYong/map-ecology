<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="info">
        <h4>平滑曲线绘制</h4>
        <p>绘制线条后自动应用平滑算法</p>
      </div>
      
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="enableSmooth" 
          />
          启用平滑处理
        </label>
      </div>
      
      <div class="control-group">
        <label>平滑迭代次数:</label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          v-model="iterations"
        />
        <span>{{ iterations }}</span>
      </div>
      
      <button @click="clearLines" class="clear-btn">
        清除所有线条
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Draw from 'ol/interaction/Draw';
import { Style, Stroke } from 'ol/style';
import smooth from 'chaikin-smooth';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let vectorSource = null;
let draw = null;

// 响应式变量
const enableSmooth = ref(true);
const iterations = ref(5);

// 平滑处理函数
const makeSmooth = (path, numIterations) => {
  numIterations = Math.min(Math.max(numIterations, 1), 10);
  let smoothPath = path;
  while (numIterations > 0) {
    smoothPath = smooth(smoothPath);
    numIterations--;
  }
  return smoothPath;
};

// 清除所有线条
const clearLines = () => {
  vectorSource.clear();
};

onMounted(() => {
  // 创建底图
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
    opacity: 0.5,
  });

  // 创建矢量数据源
  vectorSource = new VectorSource();

  // 创建矢量图层
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      stroke: new Stroke({
        color: '#ff0000',
        width: 3,
      }),
    }),
  });

  // 创建地图
  map = new Map({
    target: mapContainer.value,
    layers: [baseLayer, vectorLayer],
    view: new View({
      center: [116.4074, 39.9042],
      zoom: 10,
      projection: "EPSG:4326",
    }),
  });

  // 创建绘制交互
  draw = new Draw({
    source: vectorSource,
    type: 'LineString',
  });

  // 绘制结束事件
  draw.on('drawend', (event) => {
    if (!enableSmooth.value) {
      return;
    }
    
    const feature = event.feature;
    const geometry = feature.getGeometry();
    const coords = geometry.getCoordinates();
    
    // 应用平滑算法
    const smoothened = makeSmooth(coords, parseInt(iterations.value, 10));
    geometry.setCoordinates(smoothened);
  });

  // 添加绘制交互到地图
  map.addInteraction(draw);
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
  min-width: 250px;
}

.info h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 16px;
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
  margin: 15px 0;
  font-size: 14px;
}

.control-group label {
  font-weight: 500;
  white-space: nowrap;
}

.control-group input[type="range"] {
  flex: 1;
  min-width: 100px;
}

.control-group input[type="checkbox"] {
  transform: scale(1.2);
}

.control-group span {
  min-width: 30px;
  text-align: right;
  font-weight: bold;
  color: #007bff;
}

.clear-btn {
  width: 100%;
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.clear-btn:hover {
  background-color: #c82333;
}
</style>