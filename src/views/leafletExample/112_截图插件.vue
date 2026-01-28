<template>
  <div class="control-panel">
    <h2>地图截图/导出</h2>
    <p>点击按钮将当前地图视图导出为PNG图片。</p>
    <button @click="takeScreenshot" class="screenshot-button">
      截取地图 </button>
  </div>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
/**
 * 依赖下载
 * npm install leaflet-image
 */
import { ref, onMounted } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import leafletImage from "leaflet-image"; // 引入截图插件

let map = null;
const isCapturing = ref(false);
const screenshotMessage = ref("");
const screenshotError = ref(false);

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

const mapContainer = ref(null);
onMounted(() => {
  map = L.map(mapContainer.value).setView(initialView, initialZoom);

  L.tileLayer(
    "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
      // 如果遇到CORS问题，可以尝试添加 crossOrigin: true，但需要服务器支持
      // crossOrigin: true
    }
  ).addTo(map);
});

const takeScreenshot = () => {
  if (!map) return;

  isCapturing.value = true;
  screenshotMessage.value = "正在生成图片...";
  screenshotError.value = false;

  leafletImage(map, (err, canvas) => {
    isCapturing.value = false;
    if (err) {
      console.error("截图失败:", err);
      screenshotMessage.value = `截图失败: ${err.message}. 请检查控制台。`;
      screenshotError.value = true;
      return;
    }

    // 将 canvas 转换为图片并下载
    const imgUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = "leaflet-map-screenshot.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    screenshotMessage.value = "截图成功并已下载！";
    screenshotError.value = false;
    console.log("地图截图成功！");
  });
};
</script>

<style scoped>
.control-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  width: 260px;
  background-color: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #333;
}

.map-container {
  width: 100%;
  height: 100%;
}

.screenshot-button {
  background-color: #28a745;
  color: white;
  height: 40px;
  border-radius: 8px;
}
</style>
