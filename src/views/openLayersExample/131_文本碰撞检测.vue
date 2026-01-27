<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="declutterEnabled" 
            @change="toggleDeclutter"
          />
          启用标签碰撞检测
        </label>
      </div>
      <div class="info">
        <p>缩放地图查看碰撞检测效果</p>
        <p>当前状态: {{ declutterEnabled ? '已启用' : '已禁用' }}</p>
      </div>
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
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Fill, Stroke, Text, Circle } from 'ol/style';
import 'ol/ol.css';

const mapContainer = ref(null);
let map = null;
let vectorLayer = null;

// 响应式变量
const declutterEnabled = ref(false);

// 切换碰撞检测
const toggleDeclutter = () => {
  // 重新创建图层以确保declutter设置生效
  const source = vectorLayer.getSource();
  
  // 移除旧图层
  map.removeLayer(vectorLayer);
  
  // 创建新图层
  vectorLayer = new VectorLayer({
    source: source,
    declutter: declutterEnabled.value,
  });
  
  // 添加新图层
  map.addLayer(vectorLayer);
};

onMounted(() => {
  // 创建底图
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });

  // 创建密集的点要素 - 增加更多点来测试碰撞
  const features = [];
  
  // 在北京周围创建密集的点
  const baseCoord = [116.4074, 39.9042];
  const cities = [
    '北京', '天津', '廊坊', '保定', '石家庄', '唐山', '秦皇岛', '张家口',
    '承德', '沧州', '衡水', '邢台', '邯郸', '太原', '大同', '阳泉',
    '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'
  ];

  cities.forEach((cityName, index) => {
    // 在北京周围随机分布
    const offsetX = (Math.random() - 0.5) * 8; // 经度偏移
    const offsetY = (Math.random() - 0.5) * 6; // 纬度偏移
    
    const feature = new Feature({
      geometry: new Point([baseCoord[0] + offsetX, baseCoord[1] + offsetY]),
      name: cityName
    });
    
    // 创建样式
    const style = new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({ color: 'red' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      }),
      text: new Text({
        text: cityName,
        font: '14px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 3 }),
        offsetY: -25,
        textAlign: 'center',
        textBaseline: 'middle',
      }),
    });
    
    feature.setStyle(style);
    features.push(feature);
  });

  // 创建矢量图层
  vectorLayer = new VectorLayer({
    source: new VectorSource({ features }),
    declutter: declutterEnabled.value,
  });

  // 创建地图
  map = new Map({
    target: mapContainer.value,
    layers: [baseLayer, vectorLayer],
    view: new View({
      center: [116.4074, 39.9042],
      zoom: 8,
      projection: "EPSG:4326",
    }),
  });
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
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  margin-bottom: 10px;
}

.control-group input[type="checkbox"] {
  transform: scale(1.2);
}

.info p {
  margin: 5px 0;
  font-size: 12px;
  color: #666;
}
</style>
