<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="info">
        <h4>自定义形状绘制</h4>
        <p>地图上显示了{{ featureCount }}个随机分布的自定义形状</p>
      </div>
      
      <div class="control-group">
        <label>形状数量:</label>
        <input 
          type="range" 
          min="50" 
          max="500" 
          step="50" 
          v-model="featureCount"
          @input="updateFeatures"
        />
        <span>{{ featureCount }}</span>
      </div>
      
      <div class="control-group">
        <label>形状大小:</label>
        <input 
          type="range" 
          min="5" 
          max="20" 
          v-model="shapeSize"
          @input="updateShapeSize"
        />
        <span>{{ shapeSize }}px</span>
      </div>
      
      <div class="color-controls">
        <h5>颜色控制:</h5>
        <div class="color-buttons">
          <button 
            v-for="color in colors" 
            :key="color"
            :style="{ backgroundColor: color }"
            @click="changeColor(color)"
            :class="{ active: currentColor === color }"
          >
            {{ color }}
          </button>
        </div>
      </div>
      
      <div class="shape-controls">
        <h5>形状类型:</h5>
        <div class="shape-buttons">
          <button 
            v-for="shape in shapeTypes" 
            :key="shape"
            @click="filterByShape(shape)"
            :class="{ active: selectedShape === shape }"
          >
            {{ shape }}
          </button>
          <button 
            @click="showAllShapes"
            :class="{ active: selectedShape === 'all' }"
          >
            全部
          </button>
        </div>
      </div>
      
      <button @click="regenerateFeatures" class="regenerate-btn">
        重新生成形状
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Fill, Stroke, RegularShape } from 'ol/style';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let vectorSource = null;
let vectorLayer = null;
let styles = {};

// 响应式变量
const featureCount = ref(250);
const shapeSize = ref(10);
const currentColor = ref('red');
const selectedShape = ref('all');

// 颜色选项
const colors = ['red', 'blue', 'green', 'yellow', 'aqua', 'purple', 'orange'];

// 形状类型
const shapeTypes = ['square', 'rectangle', 'triangle', 'star', 'cross', 'x', 'stacked'];

// 创建样式函数
const createStyles = (size, color) => {
  const stroke = new Stroke({ color: 'black', width: 2 });
  const fill = new Fill({ color: color });

  return {
    'square': new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: size,
        angle: Math.PI / 4,
      }),
    }),
    'rectangle': new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        radius: size / Math.SQRT2,
        radius2: size,
        points: 4,
        angle: 0,
        scale: [1, 0.5],
      }),
    }),
    'triangle': new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 3,
        radius: size,
        rotation: Math.PI / 4,
        angle: 0,
      }),
    }),
    'star': new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: size,
        radius2: size * 0.4,
        angle: 0,
      }),
    }),
    'cross': new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: size,
        radius2: 0,
        angle: 0,
      }),
    }),
    'x': new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: size,
        radius2: 0,
        angle: Math.PI / 4,
      }),
    }),
    'stacked': [
      new Style({
        image: new RegularShape({
          fill: fill,
          stroke: stroke,
          points: 4,
          radius: size * 0.5,
          angle: Math.PI / 4,
          displacement: [0, size],
        }),
      }),
      new Style({
        image: new RegularShape({
          fill: fill,
          stroke: stroke,
          points: 4,
          radius: size,
          angle: Math.PI / 4,
        }),
      }),
    ],
  };
};

// 生成要素
const generateFeatures = (count) => {
  const features = new Array(count);
  const e = 20037508; // Web Mercator 最大范围
  
  for (let i = 0; i < count; ++i) {
    const coordinates = [
      2 * e * Math.random() - e,
      2 * e * Math.random() - e
    ];
    features[i] = new Feature(new Point(coordinates));
    
    // 随机选择形状类型
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    features[i].set('shapeType', shapeType);
    features[i].setStyle(styles[shapeType]);
  }
  
  return features;
};

// 更新要素数量
const updateFeatures = () => {
  const features = generateFeatures(featureCount.value);
  vectorSource.clear();
  vectorSource.addFeatures(features);
};

// 更新形状大小
const updateShapeSize = () => {
  styles = createStyles(shapeSize.value, currentColor.value);
  
  // 更新所有要素的样式
  vectorSource.getFeatures().forEach(feature => {
    const shapeType = feature.get('shapeType');
    feature.setStyle(styles[shapeType]);
  });
};

// 改变颜色
const changeColor = (color) => {
  currentColor.value = color;
  styles = createStyles(shapeSize.value, color);
  
  // 更新所有要素的样式
  vectorSource.getFeatures().forEach(feature => {
    const shapeType = feature.get('shapeType');
    feature.setStyle(styles[shapeType]);
  });
};

// 按形状类型过滤
const filterByShape = (shapeType) => {
  selectedShape.value = shapeType;
  
  vectorSource.getFeatures().forEach(feature => {
    const featureShapeType = feature.get('shapeType');
    if (featureShapeType === shapeType) {
      feature.setStyle(styles[featureShapeType]);
    } else {
      feature.setStyle(null); // 隐藏其他形状
    }
  });
};

// 显示所有形状
const showAllShapes = () => {
  selectedShape.value = 'all';
  
  vectorSource.getFeatures().forEach(feature => {
    const shapeType = feature.get('shapeType');
    feature.setStyle(styles[shapeType]);
  });
};

// 重新生成要素
const regenerateFeatures = () => {
  updateFeatures();
  showAllShapes();
};

onMounted(() => {
  // 初始化样式
  styles = createStyles(shapeSize.value, currentColor.value);
  
  // 创建矢量数据源
  vectorSource = new VectorSource();
  
  // 创建矢量图层
  vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  // 创建视图
  const view = new View({
    center: [0, 0],
    zoom: 2,
  });

  // 初始化地图
  map = new Map({
    target: mapContainer.value,
    layers: [vectorLayer],
    view,
  });

  // 生成初始要素
  const features = generateFeatures(featureCount.value);
  vectorSource.addFeatures(features);
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
  background-color: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 280px;
  max-height: 90vh;
  overflow-y: auto;
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
  min-width: 80px;
  font-weight: 500;
}

.control-group input[type="range"] {
  flex: 1;
  min-width: 100px;
}

.control-group span {
  min-width: 40px;
  text-align: right;
  font-weight: bold;
  color: #007bff;
}

.color-controls, .shape-controls {
  margin: 15px 0;
}

.color-controls h5, .shape-controls h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #495057;
}

.color-buttons, .shape-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.color-buttons button {
  padding: 5px 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: white;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.color-buttons button.active {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0,123,255,0.5);
}

.shape-buttons button {
  padding: 5px 10px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #495057;
  transition: all 0.3s ease;
}

.shape-buttons button:hover {
  background-color: #e9ecef;
}

.shape-buttons button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.regenerate-btn {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  margin-top: 15px;
}

.regenerate-btn:hover {
  background-color: #218838;
}
</style>
