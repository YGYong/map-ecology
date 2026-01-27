<template>
  <div ref="mapContainer" id="map"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import GeoJSON from "ol/format/GeoJSON.js";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import "ol/ol.css";
import Select from "ol/interaction/Select.js";
import { pointerMove } from "ol/events/condition";
const mapContainer = ref(null);
let map = null;
const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 5,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});
onMounted(async () => {
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });

  // 加载jeojson数据，给每个省添加随机色
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      url: "https://geojson.cn/api/china/1.6.2/china.json", // 替换为你的GeoJSON数据URL
      format: new GeoJSON(),
    }),
    style: () => {
      return new Style({
        fill: new Fill({
          color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256
          )}, ${Math.floor(Math.random() * 256)}, 0.6)`, // 随机颜色
        }),
        stroke: new Stroke({
          color: "#000",
          width: 1,
        }),
      });
    },
  });
  map.addLayer(vectorLayer);

  // 选中省份变色
  const select = new Select({
    condition: pointerMove, // 默认为选中，当前为触摸
  });
  map.addInteraction(select);
  select.on("select", (e) => {
    console.log(e);
    e.selected[0] &&
      e.selected[0].setStyle(
        new Style({
          fill: new Fill({
            color: "rgba(255, 0, 0, 0.8)",
          }),
        })
      );
  });
});
</script>
<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
