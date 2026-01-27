<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="control-group">
        <label>裁剪形状:</label>
        <select v-model="clipShape" @change="updateClipShape">
          <option value="heart">❤️ 心形</option>
          <option value="circle">⭕ 圆形</option>
          <option value="star">⭐ 星形</option>
          <option value="rectangle">⬜ 矩形</option>
        </select>
      </div>
      <div class="control-group">
        <label>裁剪大小:</label>
        <input 
          type="range" 
          min="0.5" 
          max="3" 
          step="0.1" 
          v-model="clipSize"
          @input="updateClipSize"
        />
        <span>{{ clipSize }}x</span>
      </div>
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="enableClip" @change="toggleClip" />
          启用裁剪
        </label>
      </div>
      <button @click="resetView">重置视图</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let osmLayer = null;

// 响应式变量
const clipShape = ref('heart');
const clipSize = ref(1);
const enableClip = ref(true);

// 绘制心形路径
const drawHeart = (ctx, scale) => {
  ctx.scale(3 * scale, 3 * scale);
  ctx.translate(-75, -80);
  ctx.beginPath();
  ctx.moveTo(75, 40);
  ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
  ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
  ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
  ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
  ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
  ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
  ctx.closePath();
};

// 绘制圆形路径
const drawCircle = (ctx, scale) => {
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, 2 * Math.PI);
  ctx.closePath();
};

// 绘制星形路径
const drawStar = (ctx, scale) => {
  ctx.scale(scale, scale);
  ctx.beginPath();
  const spikes = 5;
  const outerRadius = 100;
  const innerRadius = 40;
  
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
};

// 绘制矩形路径
const drawRectangle = (ctx, scale) => {
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.rect(-100, -80, 200, 160);
  ctx.closePath();
};

// 获取裁剪形状绘制函数
const getClipFunction = (shape) => {
  switch (shape) {
    case 'heart':
      return drawHeart;
    case 'circle':
      return drawCircle;
    case 'star':
      return drawStar;
    case 'rectangle':
      return drawRectangle;
    default:
      return drawHeart;
  }
};

// 预渲染事件处理
const handlePrerender = (event) => {
  if (!enableClip.value) return;
  
  const ctx = event.context;
  const matrix = event.inversePixelTransform;
  const canvasPixelRatio = Math.sqrt(
    matrix[0] * matrix[0] + matrix[1] * matrix[1]
  );
  const canvasRotation = -Math.atan2(matrix[1], matrix[0]);
  
  ctx.save();
  
  // 居中画布并移除旋转以定位裁剪
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.rotate(-canvasRotation);
  
  // 绘制裁剪路径
  const clipFunction = getClipFunction(clipShape.value);
  clipFunction(ctx, canvasPixelRatio * clipSize.value);
  
  ctx.clip();
  
  // 恢复变换
  if (clipShape.value === 'heart') {
    ctx.translate(75, 80);
    ctx.scale(1 / 3 / canvasPixelRatio / clipSize.value, 1 / 3 / canvasPixelRatio / clipSize.value);
  } else {
    ctx.scale(1 / canvasPixelRatio / clipSize.value, 1 / canvasPixelRatio / clipSize.value);
  }
  
  // 重新应用画布旋转和位置
  ctx.rotate(canvasRotation);
  ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2);
};

// 后渲染事件处理
const handlePostrender = (event) => {
  if (!enableClip.value) return;
  
  const ctx = event.context;
  ctx.restore();
};

// 设置图层事件监听器
const setupLayerEvents = () => {
  if (osmLayer) {
    osmLayer.un('prerender', handlePrerender);
    osmLayer.un('postrender', handlePostrender);
    
    if (enableClip.value) {
      osmLayer.on('prerender', handlePrerender);
      osmLayer.on('postrender', handlePostrender);
    }
  }
};

// 更新裁剪形状
const updateClipShape = () => {
  setupLayerEvents();
  if (map) {
    map.render();
  }
};

// 更新裁剪大小
const updateClipSize = () => {
  if (map && enableClip.value) {
    map.render();
  }
};

// 切换裁剪
const toggleClip = () => {
  setupLayerEvents();
  if (map) {
    map.render();
  }
};

// 重置视图
const resetView = () => {
  if (map) {
    map.getView().animate({
      center: [116.4074, 39.9042],
      zoom: 10,
      duration: 1000
    });
  }
};

onMounted(() => {
  // 创建瓦片图层
  osmLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });

  // 创建视图
  const view = new View({
    center: [116.4074, 39.9042], // 北京市中心经纬度
    zoom: 10,
    projection: "EPSG:4326",
  });

  // 初始化地图
  map = new Map({
    target: mapContainer.value,
    layers: [osmLayer],
    view,
  });

  // 设置初始事件监听器
  setupLayerEvents();
});

onUnmounted(() => {
  // 清理事件监听器
  if (osmLayer) {
    osmLayer.un('prerender', handlePrerender);
    osmLayer.un('postrender', handlePostrender);
  }
  
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
  background: #000; /* 黑色背景突出裁剪效果 */
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
  min-width: 220px;
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
  white-space: nowrap;
}

.control-group select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.control-group input[type="range"] {
  flex: 1;
  min-width: 100px;
}

.control-group input[type="checkbox"] {
  transform: scale(1.2);
}

.control-group span {
  min-width: 40px;
  text-align: right;
  font-weight: bold;
  color: #007bff;
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
</style>
