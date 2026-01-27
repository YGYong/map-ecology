<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>地图截图/导出</h2>
      <p>点击按钮将当前地图视图导出为PNG图片。</p>
      <button
        @click="takeScreenshot"
        :disabled="isCapturing"
        class="action-button screenshot-button"
      >
        {{ isCapturing ? "正在截图..." : "截取地图" }}
      </button>
      <p
        v-if="screenshotMessage"
        :class="{
          'success-text': !screenshotError,
          'error-text': screenshotError,
        }"
      >
        {{ screenshotMessage }}
      </p>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-screenshot" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import leafletImage from "leaflet-image"; // 引入截图插件

let map = null;
const isCapturing = ref(false);
const screenshotMessage = ref("");
const screenshotError = ref(false);

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map("map-screenshot").setView(initialView, initialZoom);

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

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
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

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
    screenshotMessage.value = "";
    screenshotError.value = false;
  }
};
</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  font-family: sans-serif;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .map-wrapper {
    flex-direction: row;
  }
}

.control-panel {
  flex-shrink: 0;
  width: 100%;
  background-color: #f8f8f8;
  border-right: 1px solid #eee;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: #333;
}

@media (min-width: 768px) {
  .control-panel {
    width: 280px;
    height: 100%;
  }
}

.control-panel h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2em;
}

.info-display {
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  color: #495057;
}

.info-display p {
  margin: 5px 0;
  font-size: 0.95em;
}

.map-container {
  flex-grow: 1;
  height: 100%;
  min-height: 300px;
  background-color: #e0e0e0;
}

.action-button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.action-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.screenshot-button {
  background-color: #007bff; /* 灰色 */
  color: white;
}

.screenshot-button:hover:not(:disabled) {
  background-color: #5a6268;
}

.reset-button {
  background-color: #007bff;
  color: white;
  margin-top: auto;
}

.reset-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.reset-button:active:not(:disabled) {
  background-color: #004085;
}

.success-text {
  color: #28a745;
  font-weight: bold;
}

.error-text {
  color: #dc3545;
  font-weight: bold;
}
</style>
