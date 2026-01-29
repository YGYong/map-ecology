<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="control-group">
        <label>绘制类型:</label>
        <select v-model="drawType" @change="changeDrawType">
          <option value="Point">点</option>
          <option value="LineString">线</option>
          <option value="Polygon">多边形</option>
          <option value="Circle">圆</option>
        </select>
      </div>
      
      <div class="instructions">
        <h4>操作说明:</h4>
        <ul>
          <li>🖱️ 点击绘制图形</li>
          <li>🔄 拖拽绿色点：缩放和旋转</li>
          <li>🔴 红色点：几何中心</li>
          <li>⌨️ Ctrl+拖拽：平移图形</li>
        </ul>
      </div>
      
      <button @click="clearAll">清除所有</button>
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
import Modify from 'ol/interaction/Modify';
import Translate from 'ol/interaction/Translate';
import { never, platformModifierKeyOnly, primaryAction } from 'ol/events/condition';
import { getCenter, getHeight, getWidth } from 'ol/extent';
import MultiPoint from 'ol/geom/MultiPoint';
import Point from 'ol/geom/Point';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let source = null;
let vector = null;
let draw = null;
let modify = null;
let translate = null;

// 响应式变量
const drawType = ref('Polygon');

// 计算几何中心的函数
const calculateCenter = (geometry) => {
  let center, coordinates, minRadius;
  const type = geometry.getType();
  
  if (type === 'Polygon') {
    let x = 0;
    let y = 0;
    let i = 0;
    coordinates = geometry.getCoordinates()[0].slice(1);
    coordinates.forEach((coordinate) => {
      x += coordinate[0];
      y += coordinate[1];
      i++;
    });
    center = [x / i, y / i];
  } else if (type === 'LineString') {
    center = geometry.getCoordinateAt(0.5);
    coordinates = geometry.getCoordinates();
  } else {
    center = getCenter(geometry.getExtent());
  }
  
  let sqDistances;
  if (coordinates) {
    sqDistances = coordinates.map((coordinate) => {
      const dx = coordinate[0] - center[0];
      const dy = coordinate[1] - center[1];
      return dx * dx + dy * dy;
    });
    minRadius = Math.sqrt(Math.max.apply(Math, sqDistances)) / 3;
  } else {
    minRadius = Math.max(
      getWidth(geometry.getExtent()),
      getHeight(geometry.getExtent())
    ) / 3;
  }
  
  return {
    center: center,
    coordinates: coordinates,
    minRadius: minRadius,
    sqDistances: sqDistances,
  };
};

// 基础样式
const style = new Style({
  geometry: (feature) => {
    const modifyGeometry = feature.get('modifyGeometry');
    return modifyGeometry ? modifyGeometry.geometry : feature.getGeometry();
  },
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: '#ffcc33',
    width: 2,
  }),
  image: new Circle({
    radius: 7,
    fill: new Fill({
      color: '#ffcc33',
    }),
  }),
});

// 样式函数
const styleFunction = (feature) => {
  const styles = [style];
  const modifyGeometry = feature.get('modifyGeometry');
  const geometry = modifyGeometry ? modifyGeometry.geometry : feature.getGeometry();
  const result = calculateCenter(geometry);
  const center = result.center;
  
  if (center) {
    // 添加中心点（红色）
    styles.push(
      new Style({
        geometry: new Point(center),
        image: new Circle({
          radius: 4,
          fill: new Fill({
            color: '#ff3333',
          }),
        }),
      })
    );
    
    const coordinates = result.coordinates;
    if (coordinates) {
      const minRadius = result.minRadius;
      const sqDistances = result.sqDistances;
      const rsq = minRadius * minRadius;
      const points = coordinates.filter((coordinate, index) => {
        return sqDistances[index] > rsq;
      });
      
      // 添加外围控制点（绿色）
      styles.push(
        new Style({
          geometry: new MultiPoint(points),
          image: new Circle({
            radius: 4,
            fill: new Fill({
              color: '#33cc33',
            }),
          }),
        })
      );
    }
  }
  
  return styles;
};

// 添加绘制交互
const addDrawInteraction = () => {
  if (draw) {
    map.removeInteraction(draw);
  }
  
  draw = new Draw({
    source: source,
    type: drawType.value,
  });
  
  map.addInteraction(draw);
};

// 改变绘制类型
const changeDrawType = () => {
  addDrawInteraction();
};

// 清除所有
const clearAll = () => {
  if (source) {
    source.clear();
  }
};

onMounted(() => {
  // 创建矢量数据源
  source = new VectorSource();

  // 创建矢量图层
  vector = new VectorLayer({
    source: source,
    style: styleFunction,
  });

  // 创建瓦片图层
  const raster = new TileLayer({
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
    layers: [raster, vector],
    view,
  });

  // 获取默认修改样式
  const defaultStyle = new Modify({ source: source }).getOverlay().getStyleFunction();

  // 创建修改交互（支持缩放和旋转）
  modify = new Modify({
    source: source,
    condition: (event) => {
      return primaryAction(event) && !platformModifierKeyOnly(event);
    },
    deleteCondition: never,
    insertVertexCondition: never,
    style: (feature, resolution) => {
      feature.get('features').forEach((modifyFeature) => {
        const modifyGeometry = modifyFeature.get('modifyGeometry');
        if (modifyGeometry) {
          const point = feature.getGeometry().getCoordinates();
          let modifyPoint = modifyGeometry.point;
          
          if (!modifyPoint) {
            // 保存初始几何和顶点位置
            modifyPoint = point;
            modifyGeometry.point = modifyPoint;
            modifyGeometry.geometry0 = modifyGeometry.geometry;
            
            // 获取锚点和最小半径
            const result = calculateCenter(modifyGeometry.geometry0);
            modifyGeometry.center = result.center;
            modifyGeometry.minRadius = result.minRadius;
          }

          const center = modifyGeometry.center;
          const minRadius = modifyGeometry.minRadius;
          let dx = modifyPoint[0] - center[0];
          let dy = modifyPoint[1] - center[1];
          const initialRadius = Math.sqrt(dx * dx + dy * dy);
          
          if (initialRadius > minRadius) {
            const initialAngle = Math.atan2(dy, dx);
            dx = point[0] - center[0];
            dy = point[1] - center[1];
            const currentRadius = Math.sqrt(dx * dx + dy * dy);
            
            if (currentRadius > 0) {
              const currentAngle = Math.atan2(dy, dx);
              const geometry = modifyGeometry.geometry0.clone();
              geometry.scale(currentRadius / initialRadius, undefined, center);
              geometry.rotate(currentAngle - initialAngle, center);
              modifyGeometry.geometry = geometry;
            }
          }
        }
      });
      return defaultStyle(feature, resolution);
    },
  });

  // 修改开始事件
  modify.on('modifystart', (event) => {
    event.features.forEach((feature) => {
      feature.set('modifyGeometry', { geometry: feature.getGeometry().clone() }, true);
    });
  });

  // 修改结束事件
  modify.on('modifyend', (event) => {
    event.features.forEach((feature) => {
      const modifyGeometry = feature.get('modifyGeometry');
      if (modifyGeometry) {
        feature.setGeometry(modifyGeometry.geometry);
        feature.unset('modifyGeometry', true);
      }
    });
  });

  // 创建平移交互（Ctrl+拖拽）
  translate = new Translate({
    condition: (event) => {
      return primaryAction(event) && platformModifierKeyOnly(event);
    },
    layers: [vector],
  });

  // 添加交互
  map.addInteraction(modify);
  map.addInteraction(translate);
  
  // 添加绘制交互
  addDrawInteraction();
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
  min-width: 250px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
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

.instructions {
  margin-bottom: 15px;
}

.instructions h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 14px;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #666;
}

.instructions li {
  margin-bottom: 4px;
}

.controls button {
  width: 100%;
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.controls button:hover {
  background-color: #c82333;
}
</style>
