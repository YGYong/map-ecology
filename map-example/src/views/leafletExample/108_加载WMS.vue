<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

let map = null;
let wmsLayer = null;

const wmsUrl = "https://ows.terrestris.de/osm/service"; // 示例公共 WMS 服务
const wmsLayers = "OSM-WMS"; // 示例图层名称

const initialView = [51.1657, 10.4515]; // 德国中心，因为示例WMS服务可能覆盖欧洲
const initialZoom = 7;

const mapContainer = ref(null);

onMounted(() => {
  map = L.map(mapContainer.value).setView(initialView, initialZoom);

  // 创建 WMS 图层
  wmsLayer = L.tileLayer
    .wms(wmsUrl, {
      layers: wmsLayers, // WMS 服务中的图层名称
      format: "image/png", // 图像格式
      transparent: true, // 是否透明
      version: "1.1.1", // WMS 版本
      attribution: "terrestris GmbH & Co. KG", // 归属信息
    })
    .addTo(map);
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
