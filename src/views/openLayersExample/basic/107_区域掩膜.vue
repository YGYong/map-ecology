<template>
  <div ref="mapContainer" id="map"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import "ol/ol.css";

const mapContainer = ref(null);
let map = null;
let canvas = null;
let ctx = null;
let jiangsuPolygons = null;
let loadJiangsuPromise = null;

const view = new View({
  center: [118.7784, 32.0647], // 南京市中心经纬度
  zoom: 7,
  projection: "EPSG:4326",
});

onMounted(async () => {
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });

  // 创建canvas
  const { offsetWidth, offsetHeight } = map.getViewport();
  canvas = document.createElement("canvas");
  canvas.width = offsetWidth;
  canvas.height = offsetHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0px";
  canvas.style.left = "0px";
  canvas.style.zIndex = "1";
  ctx = canvas.getContext("2d");
  map.getViewport().appendChild(canvas);

  // 注册map事件
  map.on("postrender", () => {
    addMask();
  });
});

// 添加区域掩膜
const addMask = async (params) => {
  const { fillStyle, strokeStyle, lineWidth } = {
    fillStyle: "rgba(255,255,255,0.8)",
    strokeStyle: "#f00",
    lineWidth: 3,
    ...params,
  };

  if (!jiangsuPolygons) {
    if (!loadJiangsuPromise) {
      loadJiangsuPromise = fetch("/models/jiangsu.json")
        .then((res) => res.json())
        .then((json) => {
          jiangsuPolygons = json?.features?.[0]?.geometry?.coordinates || null;
        })
        .catch(() => {
          jiangsuPolygons = null;
        });
    }
    await loadJiangsuPromise;
  }
  if (!jiangsuPolygons) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. 绘制整个画布为半透明白色
  ctx.fillStyle = fillStyle;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. 使用组合模式清除多边形区域
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,1)"; // 使用任意颜色，alpha=1确保完全清除

  // 绘制所有多边形（包括主区域和岛屿）
  jiangsuPolygons.forEach((polygon) => {
    const ring = polygon[0]; // 获取多边形外环
    const coords = ring.map((coord) => map.getPixelFromCoordinate(coord));

    ctx.beginPath();
    coords.forEach((coord, index) => {
      index === 0
        ? ctx.moveTo(coord[0], coord[1])
        : ctx.lineTo(coord[0], coord[1]);
    });
    ctx.closePath();
    ctx.fill();
  });

  // 3. 恢复组合模式并绘制边界
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;

  // 绘制所有多边形的边界
  jiangsuPolygons.forEach((polygon) => {
    const ring = polygon[0];
    const coords = ring.map((coord) => map.getPixelFromCoordinate(coord));

    ctx.beginPath();
    coords.forEach((coord, index) => {
      index === 0
        ? ctx.moveTo(coord[0], coord[1])
        : ctx.lineTo(coord[0], coord[1]);
    });
    ctx.closePath();
    ctx.stroke();
  });
};
</script>

<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
}
</style>
