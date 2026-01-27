<template>
  <div ref="mapContainer" id="map"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Style from "ol/style/Style.js";
import Icon from "ol/style/Icon.js";
import "ol/ol.css";
// 引入gif动图
import gifUrl from "./assets/globe.gif";
const mapContainer = ref(null);
let map = null;
const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 10,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
});
onMounted(() => {
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          // 高德地图瓦片服务地址
          url: "https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });
  loadGif();
});
// 加载gif
const loadGif = () => {
  const iconFeature = new Feature({
    geometry: new Point([116.4074, 39.9042]),
  });

  const vectorSource = new VectorSource({
    features: [iconFeature],
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  map.addLayer(vectorLayer);

  // 使用gifler加载gif
  const gif = gifler(gifUrl);
  gif.frames(
    document.createElement("canvas"),
    function (ctx, frame) {
      if (!iconFeature.getStyle()) {
        iconFeature.setStyle(
          new Style({
            image: new Icon({
              img: ctx.canvas,
              opacity: 0.8,
            }),
          })
        );
      }
      ctx.clearRect(0, 0, frame.width, frame.height);
      ctx.drawImage(frame.buffer, frame.x, frame.y);
      map.render();
    },
    true
  );

  // 鼠标悬停时显示手型
  map.on("pointermove", function (e) {
    const hit = map.hasFeatureAtPixel(e.pixel);
    map.getTargetElement().style.cursor = hit ? "pointer" : "";
  });
};
</script>
<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
