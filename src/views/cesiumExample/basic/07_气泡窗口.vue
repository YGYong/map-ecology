<template>
  <div class="container">
    <div ref="cesiumContainer" class="container-map"></div>
    <div ref="popup" class="popup-window" role="dialog" aria-label="点位信息">
      <div class="popup-card">
        <div class="popup-header">
          <div class="popup-title">
            <span class="popup-dot"></span>
            <span class="popup-title-text">上海 · 观测点</span>
          </div>
          <div class="popup-badges">
            <span class="popup-badge popup-badge-green">在线</span>
            <span class="popup-badge popup-badge-blue">影像</span>
          </div>
        </div>
        <div class="popup-body">
          <div class="popup-row">
            <div class="popup-label">坐标</div>
            <div class="popup-value">
              <span class="popup-mono">Lon</span>
              <span class="popup-num" data-field="lon">121.4737</span>
              <span class="popup-sep">/</span>
              <span class="popup-mono">Lat</span>
              <span class="popup-num" data-field="lat">31.2304</span>
            </div>
          </div>
          <div class="popup-row">
            <div class="popup-label">相机高度</div>
            <div class="popup-value">
              <span class="popup-num" data-field="cameraHeight">5000</span>
              <span class="popup-unit">m</span>
            </div>
          </div>
          <div class="popup-row">
            <div class="popup-label">地形/水面</div>
            <div class="popup-value" data-field="terrainStatus">未启用</div>
          </div>
          <div class="popup-row">
            <div class="popup-label">更新时间</div>
            <div class="popup-value popup-mono" data-field="time">--:--:--</div>
          </div>
          <div class="popup-divider"></div>
          <div class="popup-desc">
            这里展示一个更接近产品化的弹窗：包含点位状态、经纬度、相机高度、地形开关与更新时间。你可以在此处继续扩展为设备信息、告警、图片预览等内容。
          </div>
        </div>
      </div>
      <div class="popup-tail" aria-hidden="true"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";

const cesiumContainer = ref(null);
const popup = ref(null);
let viewer = null;
const popupFields = {
  lon: null,
  lat: null,
  cameraHeight: null,
  terrainStatus: null,
  time: null,
};

// 天地图TOKEN
const token = window.TIANDITU_TOKEN;

onMounted(() => {
  // 初始化Viewer
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    geocoder: false, // 关闭地理编码搜索
    homeButton: false, // 关闭主页按钮
    sceneModePicker: false, // 关闭场景模式选择器
    baseLayerPicker: false, // 关闭底图选择器
    navigationHelpButton: false, // 关闭导航帮助
    animation: false, // 关闭动画控件
    timeline: false, // 关闭时间轴
    fullscreenButton: false, // 关闭全屏按钮
    baseLayer: false, // 关闭默认地图
  });

  // 清空logo
  viewer.cesiumWidget.creditContainer.style.display = "none";

  // 设置相机视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(121.4737, 31.2304, 5000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
  });

  const anchorLon = 121.4737;
  const anchorLat = 31.2304;
  const anchorPosition = Cesium.Cartesian3.fromDegrees(anchorLon, anchorLat, 0);
  const scratch = new Cesium.Cartesian2();

  if (popup.value) {
    popupFields.lon = popup.value.querySelector('[data-field="lon"]');
    popupFields.lat = popup.value.querySelector('[data-field="lat"]');
    popupFields.cameraHeight = popup.value.querySelector(
      '[data-field="cameraHeight"]',
    );
    popupFields.terrainStatus = popup.value.querySelector(
      '[data-field="terrainStatus"]',
    );
    popupFields.time = popup.value.querySelector('[data-field="time"]');
  }

  // 添加preRender事件，使窗口位置保持不变
  viewer.scene.preRender.addEventListener(function () {
    const htmlPop = viewer.scene.cartesianToCanvasCoordinates(
      anchorPosition,
      scratch,
    );
    if (!popup.value) return;

    if (!htmlPop) {
      popup.value.style.display = "none";
      return;
    }

    popup.value.style.display = "";
    popup.value.style.left = `${htmlPop.x}px`;
    popup.value.style.top = `${htmlPop.y}px`;

    if (popupFields.lon) popupFields.lon.textContent = anchorLon.toFixed(4);
    if (popupFields.lat) popupFields.lat.textContent = anchorLat.toFixed(4);

    const cameraHeight = Math.max(0, viewer.camera.positionCartographic.height);
    if (popupFields.cameraHeight) {
      popupFields.cameraHeight.textContent = Math.round(cameraHeight).toString();
    }

    const hasTerrain =
      viewer.terrainProvider &&
      viewer.terrainProvider.constructor &&
      viewer.terrainProvider.constructor.name !== "EllipsoidTerrainProvider";
    if (popupFields.terrainStatus) {
      popupFields.terrainStatus.textContent = hasTerrain ? "已启用" : "未启用";
    }

    const now = new Date();
    if (popupFields.time) {
      popupFields.time.textContent = now.toLocaleTimeString();
    }
  });

  initMap();
});

// 加载天地图
const initMap = () => {
  // 以下为天地图及天地图标注加载
  const tiandituProvider = new Cesium.WebMapTileServiceImageryProvider({
    url:
      "http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
      token,
    layer: "img",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "w",
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"], // 子域名
    maximumLevel: 18,
    credit: new Cesium.Credit("天地图影像"),
  });

  // 添加地理标注
  const labelProvider = new Cesium.WebMapTileServiceImageryProvider({
    url:
      "http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&tileMatrix={TileMatrix}&tileRow={TileRow}&tileCol={TileCol}&style=default&format=tiles&tk=" +
      token,
    layer: "img",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "w",
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"], // 子域名轮询
    maximumLevel: 18,
    credit: new Cesium.Credit("天地图影像"),
  });

  // 天地图影像添加到viewer实例的影像图层集合中
  viewer.imageryLayers.addImageryProvider(tiandituProvider);
  // 天地图地理标注（后添加的会覆盖前面的）
  viewer.imageryLayers.addImageryProvider(labelProvider);
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.container-map {
  width: 100%;
  height: 100%;
}

.popup-window {
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -100%);
  width: 320px;
  z-index: 10;
}

.popup-card {
  color: rgba(255, 255, 255, 0.92);
  background: linear-gradient(180deg,
      rgba(22, 26, 34, 0.92) 0%,
      rgba(16, 18, 24, 0.88) 100%);
  border: 1px solid rgba(124, 205, 255, 0.22);
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(0, 0, 0, 0.25) inset;
  border-radius: 14px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(90deg,
      rgba(124, 205, 255, 0.18) 0%,
      rgba(153, 120, 255, 0.14) 45%,
      rgba(0, 0, 0, 0) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.popup-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.popup-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #a8ffce, #00c97f);
  box-shadow: 0 0 0 4px rgba(0, 201, 127, 0.15);
}

.popup-title-text {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.popup-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.popup-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}

.popup-badge-green {
  border-color: rgba(0, 201, 127, 0.35);
  background: rgba(0, 201, 127, 0.12);
}

.popup-badge-blue {
  border-color: rgba(124, 205, 255, 0.35);
  background: rgba(124, 205, 255, 0.12);
}

.popup-body {
  padding: 12px 14px 14px;
  font-size: 13px;
}

.popup-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.popup-label {
  color: rgba(255, 255, 255, 0.62);
}

.popup-value {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.popup-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  color: rgba(255, 255, 255, 0.7);
}

.popup-num {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.92);
}

.popup-sep {
  color: rgba(255, 255, 255, 0.35);
  margin: 0 2px;
}

.popup-unit {
  color: rgba(255, 255, 255, 0.6);
}

.popup-divider {
  height: 1px;
  margin: 10px 0 10px;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.12) 25%,
      rgba(255, 255, 255, 0.12) 75%,
      rgba(255, 255, 255, 0) 100%);
}

.popup-desc {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.55;
}

.popup-tail {
  position: absolute;
  left: 50%;
  bottom: -10px;
  width: 18px;
  height: 18px;
  transform: translateX(-50%) rotate(45deg);
  background: linear-gradient(135deg,
      rgba(16, 18, 24, 0.9) 0%,
      rgba(16, 18, 24, 0.65) 100%);
  border-right: 1px solid rgba(124, 205, 255, 0.18);
  border-bottom: 1px solid rgba(124, 205, 255, 0.18);
  box-shadow: 8px 12px 22px rgba(0, 0, 0, 0.35);
}
</style>
