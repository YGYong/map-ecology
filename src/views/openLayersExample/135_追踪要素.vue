<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="info">
        <h4>面追踪绘制</h4>
        <p>沿着江苏省边界进行追踪绘制</p>
      </div>
      
      <div class="control-group">
        <label>绘制类型:</label>
        <select v-model="drawType" @change="changeDrawType">
          <option value="None">无</option>
          <option value="LineString">线条</option>
          <option value="Polygon">多边形</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="enableTrace" 
            @change="updateDrawInteraction"
          />
          启用边界追踪
        </label>
      </div>
      
      <button @click="clearDrawings" class="clear-btn">
        清除绘制
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
import GeoJSON from 'ol/format/GeoJSON';
import Draw from 'ol/interaction/Draw';
import Snap from 'ol/interaction/Snap';
import { Style, Fill, Stroke } from 'ol/style';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let baseVectorSource = null;
let drawVectorSource = null;
let drawInteraction = null;
let snapInteraction = null;

// 响应式变量
const drawType = ref('LineString');
const enableTrace = ref(true);

// 江苏省边界样式
const baseStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 0, 0, 0.3)',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 0, 0, 0.9)',
    width: 2,
  }),
});

// 绘制图层样式
const drawStyle = new Style({
  fill: new Fill({
    color: 'rgba(100, 255, 0, 0.3)',
  }),
  stroke: new Stroke({
    color: 'rgba(100, 255, 0, 1)',
    width: 3,
  }),
});

// 追踪绘制样式
const traceStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 100, 0.25)',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 100, 0.8)',
    width: 2,
  }),
});

// 添加绘制交互
const addDrawInteraction = () => {
  // 移除现有交互
  if (drawInteraction) {
    map.removeInteraction(drawInteraction);
  }
  if (snapInteraction) {
    map.removeInteraction(snapInteraction);
  }

  if (drawType.value !== 'None') {
    // 创建绘制交互
    const drawOptions = {
      type: drawType.value,
      source: drawVectorSource,
      style: traceStyle,
    };

    // 如果启用追踪，添加追踪配置
    if (enableTrace.value) {
      drawOptions.trace = true;
      drawOptions.traceSource = baseVectorSource;
    }

    drawInteraction = new Draw(drawOptions);
    
    // 创建吸附交互
    snapInteraction = new Snap({
      source: baseVectorSource,
    });

    // 添加交互到地图
    map.addInteraction(drawInteraction);
    map.addInteraction(snapInteraction);
  }
};

// 改变绘制类型
const changeDrawType = () => {
  addDrawInteraction();
};

// 更新绘制交互
const updateDrawInteraction = () => {
  addDrawInteraction();
};

// 清除绘制
const clearDrawings = () => {
  drawVectorSource.clear();
};

onMounted(() => {
  // 创建底图
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    }),
  });

  // 创建江苏省边界数据源
  baseVectorSource = new VectorSource({
    url: 'https://geo.datav.aliyun.com/areas_v3/bound/320000_full.json',
    format: new GeoJSON(),
  });

  // 创建江苏省边界图层
  const baseVectorLayer = new VectorLayer({
    source: baseVectorSource,
    style: baseStyle,
  });

  // 创建绘制数据源和图层
  drawVectorSource = new VectorSource();
  const drawVectorLayer = new VectorLayer({
    source: drawVectorSource,
    style: drawStyle,
  });

  // 创建地图
  map = new Map({
    target: mapContainer.value,
    layers: [baseLayer, baseVectorLayer, drawVectorLayer],
    view: new View({
      center: [119.0, 32.5], // 江苏省中心位置
      zoom: 7,
      projection: "EPSG:4326",
    }),
  });

  // 等待数据加载完成后添加交互
  baseVectorSource.on('featuresloadend', () => {
    addDrawInteraction();
  });
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

.control-group select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.control-group input[type="checkbox"] {
  transform: scale(1.2);
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
