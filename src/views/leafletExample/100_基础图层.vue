<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import carIconUrl from "./imgs/car.svg";

const mapContainer = ref(null);
let map = null;
let markerLayerGroup = null;
let shapeLayerGroup = null;
let geojsonLayerGroup = null;

// 自定义图标定义
const customIcon = L.icon({
  iconUrl: carIconUrl,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// 示例 GeoJSON 数据
const geojsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "北京故宫",
        popupContent: "这是故宫博物院，中国明清两代的皇家宫殿。",
      },
      geometry: {
        type: "Point",
        coordinates: [116.397972, 39.916042],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "北京二环路",
        style: {
          color: "#ff7800",
          weight: 5,
          opacity: 0.65,
        },
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [39.92, 116.36],
          [39.93, 116.38],
          [39.92, 116.4],
          [39.9, 116.42],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "北京公园",
        style: {
          color: "#0000ff",
          weight: 2,
          opacity: 0.8,
          fillColor: "#00ff00",
          fillOpacity: 0.5,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.45, 39.9],
            [116.47, 39.9],
            [116.47, 39.88],
            [116.45, 39.88],
            [116.45, 39.9],
          ],
        ],
      },
    },
  ],
};

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  // 初始化地图
  map = L.map(mapContainer.value).setView(initialView, initialZoom);

  // 添加高德地图瓦片图层
  L.tileLayer(
    "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    },
  ).addTo(map);

  // 初始化图层组
  markerLayerGroup = L.layerGroup().addTo(map);
  shapeLayerGroup = L.layerGroup().addTo(map);
  geojsonLayerGroup = L.layerGroup().addTo(map);

  // 添加标记点
  L.marker([39.909186, 116.387479], { icon: customIcon })
    .bindPopup("<b>自定义图标标记</b>")
    .addTo(markerLayerGroup);
  L.marker([39.92, 116.42])
    .bindPopup("<b>另一个标记点</b>")
    .addTo(markerLayerGroup);

  // 添加折线
  const latlngsPolyline = [
    [39.9, 116.35],
    [39.95, 116.4],
    [39.9, 116.45],
  ];
  L.polyline(latlngsPolyline, { color: "red" }).addTo(shapeLayerGroup);

  // 添加多边形
  const latlngsPolygon = [
    [39.88, 116.38],
    [39.88, 116.42],
    [39.85, 116.42],
    [39.85, 116.38],
  ];
  L.polygon(latlngsPolygon, {
    color: "blue",
    fillColor: "#f03",
    fillOpacity: 0.5,
  }).addTo(shapeLayerGroup);

  // 添加 GeoJSON 数据
  L.geoJSON(geojsonData, {
    onEachFeature: function (feature, layer) {
      if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
      }
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });
    },
    style: function (feature) {
      return feature.properties && feature.properties.style
        ? feature.properties.style
        : {};
    },
  }).addTo(geojsonLayerGroup);
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
