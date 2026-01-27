<template>
  <div class="measure-map-container">
    <div ref="mapContainer" class="map"></div>
    
    <div class="toolbar">
      <div class="toolbar-group">
        <button 
          v-for="tool in tools" 
          :key="tool.id"
          class="tool-btn"
          :class="{ active: activeTool === tool.id, disabled: tool.disabled }"
          @click="activateTool(tool.id)"
        >
          <i :class="tool.icon"></i>
          <span class="tool-label">{{ tool.label }}</span>
        </button>
      </div>
      
      <div class="toolbar-group">
        <div class="unit-selector">
          <label for="unit">单位:</label>
          <select id="unit" v-model="selectedUnit">
            <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
          </select>
        </div>
        <button class="tool-btn clear-btn" @click="clearAll">
          <i class="fas fa-trash-alt"></i>
          <span class="tool-label">清除</span>
        </button>
      </div>
    </div>
    
    <div class="measurement-results">
      <div v-if="activeTool === 'distance' && currentMeasurement" class="result-card">
        <div class="result-header">
          <i class="fas fa-ruler"></i>
          <h3>距离测量</h3>
        </div>
        <div class="result-content">
          <div class="result-item">
            <span class="label">总长度:</span>
            <span class="value">{{ formatDistance(totalDistance) }}</span>
          </div>
          <div v-if="segments.length > 1" class="result-item">
            <span class="label">分段数:</span>
            <span class="value">{{ segments.length }} 段</span>
          </div>
          <div v-if="segments.length > 0" class="result-item">
            <span class="label">最后一段:</span>
            <span class="value">{{ formatDistance(lastSegmentDistance) }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="activeTool === 'area' && currentMeasurement" class="result-card">
        <div class="result-header">
          <i class="fas fa-draw-polygon"></i>
          <h3>面积测量</h3>
        </div>
        <div class="result-content">
          <div class="result-item">
            <span class="label">总面积:</span>
            <span class="value">{{ formatArea(area) }}</span>
          </div>
          <div class="result-item">
            <span class="label">周长:</span>
            <span class="value">{{ formatDistance(perimeter) }}</span>
          </div>
          <div class="result-item">
            <span class="label">顶点数:</span>
            <span class="value">{{ vertices }} 个</span>
          </div>
        </div>
      </div>
      
      <div v-if="activeTool === 'angle' && currentMeasurement" class="result-card">
        <div class="result-header">
          <i class="fas fa-compass"></i>
          <h3>角度测量</h3>
        </div>
        <div class="result-content">
          <div class="result-item">
            <span class="label">角度值:</span>
            <span class="value">{{ angle.toFixed(1) }}°</span>
          </div>
          <div class="result-item">
            <span class="label">方向:</span>
            <span class="value">{{ direction }}</span>
          </div>
          <div class="result-item">
            <span class="label">坐标:</span>
            <span class="value">{{ vertexCoords }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="activeTool === 'coordinate'" class="result-card">
        <div class="result-header">
          <i class="fas fa-map-marker-alt"></i>
          <h3>坐标定位</h3>
        </div>
        <div class="result-content">
          <div class="result-item">
            <span class="label">经度:</span>
            <span class="value">{{ clickedCoord[0].toFixed(6) }}</span>
          </div>
          <div class="result-item">
            <span class="label">纬度:</span>
            <span class="value">{{ clickedCoord[1].toFixed(6) }}</span>
          </div>
          <div class="result-item">
            <span class="label">缩放级别:</span>
            <span class="value">{{ currentZoom.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="help-tip" v-if="showHelp">
      <div class="tip-content">
        <p v-if="activeTool === 'distance'">点击地图开始测量距离，双击结束测量</p>
        <p v-if="activeTool === 'area'">点击地图开始测量面积，双击闭合多边形</p>
        <p v-if="activeTool === 'angle'">点击三个点测量角度（顶点、起点、终点）</p>
        <p v-if="activeTool === 'coordinate'">点击地图获取坐标位置</p>
      </div>
      <button class="close-tip" @click="showHelp = false">
        ×
      </button>
    </div>
    
    <div class="measurement-overlay" v-if="activeTool !== 'coordinate' && currentMeasurement">
      <div class="overlay-content">
        <div v-if="activeTool === 'distance'" class="distance-overlay">
          <div class="total">总长: {{ formatDistance(totalDistance) }}</div>
          <div class="segment" v-if="segments.length > 0">当前段: {{ formatDistance(lastSegmentDistance) }}</div>
        </div>
        <div v-if="activeTool === 'area'" class="area-overlay">
          <div class="area">面积: {{ formatArea(area) }}</div>
          <div class="perimeter">周长: {{ formatDistance(perimeter) }}</div>
        </div>
        <div v-if="activeTool === 'angle'" class="angle-overlay">
          <div class="angle">角度: {{ angle.toFixed(1) }}°</div>
          <div class="direction">方向: {{ direction }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, Vector as VectorSource } from "ol/source";
import { Point, LineString, Polygon } from "ol/geom";
import Feature from "ol/Feature";
import { Style, Fill, Stroke, Circle } from "ol/style";
import { fromLonLat, toLonLat } from "ol/proj";
import { defaults as defaultControls, FullScreen } from "ol/control";
import { Draw, Modify } from "ol/interaction";
import { getArea, getLength } from "ol/sphere";
import "ol/ol.css";

// 地图实例
const map = ref(null);
const mapContainer = ref(null);
const measureSource = ref(null);
const drawInteraction = ref(null);

// 工具状态
const tools = ref([
  { id: "distance", label: "距离", disabled: false },
  { id: "area", label: "面积", disabled: false },
  { id: "angle", label: "角度",  disabled: false },
  { id: "coordinate", label: "坐标", disabled: false }
]);

const activeTool = ref(null);
const selectedUnit = ref("metric");
const currentMeasurement = ref(false);
const showHelp = ref(false);
const clickedCoord = ref([0, 0]);
const currentZoom = ref(0);

// 测量数据
const totalDistance = ref(0);
const lastSegmentDistance = ref(0);
const segments = ref([]);
const area = ref(0);
const perimeter = ref(0);
const vertices = ref(0);
const angle = ref(0);
const direction = ref("");
const vertexCoords = ref("");

// 单位选项
const units = ref(["metric", "imperial"]);

// 计算格式化的距离
const formatDistance = computed(() => {
  return (distance) => {
    if (selectedUnit.value === "imperial") {
      // 转换为英尺和英里
      const feet = distance * 3.28084;
      if (feet > 5280) {
        return (feet / 5280).toFixed(2) + " mi";
      } else {
        return feet.toFixed(1) + " ft";
      }
    } else {
      // 公制单位（米和公里）
      if (distance > 1000) {
        return (distance / 1000).toFixed(2) + " km";
      } else {
        return distance.toFixed(1) + " m";
      }
    }
  };
});

// 计算格式化的面积
const formatArea = computed(() => {
  return (areaVal) => {
    if (selectedUnit.value === "imperial") {
      // 转换为平方英尺和英亩
      const sqft = areaVal * 10.7639;
      if (sqft > 43560) {
        return (sqft / 43560).toFixed(2) + " acres";
      } else {
        return sqft.toFixed(1) + " sq ft";
      }
    } else {
      // 公制单位（平方米、公顷和平方公里）
      if (areaVal > 10000) {
        if (areaVal > 1000000) {
          return (areaVal / 1000000).toFixed(2) + " km²";
        }
        return (areaVal / 10000).toFixed(2) + " ha";
      } else {
        return areaVal.toFixed(1) + " m²";
      }
    }
  };
});

// 初始化地图
onMounted(() => {
  // 创建测量数据源
  measureSource.value = new VectorSource();
  
  // 创建测量图层
  const measureLayer = new VectorLayer({
    source: measureSource.value,
    style: new Style({
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.2)",
      }),
      stroke: new Stroke({
        color: "rgba(0, 0, 255, 0.7)",
        width: 2,
      }),
      image: new Circle({
        radius: 7,
        fill: new Fill({
          color: "#ffcc33",
        }),
      }),
    }),
  });
  
  // 创建高德地图图层
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    })
  });

  // 创建地图
  map.value = new Map({
    target: mapContainer.value,
    layers: [baseLayer, measureLayer],
    view: new View({
      center: fromLonLat([116.4, 39.9]),
      zoom: 10,
    }),
    controls: defaultControls().extend([new FullScreen()]),
  });
  
  // 监听缩放变化
  map.value.getView().on("change:resolution", () => {
    currentZoom.value = map.value.getView().getZoom();
  });
  
  // 坐标定位点击事件
  map.value.on("click", (event) => {
    if (activeTool.value === "coordinate") {
      const coord = toLonLat(event.coordinate);
      clickedCoord.value = coord;
      currentMeasurement.value = true;
    }
  });
});

// 激活工具
function activateTool(toolId) {
  // 清除现有交互
  if (drawInteraction.value) {
    map.value.removeInteraction(drawInteraction.value);
    drawInteraction.value = null;
  }
  
  // 重置测量状态
  currentMeasurement.value = false;
  activeTool.value = toolId;
  
  // 根据工具类型创建新的交互
  switch (toolId) {
    case "distance":
      setupDistanceMeasurement();
      break;
    case "area":
      setupAreaMeasurement();
      break;
    case "angle":
      setupAngleMeasurement();
      break;
    case "coordinate":
      // 不需要特殊交互
      break;
  }
  
  // 显示帮助提示
  showHelp.value = true;
}

// 设置距离测量
function setupDistanceMeasurement() {
  measureSource.value.clear();
  
  // 创建线要素
  const line = new LineString([]);
  const feature = new Feature({
    geometry: line,
    type: "distance",
  });
  measureSource.value.addFeature(feature);
  
  // 创建绘制交互
  drawInteraction.value = new Draw({
    source: measureSource.value,
    type: "LineString",
    style: new Style({
      stroke: new Stroke({
        color: "rgba(0, 0, 255, 0.7)",
        width: 3,
      }),
      image: new Circle({
        radius: 7,
        fill: new Fill({
          color: "#ffcc33",
        }),
      }),
    }),
  });
  
  // 添加事件监听
  drawInteraction.value.on("drawstart", () => {
    segments.value = [];
    totalDistance.value = 0;
    lastSegmentDistance.value = 0;
    currentMeasurement.value = true;
  });
  
  drawInteraction.value.on("drawend", (event) => {
    // 计算总距离
    const geometry = event.feature.getGeometry();
    totalDistance.value = getLength(geometry);
    
    // 计算分段距离
    const coords = geometry.getCoordinates();
    for (let i = 1; i < coords.length; i++) {
      const segment = new LineString([coords[i - 1], coords[i]]);
      const distance = getLength(segment);
      segments.value.push(distance);
    }
    
    if (segments.value.length > 0) {
      lastSegmentDistance.value = segments.value[segments.value.length - 1];
    }
  });
  
  drawInteraction.value.on("drawabort", () => {
    measureSource.value.clear();
    currentMeasurement.value = false;
  });
  
  map.value.addInteraction(drawInteraction.value);
}

// 设置面积测量
function setupAreaMeasurement() {
  measureSource.value.clear();
  
  // 创建面要素
  const polygon = new Polygon([]);
  const feature = new Feature({
    geometry: polygon,
    type: "area",
  });
  measureSource.value.addFeature(feature);
  
  // 创建绘制交互
  drawInteraction.value = new Draw({
    source: measureSource.value,
    type: "Polygon",
    style: new Style({
      fill: new Fill({
        color: "rgba(0, 100, 255, 0.2)",
      }),
      stroke: new Stroke({
        color: "rgba(0, 0, 255, 0.7)",
        width: 2,
      }),
      image: new Circle({
        radius: 7,
        fill: new Fill({
          color: "#ffcc33",
        }),
      }),
    }),
  });
  
  // 添加事件监听
  drawInteraction.value.on("drawstart", () => {
    area.value = 0;
    perimeter.value = 0;
    vertices.value = 0;
    currentMeasurement.value = true;
  });
  
  drawInteraction.value.on("drawend", (event) => {
    const geometry = event.feature.getGeometry();
    area.value = getArea(geometry);
    
    // 计算周长
    const coordinates = geometry.getCoordinates()[0];
    vertices.value = coordinates.length;
    
    for (let i = 1; i < coordinates.length; i++) {
      const segment = new LineString([coordinates[i - 1], coordinates[i]]);
      perimeter.value += getLength(segment);
    }
  });
  
  drawInteraction.value.on("drawabort", () => {
    measureSource.value.clear();
    currentMeasurement.value = false;
  });
  
  map.value.addInteraction(drawInteraction.value);
}

// 设置角度测量
function setupAngleMeasurement() {
  measureSource.value.clear();

  // 用于存储3个点的坐标
  let anglePoints = [];

  // 创建绘制交互
  drawInteraction.value = new Draw({
    source: measureSource.value,
    type: "Point",
    style: (feature) => {
      // 按照采集顺序上色
      const features = measureSource.value.getFeatures();
      const idx = features.indexOf(feature);
      let color;
      switch (idx) {
        case 0: color = "#ff0000"; break; // 顶点 - 红色
        case 1: color = "#00ff00"; break; // 起点 - 绿色
        case 2: color = "#0000ff"; break; // 终点 - 蓝色
        default: color = "#ffcc33";
      }
      return new Style({
        image: new Circle({
          radius: 7,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: "#ffffff", width: 2 })
        })
      });
    },
  });

  drawInteraction.value.on("drawstart", () => {
    angle.value = 0;
    direction.value = "";
    vertexCoords.value = "";
    currentMeasurement.value = true;
  });

  drawInteraction.value.on("drawend", (event) => {
    const coord = event.feature.getGeometry().getCoordinates();
    anglePoints.push(coord);

    if (anglePoints.length === 3) {
      // 计算角度
      const [vertex, start, end] = anglePoints;
      const v1 = [start[0] - vertex[0], start[1] - vertex[1]];
      const v2 = [end[0] - vertex[0], end[1] - vertex[1]];
      const dot = v1[0] * v2[0] + v1[1] * v2[1];
      const mod1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
      const mod2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
      let theta = 0;
      if (mod1 > 0 && mod2 > 0) {
        theta = Math.acos(Math.max(-1, Math.min(1, dot / (mod1 * mod2))));
      }
      angle.value = theta * (180 / Math.PI);

      // 计算方向（取v1和v2的平均方向）
      const midAngle = (Math.atan2(v1[1], v1[0]) + Math.atan2(v2[1], v2[0])) / 2;
      const deg = midAngle * (180 / Math.PI);
      if (deg >= -22.5 && deg < 22.5) direction.value = "东";
      else if (deg >= 22.5 && deg < 67.5) direction.value = "东北";
      else if (deg >= 67.5 && deg < 112.5) direction.value = "北";
      else if (deg >= 112.5 && deg < 157.5) direction.value = "西北";
      else if (deg >= 157.5 || deg < -157.5) direction.value = "西";
      else if (deg >= -157.5 && deg < -112.5) direction.value = "西南";
      else if (deg >= -112.5 && deg < -67.5) direction.value = "南";
      else if (deg >= -67.5 && deg < -22.5) direction.value = "东南";

      // 设置坐标文本
      const vertexLonLat = toLonLat(vertex);
      vertexCoords.value = `${vertexLonLat[0].toFixed(4)}, ${vertexLonLat[1].toFixed(4)}`;

      // 3点采集完后，移除交互，保留点
      map.value.removeInteraction(drawInteraction.value);
      drawInteraction.value = null;
    }
  });

  map.value.addInteraction(drawInteraction.value);
}

// 清除所有测量
function clearAll() {
  measureSource.value.clear();
  currentMeasurement.value = false;
  segments.value = [];
  totalDistance.value = 0;
  area.value = 0;
  angle.value = 0;
}

// 组件卸载时清理
onUnmounted(() => {
  if (map.value) {
    map.value.dispose();
  }
});
</script>

<style scoped>
.measure-map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0c2461, #1e3799);
}

.map {
  width: 100%;
  height: 100%;
  background: #0a3d62;
}

.toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  z-index: 1;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.toolbar-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tool-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.tool-btn:hover:not(.disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.tool-btn.active {
  background: #2c3e50;
  box-shadow: 0 0 0 3px #3498db;
}

.tool-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  background: #e74c3c;
}

.clear-btn:hover {
  background: #c0392b;
}

.unit-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  color: #2c3e50;
  font-weight: 500;
}

.unit-selector select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 500;
}

.measurement-results {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 300px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.result-header {
  background: linear-gradient(to right, #3498db, #2c3e50);
  color: white;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-header i {
  font-size: 1.5rem;
}

.result-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.result-content {
  padding: 15px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item .label {
  font-weight: 500;
  color: #2c3e50;
}

.result-item .value {
  font-weight: 700;
  color: #3498db;
}

.help-tip {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 15px 40px 15px 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
}

.help-tip i {
  color: #3498db;
  font-size: 1.5rem;
}

.tip-content p {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
}

.close-tip {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 1rem;
}

.measurement-overlay {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  padding: 10px 20px;
  z-index: 1;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 200px;
  text-align: center;
}

.overlay-content {
  font-weight: 600;
  font-size: 1.1rem;
}

.overlay-content div {
  margin: 5px 0;
}

.distance-overlay .total {
  color: #3498db;
}

.distance-overlay .segment {
  color: #2ecc71;
  font-size: 0.95rem;
}

.area-overlay .area {
  color: #9b59b6;
}

.area-overlay .perimeter {
  color: #1abc9c;
  font-size: 0.95rem;
}

.angle-overlay .angle {
  color: #e74c3c;
}

.angle-overlay .direction {
  color: #f39c12;
  font-size: 0.95rem;
}
</style>