<template>
  <div>
    <div id="map" class="map"></div>
    <input id="swipe" type="range" style="width: 100%" />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import { getRenderPixel } from "ol/render.js";
import { XYZ } from "ol/source";
import "ol/ol.css";

const osm = new TileLayer({
  source: new XYZ({
    // 高德地图瓦片服务地址
    url: "https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}",
  }),
});

const aerial = new TileLayer({
  source: new XYZ({
    // 设置路网图层
    url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
  }),
});

onMounted(() => {
  const map = new Map({
    layers: [osm, aerial],
    target: "map",
    view: new View({
      center: [116.4074, 39.9042], // 北京市中心经纬度
      zoom: 10,
      projection: "EPSG:4326", // 默认使用球面墨卡托投影(EPSG:3857)，需要设置为WGS 84(EPSG:4326)经纬度
    }),
  });

  const swipe = document.getElementById("swipe");

  aerial.on("prerender", function (event) {
    const ctx = event.context;
    const mapSize = map.getSize();
    const width = mapSize[0] * (Number(swipe.value) / 100);
    const tl = getRenderPixel(event, [width, 0]);
    const tr = getRenderPixel(event, [mapSize[0], 0]);
    const bl = getRenderPixel(event, [width, mapSize[1]]);
    const br = getRenderPixel(event, mapSize);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tl[0], tl[1]);
    ctx.lineTo(bl[0], bl[1]);
    ctx.lineTo(br[0], br[1]);
    ctx.lineTo(tr[0], tr[1]);
    ctx.closePath();
    ctx.clip();
  });

  aerial.on("postrender", function (event) {
    const ctx = event.context;
    ctx.restore();
  });

  swipe.addEventListener("input", function () {
    map.render();
  });
});
</script>

<style scoped>
.map {
  width: 100vw;
  height: 90vh;
}
</style>
