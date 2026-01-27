<template>
  <div class="ol-tutorial-demo-container">
    <div ref="mapContainer" class="map"></div>
    <!-- 状态栏 -->
    <div class="statusbar">
      <span>坐标: {{ mouseCoord }}</span>
      <span>缩放: {{ zoom }}</span>
      <span>旋转: {{ rotation }}°</span>
      <span>分辨率: {{ resolution }}</span>
    </div>
    <!-- 框选包络框弹窗 -->
    <div v-if="boxInfo" class="popup" :style="boxPopupStyle">
      <div><strong>框选范围</strong></div>
      <div>西南: {{ boxInfo.sw }}</div>
      <div>东北: {{ boxInfo.ne }}</div>
      <button class="close-btn" @click="boxInfo = null">关闭</button>
    </div>
    <!-- 点标记弹窗 -->
    <div v-if="pointPopup" class="popup" :style="pointPopupStyle">
      <div><strong>点标记</strong></div>
      <div>经度: {{ pointPopup.lon }}</div>
      <div>纬度: {{ pointPopup.lat }}</div>
      <button class="close-btn" @click="removePoint(pointPopup.id)">删除</button>
      <button class="close-btn" @click="pointPopup = null">关闭</button>
    </div>
    <!-- 地图点击弹窗 -->
    <div v-if="mapPopup" class="popup" :style="mapPopupStyle">
      <div><strong>地图信息</strong></div>
      <div>经度: {{ mapPopup.lon }}</div>
      <div>纬度: {{ mapPopup.lat }}</div>
      <div>缩放: {{ mapPopup.zoom }}</div>
      <div>分辨率: {{ mapPopup.resolution }}</div>
      <button class="close-btn" @click="mapPopup = null">关闭</button>
    </div>
    <!-- 右键菜单 -->
    <ul v-if="contextMenu.visible" class="context-menu" :style="contextMenu.style">
      <li @click="zoomIn">放大一级</li>
      <li @click="zoomOut">缩小一级</li>
      <li @click="centerBeijing">定位到北京</li>
      <li @click="closeContextMenu">关闭</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, Vector as VectorSource } from "ol/source";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import { Style, Stroke, Circle, Fill } from "ol/style";
import { defaults as defaultControls, FullScreen, ScaleLine } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction/defaults";
import { fromLonLat, toLonLat } from "ol/proj";
import DragBox from "ol/interaction/DragBox";
import { platformModifierKeyOnly } from "ol/events/condition";
import "ol/ol.css";

const map = ref(null);
const mapContainer = ref(null);
const vectorSource = ref(null);
const pointLayer = ref(null);
const dragBox = ref(null);

// 状态栏
const mouseCoord = ref('');
const zoom = ref(0);
const rotation = ref(0);
const resolution = ref(0);

// 地图弹窗
const mapPopup = ref(null);
const mapPopupStyle = ref({});

// 点标记
const points = ref([]); // {id, lon, lat, feature}
const pointPopup = ref(null);
const pointPopupStyle = ref({});
let pointId = 1;
function addPoint(lon, lat) {
  const feature = new Feature({ geometry: new Point(fromLonLat([lon, lat])) });
  feature.setStyle(new Style({
    image: new Circle({ radius: 8, fill: new Fill({ color: '#ff5722' }), stroke: new Stroke({ color: '#fff', width: 2 }) })
  }));
  pointLayer.value.getSource().addFeature(feature);
  points.value.push({ id: pointId++, lon, lat, feature });
}
function removePoint(id) {
  const idx = points.value.findIndex(p => p.id === id);
  if (idx !== -1) {
    pointLayer.value.getSource().removeFeature(points.value[idx].feature);
    points.value.splice(idx, 1);
    pointPopup.value = null;
  }
}

// 框选
const boxInfo = ref(null);
const boxPopupStyle = ref({});

// 右键菜单
const contextMenu = ref({ visible: false, style: {}, pixel: null });
function closeContextMenu() { contextMenu.value.visible = false; }
function zoomIn() { map.value.getView().setZoom(map.value.getView().getZoom() + 1); closeContextMenu(); }
function zoomOut() { map.value.getView().setZoom(map.value.getView().getZoom() - 1); closeContextMenu(); }
function centerBeijing() { map.value.getView().setCenter(fromLonLat([116.4, 39.9])); map.value.getView().setZoom(12); closeContextMenu(); }

onMounted(() => {
  // 初始化图层
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });
  vectorSource.value = new VectorSource();
  pointLayer.value = new VectorLayer({ source: new VectorSource() });
  // 初始化地图
  map.value = new Map({
    target: mapContainer.value,
    layers: [baseLayer, pointLayer.value],
    view: new View({ center: fromLonLat([116.4, 39.9]), zoom: 12 }),
    controls: defaultControls().extend([new FullScreen(), new ScaleLine()]),
    interactions:defaultInteractions({
    doubleClickZoom: false, // 禁用双击缩放
  }),
  });
  // 状态栏
  zoom.value = map.value.getView().getZoom();
  rotation.value = (map.value.getView().getRotation() * 180 / Math.PI).toFixed(1);
  resolution.value = map.value.getView().getResolution().toFixed(2);
  map.value.on('pointermove', (evt) => {
    const [lon, lat] = toLonLat(evt.coordinate);
    mouseCoord.value = `${lon.toFixed(6)}, ${lat.toFixed(6)}`;
  });
  map.value.getView().on('change:rotation', () => { 
    rotation.value = (map.value.getView().getRotation() * 180 / Math.PI).toFixed(1); 
  });
  map.value.getView().on('change:resolution', () => { 
    resolution.value = map.value.getView().getResolution().toFixed(2);
    zoom.value = map.value.getView().getZoom().toFixed(2); 
  });
  // 单击弹窗
  map.value.on('singleclick', (evt) => {
    closeContextMenu();
    // 检查点标记
    const feature = map.value.forEachFeatureAtPixel(evt.pixel, f => f);
    if (feature && pointLayer.value.getSource().getFeatures().includes(feature)) {
      // 点标记弹窗
      const [lon, lat] = toLonLat(feature.getGeometry().getCoordinates());
      pointPopup.value = { id: points.value.find(p => p.feature === feature).id, lon: lon.toFixed(6), lat: lat.toFixed(6) };
      pointPopupStyle.value = { left: evt.pixel[0] + 20 + 'px', top: evt.pixel[1] + 20 + 'px' };
      return;
    }
    // 地图弹窗
    const [lon, lat] = toLonLat(evt.coordinate);
    mapPopup.value = { lon: lon.toFixed(6), lat: lat.toFixed(6), zoom: zoom.value, resolution: resolution.value };
    mapPopupStyle.value = { left: evt.pixel[0] + 20 + 'px', top: evt.pixel[1] + 20 + 'px' };
  });
  // 双击添加点标记
  map.value.on('dblclick', (evt) => {
    const [lon, lat] = toLonLat(evt.coordinate);
    addPoint(lon, lat);
    // 自动弹窗
    nextTick(() => {
      pointPopup.value = { id: pointId-1, lon: lon.toFixed(6), lat: lat.toFixed(6) };
      pointPopupStyle.value = { left: evt.pixel[0] + 20 + 'px', top: evt.pixel[1] + 20 + 'px' };
    });
    evt.preventDefault();
  });
  // 框选
  dragBox.value = new DragBox({ condition: platformModifierKeyOnly });
  map.value.addInteraction(dragBox.value);
  dragBox.value.on('boxend', (e) => {
    const extent = dragBox.value.getGeometry().getExtent();
    const sw = toLonLat([extent[0], extent[1]]);
    const ne = toLonLat([extent[2], extent[3]]);
    boxInfo.value = { sw: `${sw[0].toFixed(6)}, ${sw[1].toFixed(6)}`, ne: `${ne[0].toFixed(6)}, ${ne[1].toFixed(6)}` };
    boxPopupStyle.value = { left: e.target.box_.endPixel_[0] + 20 + 'px', top: e.target.box_.endPixel_[1] + 20 + 'px' };
  });
  // 右键菜单
  mapContainer.value.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.value = { visible: true, style: { left: e.clientX + 'px', top: e.clientY + 'px' }};
  });
});

onUnmounted(() => {
  if (map.value) map.value.dispose();
});
</script>

<style scoped>
.ol-tutorial-demo-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.map {
  width: 100%;
  height: 100%;
}
.statusbar {
  position: absolute;
  left: 20px;
  bottom: 20px;
  background: rgba(255,255,255,0.95);
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 1rem;
  color: #1a237e;
  display: flex;
  gap: 18px;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.popup {
  position: absolute;
  min-width: 180px;
  background: #fffbe7;
  border: 1px solid #ffe082;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  z-index: 20;
  color: #795548;
}
.close-btn {
  margin-top: 10px;
  background: #ffc107;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.close-btn:hover {
  background: #ff9800;
}
.context-menu {
  position: absolute;
  z-index: 30;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 140px;
  font-size: 1rem;
}
.context-menu li {
  padding: 12px 18px;
  cursor: pointer;
  color: #1976d2;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}
.context-menu li:last-child {
  border-bottom: none;
}
.context-menu li:hover {
  background: #e3f2fd;
}
</style>