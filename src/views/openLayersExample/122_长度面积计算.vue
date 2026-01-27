<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="control-group">
        <label for="type">测量类型:</label>
        <select v-model="measureType" @change="changeMeasureType">
          <option value="LineString">长度测量</option>
          <option value="Polygon">面积测量</option>
        </select>
      </div>
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showSegments" @change="toggleSegments" />
          显示分段长度
        </label>
      </div>
      <button @click="clearMeasurements">清除测量</button>
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
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { getArea, getLength } from 'ol/sphere';
import { Style, Fill, Stroke, Circle, Text, RegularShape } from 'ol/style';
import { transform } from 'ol/proj';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let source = null;
let vector = null;
let draw = null;
let modify = null;
let tipPoint = null;

// 响应式变量
const measureType = ref('LineString');
const showSegments = ref(true);

// 样式定义
const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});

const labelStyle = new Style({
  text: new Text({
    font: '14px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [3, 3, 3, 3],
    textBaseline: 'bottom',
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
  }),
});

const tipStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const modifyStyle = new Style({
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
  text: new Text({
    text: '拖拽修改',
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const segmentStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textBaseline: 'bottom',
    offsetY: -12,
  }),
  image: new RegularShape({
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
});

const segmentStyles = [segmentStyle];

// 格式化长度
const formatLength = (line) => {
  // 对于EPSG:4326坐标系，需要将坐标转换为适合长度计算的投影
  const coordinates = line.getCoordinates();
  
  // 将EPSG:4326坐标转换为Web Mercator (EPSG:3857) 进行长度计算
  const transformedCoords = coordinates.map(coord => 
    transform(coord, 'EPSG:4326', 'EPSG:3857')
  );
  
  // 创建转换后的线条用于长度计算
  const transformedLine = new LineString(transformedCoords);
  const length = getLength(transformedLine);
  
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km';
  } else {
    output = Math.round(length * 100) / 100 + ' m';
  }
  return output;
};

// 格式化面积
const formatArea = (polygon) => {
  // 对于EPSG:4326坐标系，需要将坐标转换为适合面积计算的投影
  const coordinates = polygon.getCoordinates()[0];
  
  // 将EPSG:4326坐标转换为Web Mercator (EPSG:3857) 进行面积计算
  const transformedCoords = coordinates.map(coord => 
    transform(coord, 'EPSG:4326', 'EPSG:3857')
  );
  
  // 创建转换后的多边形用于面积计算
  const transformedPolygon = new Polygon([transformedCoords]);
  const area = getArea(transformedPolygon);
  
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km²';
  } else {
    output = Math.round(area * 100) / 100 + ' m²';
  }
  return output;
};

// 样式函数
const styleFunction = (feature, segments, drawType, tip) => {
  const styles = [];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  let point, label, line;

  if (!drawType || drawType === type || type === 'Point') {
    styles.push(style);
    if (type === 'Polygon') {
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new LineString(geometry.getCoordinates()[0]);
    } else if (type === 'LineString') {
      point = new Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry;
    }
  }

  if (segments && line) {
    let count = 0;
    line.forEachSegment((a, b) => {
      const segment = new LineString([a, b]);
      const segmentLabel = formatLength(segment);
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }
      const segmentPoint = new Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(segmentLabel);
      styles.push(segmentStyles[count]);
      count++;
    });
  }

  if (label) {
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
  }

  if (tip && type === 'Point' && !modify.getOverlay().getSource().getFeatures().length) {
    tipPoint = geometry;
    tipStyle.getText().setText(tip);
    styles.push(tipStyle);
  }

  return styles;
};

// 添加绘制交互
const addInteraction = () => {
  const drawType = measureType.value;
  const activeTip = `点击继续绘制${drawType === 'Polygon' ? '多边形' : '线条'}`;
  const idleTip = '点击开始测量';
  let tip = idleTip;

  draw = new Draw({
    source: source,
    type: drawType,
    style: (feature) => {
      return styleFunction(feature, showSegments.value, drawType, tip);
    },
  });

  draw.on('drawstart', () => {
    modify.setActive(false);
    tip = activeTip;
  });

  draw.on('drawend', () => {
    modifyStyle.setGeometry(tipPoint);
    modify.setActive(true);
    map.once('pointermove', () => {
      modifyStyle.setGeometry(null);
    });
    tip = idleTip;
  });

  modify.setActive(true);
  map.addInteraction(draw);
};

// 改变测量类型
const changeMeasureType = () => {
  if (draw) {
    map.removeInteraction(draw);
  }
  addInteraction();
};

// 切换分段显示
const toggleSegments = () => {
  vector.changed();
  if (draw) {
    draw.getOverlay().changed();
  }
};

// 清除测量
const clearMeasurements = () => {
  source.clear();
};

onMounted(() => {
  // 创建数据源
  source = new VectorSource();

  // 创建修改交互
  modify = new Modify({ source: source, style: modifyStyle });

  // 创建矢量图层
  vector = new VectorLayer({
    source: source,
    style: (feature) => {
      return styleFunction(feature, showSegments.value);
    },
  });

  // 创建瓦片图层
  const tileLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });

  // 创建视图
  const view = new View({
    center: [116.4074, 39.9042], // 北京市中心经纬度
    zoom: 15,
    projection: "EPSG:4326",
  });

  // 初始化地图
  map = new Map({
    target: mapContainer.value,
    layers: [tileLayer, vector],
    view,
  });

  // 添加修改交互
  map.addInteraction(modify);

  // 添加绘制交互
  addInteraction();
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
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

.controls button {
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
