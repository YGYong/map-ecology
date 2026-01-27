<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="info">
        <h4>图层望远镜</h4>
        <p>🖱️ 移动鼠标查看卫星图层</p>
        <p>⬆️⬇️ 方向键调整望远镜大小</p>
        <p>当前半径: {{ radius }}px</p>
      </div>
      <button @click="toggleSpyglass">
        {{ isSpyglassEnabled ? '关闭望远镜' : '开启望远镜' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { getRenderPixel } from 'ol/render';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let roadsLayer = null;
let imageryLayer = null;
let mousePosition = null;

// 响应式变量
const radius = ref(75);
const isSpyglassEnabled = ref(true);

// 预渲染事件处理函数
const handlePrerender = (event) => {
  if (!isSpyglassEnabled.value) return;
  
  const ctx = event.context;
  ctx.save();
  ctx.beginPath();
  
  if (mousePosition) {
    // 只在鼠标周围显示圆形区域
    const pixel = getRenderPixel(event, mousePosition);
    const offset = getRenderPixel(event, [
      mousePosition[0] + radius.value,
      mousePosition[1],
    ]);
    const canvasRadius = Math.sqrt(
      Math.pow(offset[0] - pixel[0], 2) + Math.pow(offset[1] - pixel[1], 2)
    );
    
    // 绘制圆形裁剪区域
    ctx.arc(pixel[0], pixel[1], canvasRadius, 0, 2 * Math.PI);
    
    // 绘制边框
    ctx.lineWidth = (5 * canvasRadius) / radius.value;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.stroke();
  }
  
  ctx.clip();
};

// 后渲染事件处理函数
const handlePostrender = (event) => {
  if (!isSpyglassEnabled.value) return;
  
  const ctx = event.context;
  ctx.restore();
};

// 鼠标移动事件处理
const handleMouseMove = (event) => {
  if (!isSpyglassEnabled.value) return;
  
  mousePosition = map.getEventPixel(event);
  map.render();
};

// 鼠标离开事件处理
const handleMouseOut = () => {
  mousePosition = null;
  map.render();
};

// 键盘事件处理
const handleKeyDown = (event) => {
  if (!isSpyglassEnabled.value) return;
  
  if (event.key === 'ArrowUp') {
    radius.value = Math.min(radius.value + 5, 150);
    map.render();
    event.preventDefault();
  } else if (event.key === 'ArrowDown') {
    radius.value = Math.max(radius.value - 5, 25);
    map.render();
    event.preventDefault();
  }
};

// 切换望远镜功能
const toggleSpyglass = () => {
  isSpyglassEnabled.value = !isSpyglassEnabled.value;
  
  // 先清除所有事件监听器
  imageryLayer.un('prerender', handlePrerender);
  imageryLayer.un('postrender', handlePostrender);
  
  if (isSpyglassEnabled.value) {
    // 重新添加事件监听器
    imageryLayer.on('prerender', handlePrerender);
    imageryLayer.on('postrender', handlePostrender);
  } else {
    mousePosition = null;
  }
  
  map.render();
};

onMounted(() => {
  // 创建道路图层（底图）
  roadsLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });

  // 创建卫星图层（望远镜中显示的图层）
  imageryLayer = new TileLayer({
    source: new XYZ({
      url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
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
    layers: [roadsLayer, imageryLayer],
    view,
  });

  // 添加事件监听器
  const container = mapContainer.value;
  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('keydown', handleKeyDown);

  // 初始化望远镜效果
  if (isSpyglassEnabled.value) {
    imageryLayer.on('prerender', handlePrerender);
    imageryLayer.on('postrender', handlePostrender);
  }
});

onUnmounted(() => {
  // 清理事件监听器
  if (mapContainer.value) {
    mapContainer.value.removeEventListener('mousemove', handleMouseMove);
    mapContainer.value.removeEventListener('mouseout', handleMouseOut);
  }
  document.removeEventListener('keydown', handleKeyDown);
  
  // 清理图层事件
  if (imageryLayer) {
    imageryLayer.un('prerender', handlePrerender);
    imageryLayer.un('postrender', handlePostrender);
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
  cursor: crosshair;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.95);
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

.controls button {
  width: 100%;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.controls button:hover {
  background-color: #0056b3;
}
</style>
