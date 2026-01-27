<template>
  <div>
    <div ref="mapContainer" style="width: 100vw; height: 100vh"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mapContainer = ref(null);

onMounted(() => {
  // 初始化地图
  let map = L.map(mapContainer.value, {
    center: [39.904, 116.405], // 北京
    zoom: 9.5,
  });

  L.tileLayer(
    `https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}`
  ).addTo(map);
});
</script>
