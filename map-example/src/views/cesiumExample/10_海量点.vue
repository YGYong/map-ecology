<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

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
  // 开启fps
  viewer.scene.debugShowFramesPerSecond = true;
  if (viewer.scene.postProcessStages?.fxaa) {
    viewer.scene.postProcessStages.fxaa.enabled = false;
  }
  initMap();

  const POINT_COUNT = 50000;
  const points = viewer.scene.primitives.add(
    new Cesium.PointPrimitiveCollection({
      blendOption: Cesium.BlendOption.OPAQUE, // 性能提升
    }),
  );
  const scaleByDistance = new Cesium.NearFarScalar(2000.0, 1.1, 20000000.0, 0.6);

  for (let i = 0; i < POINT_COUNT; i++) {
    const lon = 73 + Math.random() * (135 - 73);
    const lat = 18 + Math.random() * (54 - 18);

    points.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
      pixelSize: 6,
      color: Cesium.Color.fromHsl(Math.random(), 0.65, 0.5),
      scaleByDistance,
    });
  }

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(104.0, 35.0, 9000000),
  });
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
  // 天地图影像添加到viewer实例的影像图层集合中
  viewer.imageryLayers.addImageryProvider(tiandituProvider);
};
</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
