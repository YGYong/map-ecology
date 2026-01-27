<template>
  <div class="map-wrapper">
    <div class="control-panel">
      <div class="info-display">
        <p>
          最近绘制的图形类型: <strong>{{ lastDrawnType || "无" }}</strong>
        </p>
        <p>
          绘制的图形数量: <strong>{{ drawnItemsCount }}</strong>
        </p>
      </div>
      <button @click="clearAllDrawings" class="action-button clear-button">
        清除所有绘制
      </button>
      <button @click="resetMapView" class="reset-button">重置地图视图</button>
    </div>
    <div id="map-drawing" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
// 需要使用cdn引入

// import "leaflet/dist/leaflet.css";
// import "leaflet-draw/dist/leaflet.draw.css"; // Leaflet.draw 插件的CSS
// import L from "leaflet";
// import "leaflet-draw"; // 引入 Leaflet.draw 插件JS

let map = null;
let drawnItems = null; // 用于存储绘制的图层
let drawControl = null; // 绘制工具控制器

const lastDrawnType = ref("");
const drawnItemsCount = ref(0);

const initialView = [39.909186, 116.397479];
const initialZoom = 12;

onMounted(() => {
  map = L.map("map-drawing").setView(initialView, initialZoom);

  L.tileLayer(
    "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    }
  ).addTo(map);

  // 初始化绘制图层组，用于存储用户绘制的图形
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // 初始化绘制工具控制器
  drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems, // 指定可编辑的图层组
      remove: true, // 允许删除
    },
    draw: {
      polyline: {
        shapeOptions: {
          color: "#f357a1",
          weight: 10,
        },
      },
      polygon: {
        allowIntersection: false, // Restricts shapes to simple polygons
        drawError: {
          color: "#e1e100", // Color the shape will turn when intersects
          message: "<strong>Oh snap!<strong> you can't draw that!", // Message that will show when intersect
        },
        shapeOptions: {
          color: "#bada55",
        },
      },
      circle: {
        shapeOptions: {
          weight: 5,
          color: "#000",
        },
      },
      rectangle: {
        shapeOptions: {
          clickable: false,
        },
      },
      marker: true,
    },
  });
  map.addControl(drawControl);

  // 监听绘制完成事件
  map.on(L.Draw.Event.CREATED, (e) => {
    const type = e.layerType;
    const layer = e.layer;

    // 将绘制的图层添加到 drawnItems 图层组
    drawnItems.addLayer(layer);

    lastDrawnType.value = type;
    drawnItemsCount.value = drawnItems.getLayers().length;

    // 打印绘制的GeoJSON数据
    console.log(`绘制了 ${type} 类型图形:`, layer.toGeoJSON());
  });

  // 监听删除事件
  map.on(L.Draw.Event.DELETED, (e) => {
    drawnItemsCount.value = drawnItems.getLayers().length;
    console.log("图形被删除:", e.layers);
  });
});

onUnmounted(() => {
  if (map) {
    map.off(L.Draw.Event.CREATED);
    map.off(L.Draw.Event.DELETED);
    map.removeControl(drawControl); // 移除绘制控制器
    map.remove();
    map = null;
    drawnItems = null;
    drawControl = null;
  }
});

const clearAllDrawings = () => {
  if (drawnItems) {
    drawnItems.clearLayers(); // 清除所有绘制的图层
    lastDrawnType.value = "";
    drawnItemsCount.value = 0;
    console.log("所有绘制已清除。");
  }
};

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

.control-panel {
  flex-shrink: 0;
  width: 100%;
  background-color: #f8f8f8;
  border-right: 1px solid #eee;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
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

.clear-button {
  background-color: #dc3545;
  color: white;
}

.clear-button:hover {
  background-color: #c82333;
}

.reset-button {
  background-color: #007bff;
  color: white;
  margin-top: auto; /* 将按钮推到底部 */
}

.reset-button:hover {
  background-color: #0056b3;
}

.reset-button:active {
  background-color: #004085;
}
</style>
