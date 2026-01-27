<template>
  <div class="drawing-map-container">
    <div ref="mapContainer" class="map"></div>

    <div class="map-controls">
      <div class="toolbar">
        <div class="toolbar-title">地图绘制工具</div>
        <div class="toolbar-group">
          <button
            v-for="tool in drawingTools"
            :key="tool.type"
            class="tool-btn"
            :class="{ active: currentTool === tool.type }"
            @click="activateTool(tool.type)"
          >
            <span class="tool-icon">{{ tool.icon }}</span>
            <span class="tool-label">{{ tool.label }}</span>
          </button>
        </div>

        <div class="toolbar-group">
          <button
            class="tool-btn"
            @click="activateModify"
            :class="{ active: modifyActive }"
          >
            <span class="tool-icon">✏️</span>
            <span class="tool-label">修改要素</span>
          </button>
          <button class="tool-btn" @click="deleteSelected">
            <span class="tool-icon">🗑️</span>
            <span class="tool-label">删除选中</span>
          </button>
          <button class="tool-btn" @click="clearAll">
            <span class="tool-icon">♻️</span>
            <span class="tool-label">清空所有</span>
          </button>
        </div>
      </div>

      <div class="info-panel">
        <div class="info-header">
          <h3>要素信息</h3>
          <button class="export-btn" @click="exportGeoJSON">导出GeoJSON</button>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div class="stat-label">点要素:</div>
            <div class="stat-value">{{ featureCount.point }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">线要素:</div>
            <div class="stat-value">{{ featureCount.line }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">面要素:</div>
            <div class="stat-value">{{ featureCount.polygon }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">其他要素:</div>
            <div class="stat-value">{{ featureCount.other }}</div>
          </div>
        </div>

        <div class="feature-list">
          <div
            v-for="(feature, index) in features"
            :key="feature.getId() || index"
            class="feature-item"
            :class="{ selected: selectedFeature === feature }"
            @click="selectFeature(feature)"
          >
            <div class="feature-icon">{{ getFeatureIcon(feature) }}</div>
            <div class="feature-info">
              <div class="feature-type">{{ getFeatureType(feature) }}</div>
              <div class="feature-id">
                ID: {{ feature.getId() || "未命名" }}
              </div>
            </div>
          </div>

          <div v-if="features.length === 0" class="empty-list">
            尚未绘制任何要素
          </div>
        </div>
      </div>
    </div>

    <div class="status-bar">
      <div class="status-item">
        <span class="status-label">当前工具:</span>
        <span class="status-value">{{ currentToolLabel }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">要素总数:</span>
        <span class="status-value">{{ features.length }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">选择状态:</span>
        <span class="status-value">{{
          selectedFeature ? "已选择" : "未选择"
        }}</span>
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
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import { Draw, Modify, Select } from "ol/interaction";
import "ol/ol.css";

// 地图实例
const map = ref(null);
const mapContainer = ref(null);
const vectorSource = ref(null);
const selectInteraction = ref(null);
const drawInteraction = ref(null);
const modifyInteraction = ref(null);

// 绘制工具数据
const drawingTools = ref([
  { type: "Point", label: "点", icon: "📍" },
  { type: "LineString", label: "线", icon: "📏" },
  { type: "Polygon", label: "面", icon: "⬢" },
  { type: "Circle", label: "圆", icon: "⭕" },
]);

// 状态数据
const currentTool = ref(null);
const modifyActive = ref(false);
const selectedFeature = ref(null);

// 要素统计
const features = ref([]);
const featureCount = ref({
  point: 0,
  line: 0,
  polygon: 0,
  other: 0,
});

// 计算当前工具标签
const currentToolLabel = computed(() => {
  if (modifyActive.value) return "修改要素";
  if (!currentTool.value) return "未选择工具";
  const tool = drawingTools.value.find((t) => t.type === currentTool.value);
  return tool ? tool.label : "未选择工具";
});

// 初始化地图
onMounted(() => {
  // 创建矢量数据源
  vectorSource.value = new VectorSource();

  // 创建矢量图层
  const vectorLayer = new VectorLayer({
    source: vectorSource.value,
    style: (feature) => createFeatureStyle(feature),
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
    layers: [baseLayer, vectorLayer],
    view: new View({
      center: fromLonLat([116.4, 39.9]),
      zoom: 10,
    }),
  });

  // 初始化选择交互
  selectInteraction.value = new Select({
    style: (feature) => createSelectionStyle(feature),
  });
  map.value.addInteraction(selectInteraction.value);

  // 监听选择变化
  selectInteraction.value.on("select", (event) => {
    selectedFeature.value =
      event.selected.length > 0 ? event.selected[0] : null;
  });

  // 监听矢量源变化
  vectorSource.value.on("addfeature", updateFeatureList);
  vectorSource.value.on("removefeature", updateFeatureList);
  vectorSource.value.on("changefeature", updateFeatureList);

  // 初始更新要素列表
  updateFeatureList();
});

// 更新要素列表和统计
function updateFeatureList() {
  features.value = vectorSource.value.getFeatures();

  // 重置统计
  featureCount.value = {
    point: 0,
    line: 0,
    polygon: 0,
    other: 0,
  };

  // 统计要素类型
  features.value.forEach((feature) => {
    const geomType = feature.getGeometry().getType();
    if (geomType === "Point") {
      featureCount.value.point++;
    } else if (geomType === "LineString") {
      featureCount.value.line++;
    } else if (geomType === "Polygon") {
      featureCount.value.polygon++;
    } else {
      featureCount.value.other++;
    }
  });
}

// 激活绘制工具
function activateTool(toolType) {
  // 重置修改状态
  modifyActive.value = false;
  if (modifyInteraction.value) {
    map.value.removeInteraction(modifyInteraction.value);
    modifyInteraction.value = null;
  }

  // 移除现有的绘制交互
  if (drawInteraction.value) {
    map.value.removeInteraction(drawInteraction.value);
    drawInteraction.value = null;
  }

  // 设置当前工具
  currentTool.value = toolType;

  // 创建新的绘制交互
  let geometryType = toolType;

  drawInteraction.value = new Draw({
    source: vectorSource.value,
    type: geometryType,
    style: createDrawStyle(),
  });

  map.value.addInteraction(drawInteraction.value);
}

// 激活修改工具
function activateModify() {
  // 移除现有的绘制交互
  if (drawInteraction.value) {
    map.value.removeInteraction(drawInteraction.value);
    drawInteraction.value = null;
    currentTool.value = null;
  }

  // 设置修改状态
  modifyActive.value = true;

  // 添加修改交互
  if (!modifyInteraction.value) {
    modifyInteraction.value = new Modify({
      source: vectorSource.value,
      style: createModifyStyle(),
    });
    map.value.addInteraction(modifyInteraction.value);
  }
}

// 删除选中的要素
function deleteSelected() {
  if (selectedFeature.value) {
    vectorSource.value.removeFeature(selectedFeature.value);
    selectedFeature.value = null;
  }
}

// 清空所有要素
function clearAll() {
  vectorSource.value.clear();
  selectedFeature.value = null;
}

// 选择要素
function selectFeature(feature) {
  selectInteraction.value.getFeatures().clear();
  selectInteraction.value.getFeatures().push(feature);
  selectedFeature.value = feature;
}

// 导出为GeoJSON
function exportGeoJSON() {
  if (features.value.length === 0) {
    alert("没有要素可导出");
    return;
  }

  const geoJSON = {
    type: "FeatureCollection",
    features: [],
  };

  features.value.forEach((feature) => {
    const geometry = feature.getGeometry();
    const type = geometry.getType();

    let geom;
    if (type === "Circle") {
      // 将圆形转换为多边形
      const center = geometry.getCenter();
      const radius = geometry.getRadius();
      const points = 32;
      const coords = [];

      for (let i = 0; i < points; i++) {
        const angle = (i * 2 * Math.PI) / points;
        const x = center[0] + radius * Math.cos(angle);
        const y = center[1] + radius * Math.sin(angle);
        coords.push([x, y]);
      }
      coords.push(coords[0]); // 闭合多边形

      geom = {
        type: "Polygon",
        coordinates: [coords],
      };
    } else {
      geom = {
        type: type,
        coordinates: geometry.getCoordinates(),
      };
    }

    geoJSON.features.push({
      type: "Feature",
      geometry: geom,
      properties: {
        id: feature.getId() || "未命名",
        type: type,
      },
    });
  });

  const dataStr = JSON.stringify(geoJSON, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
    dataStr
  )}`;

  const link = document.createElement("a");
  link.setAttribute("href", dataUri);
  link.setAttribute(
    "download",
    `map-features-${new Date().toISOString().slice(0, 10)}.geojson`
  );
  link.click();
}

// 创建要素样式
function createFeatureStyle(feature) {
  const type = feature.getGeometry().getType();
  const styles = {
    Point: new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: "#ff5722" }),
        stroke: new Stroke({ color: "#fff", width: 2 }),
      }),
      text: new Text({
        text: "📍",
        offsetY: -20,
        font: "bold 24px sans-serif",
      }),
    }),
    LineString: new Style({
      stroke: new Stroke({
        color: "#3498db",
        width: 4,
      }),
    }),
    Polygon: new Style({
      fill: new Fill({
        color: "rgba(52, 152, 219, 0.2)",
      }),
      stroke: new Stroke({
        color: "#3498db",
        width: 3,
      }),
    }),
    Circle: new Style({
      fill: new Fill({
        color: "rgba(155, 89, 182, 0.2)",
      }),
      stroke: new Stroke({
        color: "#9b59b6",
        width: 3,
      }),
    }),
  };

  return (
    styles[type] ||
    new Style({
      stroke: new Stroke({
        color: "#2c3e50",
        width: 2,
      }),
    })
  );
}

// 创建选择样式
function createSelectionStyle(feature) {
  const baseStyle = createFeatureStyle(feature);

  // 为多边形添加额外的填充样式
  if (
    feature.getGeometry().getType() === "Polygon" ||
    feature.getGeometry().getType() === "Circle"
  ) {
    return [
      baseStyle,
      new Style({
        fill: new Fill({
          color: "rgba(46, 204, 113, 0.3)",
        }),
      }),
    ];
  }

  // 为线添加额外的描边样式
  if (feature.getGeometry().getType() === "LineString") {
    return [
      baseStyle,
      new Style({
        stroke: new Stroke({
          color: "#2ecc71",
          width: 6,
        }),
      }),
    ];
  }

  // 为点添加额外样式
  if (feature.getGeometry().getType() === "Point") {
    return [
      baseStyle,
      new Style({
        image: new CircleStyle({
          radius: 12,
          stroke: new Stroke({
            color: "#2ecc71",
            width: 3,
          }),
          fill: new Fill({
            color: "rgba(46, 204, 113, 0.3)",
          }),
        }),
      }),
    ];
  }

  return baseStyle;
}

// 创建绘制样式
function createDrawStyle() {
  return new Style({
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.2)",
    }),
    stroke: new Stroke({
      color: "#ffeb3b",
      width: 2,
      lineDash: [10, 10],
    }),
    image: new CircleStyle({
      radius: 7,
      stroke: new Stroke({
        color: "#ffeb3b",
      }),
    }),
  });
}

// 创建修改样式
function createModifyStyle() {
  return new Style({
    image: new CircleStyle({
      radius: 7,
      stroke: new Stroke({
        color: "#fff",
      }),
      fill: new Fill({
        color: "#e74c3c",
      }),
    }),
    stroke: new Stroke({
      color: "#e74c3c",
      width: 2,
    }),
  });
}

// 获取要素图标
function getFeatureIcon(feature) {
  const type = feature.getGeometry().getType();
  if (type === "Point") return "📍";
  if (type === "LineString") return "📏";
  if (type === "Polygon") return "⬢";
  if (type === "Circle") return "⭕";
  return "❓";
}

// 获取要素类型
function getFeatureType(feature) {
  const type = feature.getGeometry().getType();
  if (type === "Circle") return "圆形";
  return type;
}

// 组件卸载时清理
onUnmounted(() => {
  if (map.value) {
    map.value.dispose();
  }
});
</script>

<style scoped>
.drawing-map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a2a6c, #2c3e50);
}

.map {
  width: 100%;
  height: 100%;
  background: #0d47a1;
}

.map-controls {
  position: absolute;
  top: 40px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 320px;
  z-index: 1;
}

.toolbar {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.toolbar-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: #2c3e50;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
}

.toolbar-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 5px;
}

.tool-btn {
  flex: 1;
  min-width: 90px;
  padding: 12px 8px;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tool-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.tool-btn.active {
  background: #2c3e50;
  box-shadow: 0 0 0 3px #3498db;
}

.tool-icon {
  font-size: 1.8rem;
  margin-bottom: 5px;
}

.tool-label {
  font-size: 0.85rem;
}

.info-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.info-header h3 {
  margin: 0;
  color: #2c3e50;
}

.export-btn {
  padding: 8px 12px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover {
  background: #219653;
  transform: translateY(-2px);
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  font-weight: 500;
  color: #2c3e50;
}

.stat-value {
  font-weight: 700;
  color: #3498db;
}

.feature-list {
  flex: 1;
  overflow-y: auto;
  max-height: 150px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 5px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 6px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: #e3f2fd;
}

.feature-item.selected {
  background: #bbdefb;
  border-left: 3px solid #3498db;
}

.feature-icon {
  font-size: 1.8rem;
  margin-right: 12px;
  width: 40px;
  text-align: center;
}

.feature-info {
  flex: 1;
}

.feature-type {
  font-weight: 600;
  color: #2c3e50;
}

.feature-id {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.empty-list {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
}

.coords-value {
  font-family: "Courier New", monospace;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: bold;
}

.zoom-level {
  font-family: "Courier New", monospace;
  font-size: 1rem;
  color: #e74c3c;
  font-weight: bold;
}

.status-bar {
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  z-index: 1;
}

.status-item {
  display: flex;
  gap: 8px;
}

.status-label {
  color: #bdc3c7;
}

.status-value {
  font-weight: 600;
}
</style>
