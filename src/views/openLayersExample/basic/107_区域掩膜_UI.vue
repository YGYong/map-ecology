<template>
  <div class="map-wrapper">
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3 class="panel-title">地图控制</h3>

      <!-- 遮罩控制 -->
      <div class="control-section">
        <h4 class="section-title">区域遮罩</h4>
        <div class="button-group">
          <button
            @click="toggleMask"
            :class="[
              'control-button',
              maskEnabled ? 'button-danger' : 'button-success',
            ]"
          >
            {{ maskEnabled ? "取消遮罩" : "添加遮罩" }}
          </button>
        </div>

        <!-- 遮罩样式控制 -->
        <div v-if="maskEnabled" class="mask-controls">
          <div class="control-item">
            <label class="control-label">遮罩透明度</label>
            <input
              v-model="maskOpacity"
              type="range"
              min="0"
              max="1"
              step="0.1"
              @input="updateMask"
              class="range-input"
            />
            <span class="control-value">{{ maskOpacity }}</span>
          </div>

          <div class="control-item">
            <label class="control-label">边界颜色</label>
            <input
              v-model="strokeColor"
              type="color"
              @change="updateMask"
              class="color-input"
            />
          </div>

          <div class="control-item">
            <label class="control-label">边界宽度</label>
            <input
              v-model="lineWidth"
              type="range"
              min="1"
              max="10"
              @input="updateMask"
              class="range-input"
            />
            <span class="control-value">{{ lineWidth }}px</span>
          </div>
        </div>
      </div>

      <!-- 地图裁剪控制 -->
      <div class="control-section">
        <h4 class="section-title">地图裁剪</h4>
        <div class="button-group">
          <button
            @click="toggleClipping"
            :class="[
              'control-button',
              clippingEnabled ? 'button-warning' : 'button-primary',
            ]"
          >
            {{ clippingEnabled ? "取消裁剪" : "启用裁剪" }}
          </button>
        </div>

        <!-- 裁剪预设选项 -->
        <div v-if="clippingEnabled" class="clipping-controls">
          <div class="control-item">
            <label class="control-label">裁剪形状</label>
            <select
              v-model="clipShape"
              @change="updateClipping"
              class="select-input"
            >
              <option value="circle">圆形</option>
              <option value="rectangle">矩形</option>
              <option value="polygon">多边形区域</option>
            </select>
          </div>

          <div v-if="clipShape === 'circle'" class="control-item">
            <label class="control-label">圆形半径</label>
            <input
              v-model="circleRadius"
              type="range"
              min="50"
              max="300"
              @input="updateClipping"
              class="range-input"
            />
            <span class="control-value">{{ circleRadius }}px</span>
          </div>

          <button
            @click="resetClipping"
            class="control-button button-secondary full-width"
          >
            重置裁剪
          </button>
        </div>
      </div>
    </div>

    <!-- 状态指示器 -->
    <div class="status-indicator">
      <div class="status-item">
        <div :class="['status-dot', maskEnabled ? 'dot-red' : 'dot-gray']"></div>
        <span class="status-text">遮罩: {{ maskEnabled ? "开启" : "关闭" }}</span>
      </div>
      <div class="status-item">
        <div
          :class="['status-dot', clippingEnabled ? 'dot-blue' : 'dot-gray']"
        ></div>
        <span class="status-text">裁剪: {{ clippingEnabled ? "开启" : "关闭" }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import "ol/ol.css";
// 注意：原代码引用路径可能有误，改为从 public 目录 fetch 或者确认路径
// 假设 modalData 是从 public/models/jiangsu.json 获取的
// import modalData from "../../../../gis-start/src/openLayers/320000_bj.json";

const mapContainer = ref(null);
let map = null;
let canvas = null;
let ctx = null;
let clipCanvas = null;
let clipCtx = null;
let jiangsuData = null;

// 响应式状态
const maskEnabled = ref(true);
const maskOpacity = ref(0.8);
const strokeColor = ref("#ff0000");
const lineWidth = ref(3);

const clippingEnabled = ref(false);
const clipShape = ref("circle");
const circleRadius = ref(150);

const view = new View({
  center: [118.7784, 32.0647],
  zoom: 7,
  projection: "EPSG:4326",
});

onMounted(async () => {
  // 加载数据
  try {
    const res = await fetch("/models/jiangsu.json");
    jiangsuData = await res.json();
  } catch (e) {
    console.error("加载数据失败", e);
  }

  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });

  // 创建遮罩canvas
  const viewport = map.getViewport();
  const offsetWidth = viewport.offsetWidth;
  const offsetHeight = viewport.offsetHeight;
  canvas = document.createElement("canvas");
  canvas.width = offsetWidth;
  canvas.height = offsetHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0px";
  canvas.style.left = "0px";
  canvas.style.zIndex = "1";
  ctx = canvas.getContext("2d");
  viewport.appendChild(canvas);

  // 创建裁剪canvas
  clipCanvas = document.createElement("canvas");
  clipCanvas.width = offsetWidth;
  clipCanvas.height = offsetHeight;
  clipCanvas.style.position = "absolute";
  clipCanvas.style.top = "0px";
  clipCanvas.style.left = "0px";
  clipCanvas.style.zIndex = "2";
  clipCtx = clipCanvas.getContext("2d");
  viewport.appendChild(clipCanvas);

  // 注册map事件
  map.on("postrender", () => {
    if (maskEnabled.value) {
      addMask();
    }
    if (clippingEnabled.value) {
      addClipping();
    }
  });

  // 监听窗口大小变化
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (map) {
    map.setTarget(null);
    map = null;
  }
  window.removeEventListener("resize", handleResize);
});

const handleResize = () => {
  if (map && canvas && clipCanvas) {
    const viewport = map.getViewport();
    const offsetWidth = viewport.offsetWidth;
    const offsetHeight = viewport.offsetHeight;
    canvas.width = offsetWidth;
    canvas.height = offsetHeight;
    clipCanvas.width = offsetWidth;
    clipCanvas.height = offsetHeight;
  }
};

// 切换遮罩
const toggleMask = () => {
  maskEnabled.value = !maskEnabled.value;
  if (!maskEnabled.value) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    addMask();
  }
};

// 更新遮罩
const updateMask = () => {
  if (maskEnabled.value) {
    addMask();
  }
};

// 添加区域遮罩
const addMask = () => {
  if (!jiangsuData) return;
  const fillStyle = `rgba(255,255,255,${maskOpacity.value})`;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 获取整个江苏省的所有多边形
  const jiangsuPolygons = jiangsuData.features[0].geometry.coordinates;

  // 1. 绘制整个画布为半透明白色
  ctx.fillStyle = fillStyle;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. 使用组合模式清除多边形区域
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(255,255,255,1)";

  // 绘制所有多边形
  jiangsuPolygons.forEach((polygon) => {
    const ring = polygon[0];
    const coords = ring.map((coord) => map.getPixelFromCoordinate(coord));
    ctx.beginPath();
    coords.forEach((coord, index) => {
      index === 0
        ? ctx.moveTo(coord[0], coord[1])
        : ctx.lineTo(coord[0], coord[1]);
    });
    ctx.closePath();
    ctx.fill();
  });

  // 3. 恢复组合模式并绘制边界
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = strokeColor.value;
  ctx.lineWidth = lineWidth.value;

  // 绘制所有多边形的边界
  jiangsuPolygons.forEach((polygon) => {
    const ring = polygon[0];
    const coords = ring.map((coord) => map.getPixelFromCoordinate(coord));
    ctx.beginPath();
    coords.forEach((coord, index) => {
      index === 0
        ? ctx.moveTo(coord[0], coord[1])
        : ctx.lineTo(coord[0], coord[1]);
    });
    ctx.closePath();
    ctx.stroke();
  });
};

// 切换裁剪
const toggleClipping = () => {
  clippingEnabled.value = !clippingEnabled.value;
  if (!clippingEnabled.value) {
    clipCtx.clearRect(0, 0, clipCanvas.width, clipCanvas.height);
    clipCanvas.style.display = "none";
  } else {
    clipCanvas.style.display = "block";
    addClipping();
  }
};

// 更新裁剪
const updateClipping = () => {
  if (clippingEnabled.value) {
    addClipping();
  }
};

// 添加裁剪效果
const addClipping = () => {
  if (!jiangsuData && clipShape.value === "polygon") return;
  clipCtx.clearRect(0, 0, clipCanvas.width, clipCanvas.height);

  if (clipShape.value === "polygon") {
    // 对于多边形裁剪，只显示江苏省区域内的内容
    // 先填充整个画布为黑色遮罩
    clipCtx.fillStyle = "rgba(255,255,255,1)";
    clipCtx.fillRect(0, 0, clipCanvas.width, clipCanvas.height);

    // 使用destination-out模式清除江苏省区域，显示下方地图
    clipCtx.globalCompositeOperation = "destination-out";
    const jiangsuPolygons = jiangsuData.features[0].geometry.coordinates;
    jiangsuPolygons.forEach((polygon) => {
      const ring = polygon[0];
      const coords = ring.map((coord) => map.getPixelFromCoordinate(coord));
      clipCtx.beginPath();
      coords.forEach((coord, index) => {
        index === 0
          ? clipCtx.moveTo(coord[0], coord[1])
          : clipCtx.lineTo(coord[0], coord[1]);
      });
      clipCtx.closePath();
      clipCtx.fill();
    });

    // 恢复组合模式并绘制边界
    clipCtx.globalCompositeOperation = "source-over";
    clipCtx.strokeStyle = "#00ff00";
    clipCtx.lineWidth = 2;
    jiangsuPolygons.forEach((polygon) => {
      const ring = polygon[0];
      const coords = ring.map((coord) => map.getPixelFromCoordinate(coord));
      clipCtx.beginPath();
      coords.forEach((coord, index) => {
        index === 0
          ? clipCtx.moveTo(coord[0], coord[1])
          : clipCtx.lineTo(coord[0], coord[1]);
      });
      clipCtx.closePath();
      clipCtx.stroke();
    });
  } else {
    // 对于圆形和矩形裁剪，也采用相同的逻辑
    // 先填充整个画布为黑色遮罩
    clipCtx.fillStyle = "rgba(255,255,255,1)";
    clipCtx.fillRect(0, 0, clipCanvas.width, clipCanvas.height);

    // 根据选择的形状创建透明区域
    clipCtx.globalCompositeOperation = "destination-out";

    const centerX = clipCanvas.width / 2;
    const centerY = clipCanvas.height / 2;

    if (clipShape.value === "circle") {
      clipCtx.beginPath();
      clipCtx.arc(centerX, centerY, circleRadius.value, 0, 2 * Math.PI);
      clipCtx.fill();
    } else if (clipShape.value === "rectangle") {
      const rectWidth = circleRadius.value * 2;
      const rectHeight = circleRadius.value * 1.5;
      clipCtx.fillRect(
        centerX - rectWidth / 2,
        centerY - rectHeight / 2,
        rectWidth,
        rectHeight
      );
    }

    // 恢复组合模式并添加边框
    clipCtx.globalCompositeOperation = "source-over";
    clipCtx.strokeStyle = "#00ff00";
    clipCtx.lineWidth = 2;

    if (clipShape.value === "circle") {
      clipCtx.beginPath();
      clipCtx.arc(centerX, centerY, circleRadius.value, 0, 2 * Math.PI);
      clipCtx.stroke();
    } else if (clipShape.value === "rectangle") {
      const rectWidth = circleRadius.value * 2;
      const rectHeight = circleRadius.value * 1.5;
      clipCtx.strokeRect(
        centerX - rectWidth / 2,
        centerY - rectHeight / 2,
        rectWidth,
        rectHeight
      );
    }
  }
};

// 重置裁剪
const resetClipping = () => {
  circleRadius.value = 150;
  clipShape.value = "circle";
  if (clippingEnabled.value) {
    addClipping();
  }
};
</script>

<style scoped>
/* 主容器 */
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}

/* 地图容器 */
.map-container {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
}

/* 控制面板 */
.control-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1000; /* 从10改为1000 */
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 16px;
  min-width: 256px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
  margin-top: 0;
}

/* 控制区域 */
.control-section {
  margin-bottom: 24px;
}

.control-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151;
  margin-top: 0;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

/* 按钮样式 */
.control-button {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button-success {
  background-color: #10b981;
  color: white;
}

.button-success:hover {
  background-color: #059669;
}

.button-danger {
  background-color: #ef4444;
  color: white;
}

.button-danger:hover {
  background-color: #dc2626;
}

.button-primary {
  background-color: #3b82f6;
  color: white;
}

.button-primary:hover {
  background-color: #2563eb;
}

.button-warning {
  background-color: #f59e0b;
  color: white;
}

.button-warning:hover {
  background-color: #d97706;
}

.button-secondary {
  background-color: #6b7280;
  color: white;
}

.button-secondary:hover {
  background-color: #4b5563;
}

.full-width {
  width: 100%;
}

/* 控制项 */
.mask-controls,
.clipping-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item {
  display: flex;
  flex-direction: column;
}

.control-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.control-value {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

/* 输入控件 */
.range-input {
  width: 100%;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #4f46e5;
  border-radius: 50%;
  cursor: pointer;
}

.range-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #4f46e5;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.color-input {
  width: 100%;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  cursor: pointer;
}

.select-input {
  width: 100%;
  padding: 4px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  color: #1f2937;
}

.select-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* 状态指示器 */
.status-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000; /* 从10改为1000 */
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-item:first-child {
  margin-bottom: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-red {
  background-color: #ef4444;
}

.dot-blue {
  background-color: #3b82f6;
}

.dot-gray {
  background-color: #6b7280;
}

.status-text {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-panel {
    min-width: 200px;
    padding: 12px;
  }

  .panel-title {
    font-size: 16px;
  }

  .control-button {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
