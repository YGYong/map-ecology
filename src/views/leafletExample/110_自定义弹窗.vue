<template>
  <div class="map-wrapper">
    <div id="map-custom-popup" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let map = null;

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map('map-custom-popup').setView(initialView, initialZoom);

  L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>'
  }).addTo(map);

  // 1. 自定义弹出窗口 (Popup)
  const customPopupContent = `
    <div class="custom-popup">
      <h3>北京故宫</h3>
      <img src="/src/assets/vue.svg" width="24" alt="故宫" style="border-radius: 4px; margin-bottom: 8px;">
      <p>中国明清两代的皇家宫殿，世界文化遗产。</p>
      <a href="https://www.dpm.org.cn/" target="_blank" class="popup-link">了解更多</a>
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

  // 2. 自定义工具提示 (Tooltip)
  const customTooltipContent = `
    <div class="custom-tooltip">
      <h4>天坛公园</h4>
      <p>世界文化遗产，明清两代皇帝祭天、祈谷的场所。</p>
    </div>
  `;

  L.circleMarker([39.8822, 116.4074], { // 天坛坐标
    radius: 8,
    fillColor: "#007bff",
    color: "#fff",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.7
  })
    .addTo(map)
    .bindTooltip(customTooltipContent, {
      permanent: false, // 鼠标悬停时显示，移开时隐藏
      direction: 'right', // 工具提示显示在标记点右侧
      offset: [10, 0], // 偏移量
      className: 'my-custom-tooltip-class' // 自定义CSS类
    });
});

onUnmounted(() => {
  if (map) {
    map.remove();
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

.map-container {
  flex-grow: 1;
  height: 100%;
  min-height: 300px;
  background-color: #e0e0e0;
}

/* 自定义弹出窗口样式 */
.my-custom-popup-class .leaflet-popup-content-wrapper {
  background: #fff;
  color: #333;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
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

/* 自定义工具提示样式 */
.my-custom-tooltip-class .leaflet-tooltip-content-wrapper {
  background: #333;
  color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  padding: 8px 12px;
  font-size: 0.9em;
  line-height: 1.3;
}

.my-custom-tooltip-class .leaflet-tooltip-tip {
  background: #333;
}

.custom-tooltip h4 {
  margin-top: 0;
  margin-bottom: 5px;
  color: #fff;
  font-size: 1em;
}

.custom-tooltip p {
  margin: 0;
}
</style>
