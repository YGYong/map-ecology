<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let map = null;

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

const mapContainer = ref(null);

onMounted(() => {
  map = L.map(mapContainer.value).setView(initialView, initialZoom);

  L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>'
  }).addTo(map);

  // 1. 自定义弹出窗口 (Popup)
  const customPopupContent = `
    <div class="custom-popup">
      <h3>北京故宫</h3>
      <p>中国明清两代的皇家宫殿，世界文化遗产。</p>
      <p class="popup-link">了解更多</p>
      <button class="popup-button" onclick="alert('您点击了故宫按钮！')">点击我</button>
    </div>
  `;

  L.marker([39.916042, 116.397972]) // 故宫坐标
    .addTo(map)
    .bindPopup(customPopupContent, {
      maxWidth: 250, // 最大宽度
      closeButton: true, // 显示关闭按钮
      className: 'my-custom-popup-class' // 自定义CSS类
    })
    .openPopup(); // 默认打开
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

/* 自定义弹出窗口样式 */
.my-custom-popup-class .leaflet-popup-content-wrapper {
  background: #fff;
  color: #333;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  padding: 15px;
}

.my-custom-popup-class .leaflet-popup-tip {
  background: #fff;
}

.custom-popup h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #007bff;
  font-size: 1.1em;
}

.custom-popup p {
  margin-bottom: 10px;
  line-height: 1.4;
}

.custom-popup .popup-link {
  display: inline-block;
  margin-right: 10px;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.custom-popup .popup-link:hover {
  text-decoration: underline;
}

.custom-popup .popup-button {
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s ease;
}

.custom-popup .popup-button:hover {
  background-color: #218838;
}
</style>
