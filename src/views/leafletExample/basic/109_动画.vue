<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>地图动画</h2>
      <p>一个标记点将沿着预设路径移动。</p>
      <div class="info-display">
        <p>动画状态: <strong>{{ animationStatus }}</strong></p>
      </div>
      <button @click="toggleAnimation" class="action-button toggle-button">
        {{ isAnimating ? '暂停动画' : '开始动画' }}
      </button>
      <button @click="resetAnimation" :disabled="!map" class="action-button clear-button">重置动画</button>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-animation" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let map = null;
let animatedMarker = null;
let animationPolyline = null;
let animationInterval = null;
let currentPathIndex = 0;

const isAnimating = ref(false);
const animationStatus = ref('未开始');

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

// 动画路径点 (模拟从天安门到故宫的路径)
const animationPath = [
  [39.909186, 116.397479], // 天安门广场
  [39.9105, 116.3985],
  [39.9120, 116.3990],
  [39.9135, 116.3988],
  [39.9150, 116.3985],
  [39.916042, 116.397972] // 故宫博物院
];

onMounted(() => {
  map = L.map('map-animation').setView(initialView, initialZoom);

  L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>'
  }).addTo(map);

  // 绘制动画路径
  animationPolyline = L.polyline(animationPath, {
    color: 'purple',
    weight: 4,
    opacity: 0.6,
    dashArray: '5, 10' // 虚线
  }).addTo(map);

  // 创建动画标记点
  animatedMarker = L.marker(animationPath[0], {
    icon: L.divIcon({
      className: 'animated-marker-icon',
      html: '<div style="background-color: red; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>',
      iconSize: [15, 15],
      iconAnchor: [7.5, 7.5]
    })
  }).addTo(map);

  // 调整地图视图以适应路径
  map.fitBounds(animationPolyline.getBounds().pad(0.1)); // 稍微留点边距
});

onUnmounted(() => {
  stopAnimation(); // 停止动画
  if (map) {
    map.remove();
    map = null;
    animatedMarker = null;
    animationPolyline = null;
  }
});

const startAnimation = () => {
  if (isAnimating.value || !map || !animatedMarker) return;

  isAnimating.value = true;
  animationStatus.value = '播放中';

  animationInterval = setInterval(() => {
    currentPathIndex++;
    if (currentPathIndex < animationPath.length) {
      animatedMarker.setLatLng(animationPath[currentPathIndex]);
      // 也可以平滑移动，但这里为了简单直接设置
      // animatedMarker.setLatLng(animationPath[currentPathIndex], { animate: true, duration: 0.5 });
    } else {
      stopAnimation();
      animationStatus.value = '已完成';
      console.log('动画完成！');
    }
  }, 500); // 每0.5秒移动一步
};

const stopAnimation = () => {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  isAnimating.value = false;
  if (animationStatus.value === '播放中') {
    animationStatus.value = '已暂停';
  }
};

const toggleAnimation = () => {
  if (isAnimating.value) {
    stopAnimation();
  } else {
    startAnimation();
  }
};

const resetAnimation = () => {
  stopAnimation();
  currentPathIndex = 0;
  if (animatedMarker) {
    animatedMarker.setLatLng(animationPath[0]);
  }
  animationStatus.value = '未开始';
  console.log('动画已重置。');
};

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
    resetAnimation(); // 重置动画状态
  }
};
</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  font-family: sans-serif;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .map-wrapper {
    flex-direction: row;
  }
}

.control-panel {
  flex-shrink: 0;
  width: 100%;
  padding: 20px;
  background-color: #f8f8f8;
  border-right: 1px solid #eee;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (min-width: 768px) {
  .control-panel {
    width: 280px;
    height: 100%;
  }
}

.control-panel h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2em;
}

.info-display {
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  color: #495057;
}

.info-display p {
  margin: 5px 0;
  font-size: 0.95em;
}

.info-display strong {
  color: #007bff;
}

.map-container {
  flex-grow: 1;
  height: 100%;
  min-height: 300px;
  background-color: #e0e0e0;
}

.action-button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.action-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.toggle-button {
  background-color: #28a745; /* 绿色 */
  color: white;
}

.toggle-button:hover:not(:disabled) {
  background-color: #218838;
}

.clear-button {
  background-color: #dc3545;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background-color: #c82333;
}

.reset-button {
  background-color: #007bff;
  color: white;
  margin-top: auto;
}

.reset-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.reset-button:active:not(:disabled) {
  background-color: #004085;
}

/* 自定义动画标记点图标的样式 */
.animated-marker-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
