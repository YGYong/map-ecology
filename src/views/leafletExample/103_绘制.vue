<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
/**
 * 依赖下载
 * npm install leaflet-draw
 */
import { ref, onMounted } from "vue";
// 需要使用cdn引入

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css"; // Leaflet.draw 插件的CSS
import L from "leaflet";
import "leaflet-draw"; // 引入 Leaflet.draw 插件JS

let map = null;
let drawnItems = null; // 用于存储绘制的图层
let drawControl = null; // 绘制工具控制器

const mapContainer = ref(null);
const lastDrawnType = ref("");
const drawnItemsCount = ref(0);

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map(mapContainer.value).setView(initialView, initialZoom);

  L.tileLayer(
    "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    }
  ).addTo(map);

  // 初始化绘制图层组，用于存储用户绘制的图形
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // 初始化绘制工具控制器
  drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems, // 指定可编辑的图层组
      remove: true, // 允许删除
    },
    draw: {
      polyline: {
        shapeOptions: {
          color: "#f357a1",
          weight: 10,
        },
      },
      polygon: {
        allowIntersection: false,
        drawError: {
          color: "#e1e100",
          message: "<strong>Oh snap!<strong> you can't draw that!",
        },
        shapeOptions: {
          color: "#bada55",
        },
      },
      circle: {
        shapeOptions: {
          weight: 5,
          color: "#000",
        },
      },
      rectangle: {
        shapeOptions: {
          clickable: false,
        },
      },
      marker: true,
    },
  });
  map.addControl(drawControl);

  // 监听绘制完成事件
  map.on(L.Draw.Event.CREATED, (e) => {
    const type = e.layerType;
    const layer = e.layer;

    // 将绘制的图层添加到 drawnItems 图层组
    drawnItems.addLayer(layer);

    lastDrawnType.value = type;
    drawnItemsCount.value = drawnItems.getLayers().length;
  });

  // 监听删除事件
  map.on(L.Draw.Event.DELETED, (e) => {
    drawnItemsCount.value = drawnItems.getLayers().length;
    console.log("图形被删除:", e.layers);
  });
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
