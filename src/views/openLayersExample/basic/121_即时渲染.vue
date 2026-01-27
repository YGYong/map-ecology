<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <button @click="toggleAnimation">
        {{ isAnimating ? '暂停动画' : '开始动画' }}
      </button>
      <button @click="resetAnimation">
        重置动画
      </button>
      <div class="control-group">
        <label>点数量:</label>
        <input 
          type="range" 
          min="100" 
          max="2000" 
          step="100" 
          v-model="pointCount"
          @input="updatePointCount"
        />
        <span>{{ pointCount }}</span>
      </div>
      <div class="control-group">
        <label>点大小:</label>
        <input 
          type="range" 
          min="2" 
          max="20" 
          step="1" 
          v-model="pointSize"
          @input="updatePointSize"
        />
        <span>{{ pointSize }}px</span>
      </div>
      <div class="control-group">
        <label>动画速度:</label>
        <input 
          type="range" 
          min="0.1" 
          max="3" 
          step="0.1" 
          v-model="animationSpeed"
        />
        <span>{{ animationSpeed }}x</span>
      </div>
      <div class="control-group">
        <label>点颜色:</label>
        <input 
          type="color" 
          v-model="pointColor"
          @input="updatePointColor"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Point from 'ol/geom/Point';
import { upAndDown } from 'ol/easing';
import { getVectorContext } from 'ol/render';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let layer = null;
let geometries = [];
let image = null;
let style = null;

// 响应式变量
const isAnimating = ref(true);
const pointCount = ref(1000);
const pointSize = ref(8);
const animationSpeed = ref(1);
const pointColor = ref('#f01414');

// 初始化几何体数组
const initializeGeometries = () => {
  const n = pointCount.value;
  geometries = new Array(n);
  
  for (let i = 0; i < n; ++i) {
    // 在地图视图范围内生成随机点
    const lon = 116.4074 + (Math.random() - 0.5) * 0.2; // 北京周围
    const lat = 39.9042 + (Math.random() - 0.5) * 0.2;
    geometries[i] = new Point([lon, lat]);
  }
};

// 动画渲染函数
const renderAnimation = (event) => {
  const vectorContext = getVectorContext(event);
  
  const n = geometries.length;
  let activeCount = 0;
  
  for (let i = 0; i < n; ++i) {
    // 计算重要性（透明度和缩放）
    const importance = upAndDown(Math.pow((n - i) / n, 0.15));
    if (importance < 0.1) {
      continue;
    }
    
    activeCount++;
    
    // 设置样式
    image.setOpacity(importance);
    image.setScale(importance);
    vectorContext.setStyle(style);
    vectorContext.drawGeometry(geometries[i]);
  }
  
  // 更新几何体位置（根据动画速度调整）
  if (Math.random() < animationSpeed.value * 0.1) {
    // 在地图视图范围内生成新的随机点
    const view = map.getView();
    const extent = view.calculateExtent(map.getSize());
    const lon = extent[0] + Math.random() * (extent[2] - extent[0]);
    const lat = extent[1] + Math.random() * (extent[3] - extent[1]);
    
    geometries.push(new Point([lon, lat]));
    geometries.shift();
  }
  
  // 继续动画
  if (isAnimating.value) {
    map.render();
  }
};

// 切换动画状态
const toggleAnimation = () => {
  isAnimating.value = !isAnimating.value;
  if (isAnimating.value) {
    map.render();
  }
};

// 重置动画
const resetAnimation = () => {
  initializeGeometries();
  map.render();
};

// 更新点数量
const updatePointCount = () => {
  initializeGeometries();
  if (isAnimating.value) {
    map.render();
  }
};

// 更新点大小
const updatePointSize = () => {
  if (image) {
    image.setRadius(pointSize.value);
    if (isAnimating.value) {
      map.render();
    }
  }
};

// 更新点颜色
const updatePointColor = () => {
  if (image) {
    image.getFill().setColor(pointColor.value);
    if (isAnimating.value) {
      map.render();
    }
  }
};

onMounted(() => {
  // 创建样式
  image = new Circle({
    radius: pointSize.value,
    fill: new Fill({ color: pointColor.value }),
  });

  style = new Style({
    image: image,
  });

  // 创建瓦片图层
  layer = new TileLayer({
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
    layers: [layer],
    view,
  });

  // 初始化几何体
  initializeGeometries();

  // 添加postrender事件监听器
  layer.on('postrender', renderAnimation);

  // 开始渲染
  map.render();
});

onUnmounted(() => {
  // 清理资源
  if (layer) {
    layer.un('postrender', renderAnimation);
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
  min-width: 280px;
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

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.control-group label {
  min-width: 80px;
  font-weight: 500;
}

.control-group input[type="range"] {
  flex: 1;
  min-width: 120px;
}

.control-group input[type="color"] {
  width: 40px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.control-group span {
  min-width: 50px;
  text-align: right;
  font-weight: bold;
  color: #007bff;
}
</style>
