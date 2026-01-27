<template>
  <div ref="mapContainer" id="map"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import GeoJSON from "ol/format/GeoJSON.js";
import Style from "ol/style/Style.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import CircleStyle from "ol/style/Circle.js";
import MultiPoint from "ol/geom/MultiPoint.js";

import "ol/ol.css";
const mapContainer = ref(null);
let map = null;
const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 12.5,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
});
onMounted(async () => {
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });
  polygonStyle();
});

// 渲染样式
const polygonStyle = () => {
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [116.4074, 39.9042],
              [116.4174, 39.9042],
              [116.4174, 39.9142],
              [116.4074, 39.9142],
              [116.4074, 39.9042],
            ],
          ],
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [116.4374, 39.9542],
              [116.4474, 39.9542],
              [116.4474, 39.9642],
              [116.4374, 39.9642],
              [116.4374, 39.9542],
            ],
          ],
        },
      },
    ],
  };

  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geojson),
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: [
      new Style({
        stroke: new Stroke({
          color: "red",
          width: 3,
        }),
        fill: new Fill({
          color: "rgba(0, 0, 255, 0.5)",
        }),
      }),
      new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: "orange",
          }),
        }),
        geometry: function (feature) {
          const coordinates = feature.getGeometry().getCoordinates()[0];
          return new MultiPoint(coordinates);
        },
      }),
    ],
  });
  map.addLayer(vectorLayer);
};
</script>
<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
