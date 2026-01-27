<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>地图图层控制</h2>
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showMarkers" />
          显示标记点
        </label>
        <label>
          <input type="checkbox" v-model="showShapes" />
          显示绘制图形
        </label>
        <label>
          <input type="checkbox" v-model="showGeoJSON" />
          显示 GeoJSON 数据
        </label>
      </div>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="comprehensive-map" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

let map = null;
let markerLayerGroup = null;
let shapeLayerGroup = null;
let geojsonLayerGroup = null;

const showMarkers = ref(true);
const showShapes = ref(true);
const showGeoJSON = ref(true);

// 自定义图标定义
const customIcon = L.icon({
  iconUrl: "/src/assets/car.png",
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
  map = L.map("comprehensive-map").setView(initialView, initialZoom);

  // 添加高德地图瓦片图层
  L.tileLayer(
    "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    }
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

  // 监听图层显示状态的变化
  watch(showMarkers, (newValue) => {
    if (newValue) {
      map.addLayer(markerLayerGroup);
    } else {
      map.removeLayer(markerLayerGroup);
    }
  });

  watch(showShapes, (newValue) => {
    if (newValue) {
      map.addLayer(shapeLayerGroup);
    } else {
      map.removeLayer(shapeLayerGroup);
    }
  });

  watch(showGeoJSON, (newValue) => {
    if (newValue) {
      map.addLayer(geojsonLayerGroup);
    } else {
      map.removeLayer(geojsonLayerGroup);
    }
  });
});

onUnmounted(() => {
  if (map) {
    map.remove(); // 组件卸载时销毁地图实例
    map = null;
  }
});

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
  }
};
</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column; /* 默认垂直布局，小屏幕下控制面板在地图上方 */
  height: 100vh; /* 占据整个视口高度 */
  width: 100vw;
  font-family: sans-serif;
  box-sizing: border-box; /* 确保内边距和边框包含在宽度和高度内 */
}

@media (min-width: 768px) {
  .map-wrapper {
    flex-direction: row; /* 大屏幕下水平布局，控制面板在左侧 */
  }
}

.control-panel {
  flex-shrink: 0; /* 不压缩 */
  width: 100%; /* 小屏幕下占满宽度 */
  background-color: #f8f8f8;
  border-right: 1px solid #eee;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (min-width: 768px) {
  .control-panel {
    width: 250px; /* 大屏幕下固定宽度 */
    height: 100%; /* 占据整个高度 */
  }
}

.control-panel h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2em;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #555;
}

.control-group input[type="checkbox"] {
  margin-right: 8px;
  transform: scale(1.2); /* 放大复选框 */
}

.map-container {
  flex-grow: 1; /* 占据剩余空间 */
  height: 100%; /* 确保地图容器在flex布局中占据高度 */
  min-height: 300px; /* 最小高度，防止在小屏幕下地图过小 */
  background-color: #e0e0e0; /* 地图加载前的背景色 */
}

.reset-button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  margin-top: auto; /* 将按钮推到底部 */
}

.reset-button:hover {
  background-color: #0056b3;
}

.reset-button:active {
  background-color: #004085;
}
</style>
