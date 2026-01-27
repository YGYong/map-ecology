<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <h2>外部数据集成 (模拟 API)</h2>
      <p>点击按钮从模拟 API 加载数据并在地图上显示。</p>
      <div class="info-display">
        <p>数据加载状态: <strong>{{ dataStatus }}</strong></p>
        <p v-if="dataPointsCount !== null">已加载数据点: <strong>{{ dataPointsCount }}</strong></p>
        <p v-if="dataError" class="error-text">{{ dataError }}</p>
      </div>
      <button @click="loadData" :disabled="isLoading" class="action-button load-button">
        {{ isLoading ? '加载中...' : '加载数据' }}
      </button>
      <button @click="clearData" :disabled="dataPointsCount === 0" class="action-button clear-button">清除数据</button>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-external-data" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let map = null;
let dataLayerGroup = null;

const isLoading = ref(false);
const dataStatus = ref('未加载');
const dataPointsCount = ref(null);
const dataError = ref(null);

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map('map-external-data').setView(initialView, initialZoom);

  L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>'
  }).addTo(map);

  dataLayerGroup = L.layerGroup().addTo(map);
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    dataLayerGroup = null;
  }
});

// 模拟 API 请求
const fetchMockData = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const points = [];
      for (let i = 0; i < 50; i++) {
        const lat = 39.909186 + (Math.random() - 0.5) * 0.2;
        const lng = 116.397479 + (Math.random() - 0.5) * 0.2;
        points.push({
          id: i + 1,
          name: `兴趣点 ${i + 1}`,
          coordinates: [lat, lng],
          description: `这是关于兴趣点 ${i + 1} 的详细信息。`
        });
      }
      resolve(points);
    }, 1500); // 模拟网络延迟
  });
};

const loadData = async () => {
  isLoading.value = true;
  dataStatus.value = '加载中...';
  dataError.value = null;
  clearData(); // 清除旧数据

  try {
    const data = await fetchMockData();
    data.forEach(point => {
      L.marker(point.coordinates)
        .bindPopup(`<b>${point.name}</b><br>${point.description}`)
        .addTo(dataLayerGroup);
    });
    dataPointsCount.value = data.length;
    dataStatus.value = '加载成功';
    console.log('数据加载成功:', data);
    // 调整地图视图以适应所有加载的点
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map(p => p.coordinates));
      map.fitBounds(bounds.pad(0.1));
    }
  } catch (e) {
    dataError.value = `数据加载失败: ${e.message}`;
    dataStatus.value = '加载失败';
    console.error('数据加载失败:', e);
  } finally {
    isLoading.value = false;
  }
};

const clearData = () => {
  if (dataLayerGroup) {
    dataLayerGroup.clearLayers();
  }
  dataPointsCount.value = 0;
  dataStatus.value = '已清除';
  dataError.value = null;
  console.log('数据已清除。');
};

const resetMapView = () => {
  if (map) {
    map.setView(initialView, initialZoom);
    clearData();
  }
};
</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
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
  padding: 20px;
  background-color: #f8f8f8;
  border-right: 1px solid #eee;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
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

.info-display strong {
  color: #007bff;
}

.error-text {
  color: #dc3545;
  font-weight: bold;
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

.load-button {
  background-color: #28a745; /* 绿色 */
  color: white;
}

.load-button:hover:not(:disabled) {
  background-color: #218838;
}

.clear-button {
  background-color: #dc3545;
  color: white;
}

.clear-button:hover:not(:disabled) {
  background-color: #c82333;
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
</style>
