<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>

    <div class="map-controls">
      <div class="layer-controls">
        <h3>图层控制</h3>
        <div
          v-for="layer in layers"
          :key="layer.id"
          class="layer-item"
          :class="{ active: activeLayer === layer.id }"
          @click="setActiveLayer(layer.id)"
        >
          <div class="layer-info">
            <div class="layer-name">{{ layer.name }}</div>
            <div class="layer-desc">{{ layer.description }}</div>
          </div>
        </div>
      </div>

      <div class="vector-controls">
        <h3>矢量操作</h3>
        <button class="vector-btn" @click="addPoint">添加点</button>
        <button class="vector-btn" @click="addLine">添加线</button>
        <button class="vector-btn" @click="addPolygon">添加面</button>
        <button class="vector-btn clear" @click="clearFeatures">
          清除要素
        </button>
      </div>
    </div>

    <div class="coordinates-display">
      <div class="coords-label">当前坐标:</div>
      <div class="coords-value">{{ coordinates }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, Vector as VectorSource } from "ol/source";
import { Point, LineString, Polygon } from "ol/geom";
import Feature from "ol/Feature";
import { Style, Fill, Stroke, Circle } from "ol/style";
import { defaults as defaultControls, FullScreen, ScaleLine } from "ol/control";
import { fromLonLat, toLonLat } from "ol/proj";
import "ol/ol.css";

// 地图实例
const map = ref(null);
const mapContainer = ref(null);
const vectorSource = ref(null);

// 图层数据
const layers = ref([
  {
    id: "webrd",
    name: "webrd路网",
    description: "高德标准路网图层",
  },
  {
    id: "webst",
    name: "webst地形图",
    description: "高德地形图",
  },
  {
    id: "vector",
    name: "矢量图层",
    description: "点、线、面矢量要素",
  },
]);

// 当前激活的图层
const activeLayer = ref("webrd");

// 坐标显示
const coordinates = ref("经度: 0.00, 纬度: 0.00");

// 初始化地图
onMounted(() => {
  // 创建矢量数据源
  vectorSource.value = new VectorSource();

  // 创建矢量图层样式
  const vectorStyle = new Style({
    image: new Circle({
      radius: 7,
      fill: new Fill({ color: "#ff5722" }),
      stroke: new Stroke({
        color: "#fff",
        width: 2,
      }),
    }),
    fill: new Fill({
      color: "rgba(52, 152, 219, 0.2)",
    }),
    stroke: new Stroke({
      color: "#3498db",
      width: 3,
    }),
  });

  // 创建图层
  const webrdLayer = new TileLayer({
    source: new XYZ({
      // 设置路网图层
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
    properties: { id: "webrd" },
  });

  const webstLayer = new TileLayer({
    source: new XYZ({
      // 高德地图瓦片服务地址
      url: "https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}",
    }),
    properties: { id: "webst" },
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource.value,
    style: vectorStyle,
    visible: false,
    properties: { id: "vector" },
  });

  // 创建地图
  map.value = new Map({
    target: mapContainer.value,
    layers: [webstLayer, vectorLayer, webrdLayer], // 后面的图层覆盖前面的图层
    view: new View({
      center: fromLonLat([116.4, 39.9]), // 北京
      zoom: 10,
    }),
    controls: defaultControls().extend([new FullScreen(), new ScaleLine()]),
  });

  // 添加坐标显示事件
  map.value.on("pointermove", (event) => {
    const coord = toLonLat(event.coordinate);
    coordinates.value = `经度: ${coord[0].toFixed(4)}, 纬度: ${coord[1].toFixed(
      4
    )}`;
  });
});

// 组件卸载时清理
onUnmounted(() => {
  if (map.value) {
    map.value.dispose();
  }
});

// 设置激活图层
function setActiveLayer(layerId) {
  activeLayer.value = layerId;

  // 更新图层可见性
  map.value.getLayers().forEach((layer) => {
    const layerIdProp = layer.get("id");
    if (layerIdProp) {
      layer.setVisible(layerIdProp === layerId);
    }
  });
}

// 添加点要素
function addPoint() {
  const view = map.value.getView();
  const center = view.getCenter();

  // 在中心点附近随机位置添加点
  const randomCoord = [
    center[0] + (Math.random() - 0.5) * 20000,
    center[1] + (Math.random() - 0.5) * 20000,
  ];

  const point = new Feature({
    geometry: new Point(randomCoord),
    name: "随机点",
    type: "point",
  });

  vectorSource.value.addFeature(point);
}

// 添加线要素
function addLine() {
  const view = map.value.getView();
  const center = view.getCenter();

  // 创建一条简单的折线
  const line = new Feature({
    geometry: new LineString([
      [center[0] - 10000, center[1] - 5000],
      [center[0], center[1] + 8000],
      [center[0] + 10000, center[1] - 5000],
    ]),
    name: "折线",
    type: "line",
  });

  vectorSource.value.addFeature(line);
}

// 添加多边形要素
function addPolygon() {
  const view = map.value.getView();
  const center = view.getCenter();

  // 创建一个简单的多边形
  const polygon = new Feature({
    geometry: new Polygon([
      [
        [center[0] - 8000, center[1] - 8000],
        [center[0] + 8000, center[1] - 8000],
        [center[0] + 8000, center[1] + 8000],
        [center[0] - 8000, center[1] + 8000],
        [center[0] - 8000, center[1] - 8000],
      ],
    ]),
    name: "多边形",
    type: "polygon",
  });

  vectorSource.value.addFeature(polygon);
}

// 清除所有要素
function clearFeatures() {
  vectorSource.value.clear();
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.map {
  width: 100%;
  height: 100%;
  background: #f0f5ff;
}

.map-controls {
  position: absolute;
  top: 20px;
  left: 40px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 1;
  width: 280px;
}

.layer-controls h3,
.vector-controls h3 {
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
}

.layer-item {
  display: flex;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.layer-item:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.layer-item.active {
  background: #e3f2fd;
  border-left: 3px solid #3498db;
}

.layer-info {
  flex: 1;
}

.layer-name {
  font-weight: 600;
  color: #2c3e50;
}

.layer-desc {
  font-size: 0.85rem;
  color: #718096;
}

.vector-controls {
  margin-top: 20px;
}

.vector-btn {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.vector-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.vector-btn.clear {
  background: #e74c3c;
}

.vector-btn.clear:hover {
  background: #c0392b;
}

.coordinates-display {
  position: absolute;
  bottom: 40px;
  left: 40px;
  background: #3498db;
  border-radius: 8px;
  padding: 10px 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.coords-label {
  font-weight: 500;
  color: #2c3e50;
}

.coords-value {
  font-family: monospace;
  font-size: 0.95rem;
}
</style>
