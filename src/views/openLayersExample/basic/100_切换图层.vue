<template>
  <div ref="mapContainer" class="map-container"></div>
  <div class="map-controls">
    <h3>图层控制</h3>
    <div v-for="layer in layers" :key="layer.id" class="layer-item" @click=" setActiveLayer(layer.id)">
      <div class="layer-info">
        <div class="layer-name">{{ layer.name }}</div>
        <div class="layer-desc">{{ layer.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer } from "ol/layer";
import { XYZ } from "ol/source";
import { defaults as defaultControls, FullScreen, ScaleLine } from "ol/control";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";

// 地图实例
const map = ref(null);
const mapContainer = ref(null);

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
  }
]);

// 当前激活的图层
const activeLayer = ref("webrd");

// 初始化地图
onMounted(() => {
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

  // 创建地图
  map.value = new Map({
    target: mapContainer.value,
    layers: [webstLayer, webrdLayer], // 后面的图层覆盖前面的图层
    view: new View({
      center: fromLonLat([116.4, 39.9]), // 北京
      zoom: 10,
    }),
    controls: defaultControls().extend([new FullScreen(), new ScaleLine()]),
  });
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
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
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
  height: 200px;
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
</style>
