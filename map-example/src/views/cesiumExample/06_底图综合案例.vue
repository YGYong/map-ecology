<!-- 同时添加`WMTS`、`XYZ`、`单张图片`三种底图，通过切换选择器进行底图切换 -->
<template>
  <div class="map-switcher">
    <div class="map-buttons">
      <button @click="switchMap('tianditu')">天地图影像</button>
      <button @click="switchMap('gaode')">高德地图</button>
      <button @click="switchMap('singleTile')">单张图片</button>
    </div>
    <div ref="cesiumContainer" class="container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import img from "./imgs/earthbump1k.jpg";
import * as Cesium from "cesium";

// 天地图TOKEN
const token = window.TIANDITU_TOKEN;

const cesiumContainer = ref(null);
const currentMap = ref("tianditu");
let viewer = null;
const imageryLayers = reactive({
  tianditu: [], // 天地图图层数组
  gaode: [], // 高德图层数组
  singleTile: [], // 单张图片图层数组
});

onMounted(() => {
  // 初始化Viewer时不加载任何底图
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    baseLayer: false,
    baseLayerPicker: false,
  });
  loadAllMaps(); // 预加载所有底图
});

// 预加载所有底图图层
const loadAllMaps = async () => {
  // 天地图WMTS - 底图
  const tiandituBase = new Cesium.ImageryLayer(
    new Cesium.WebMapTileServiceImageryProvider({
      url: "http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" + token,
      layer: "img",
      style: "default",
      format: "tiles",
      tileMatrixSetID: "w",
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
      maximumLevel: 18,
    })
  );
  tiandituBase.mapType = "tianditu"; // 添加地图类型标识
  imageryLayers.tianditu.push(tiandituBase);

  // 天地图WMTS - 标注
  const tiandituLabel = new Cesium.ImageryLayer(
    new Cesium.WebMapTileServiceImageryProvider({
      url: "http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&tileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" + token,
      layer: "cia",
      style: "default",
      format: "tiles",
      tileMatrixSetID: "w",
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
      maximumLevel: 18,
    })
  );
  tiandituLabel.mapType = "tianditu"; // 添加地图类型标识
  imageryLayers.tianditu.push(tiandituLabel);

  // 高德XYZ
  const gaodeLayer = new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      subdomains: ["1", "2", "3", "4"],
    })
  );
  gaodeLayer.mapType = "gaode"; // 添加地图类型标识
  imageryLayers.gaode.push(gaodeLayer);

  // 单张图片
  const singleTileLayer = new Cesium.ImageryLayer(
    await Cesium.SingleTileImageryProvider.fromUrl(img, {
      rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
    })
  );
  singleTileLayer.mapType = "singleTile"; // 添加地图类型标识
  imageryLayers.singleTile.push(singleTileLayer);

  // 将所有图层添加到viewer，但默认隐藏
  Object.values(imageryLayers).forEach((layerArray) => {
    layerArray.forEach((layer) => {
      viewer.imageryLayers.add(layer);
      layer.show = false; // 默认隐藏所有图层
    });
  });

  // 默认显示天地图
  switchMap("tianditu");
};

// 切换底图显示
const switchMap = (mapType) => {
  // 隐藏所有图层
  viewer.imageryLayers._layers.forEach((layer) => {
    layer.show = false;
  });

  // 显示选中的地图类型的所有图层
  if (imageryLayers[mapType]) {
    imageryLayers[mapType].forEach((layer) => {
      layer.show = true;
      viewer.render();
    });
  }

  // 更新当前地图类型
  currentMap.value = mapType;
};
</script>

<style scoped lang="scss">
.map-switcher {
  position: relative;
  height: 100%;
  width: 100%;
}

.container {
  width: 100%;
  height: 100%;
}

.map-buttons {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1;
  display: flex;
  gap: 10px;

  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.25s;
    width: 140px;
    background-color: #f0f0f0;
    color: #000;
  }

  button:hover {
    border-color: #646cff;
  }

  button:focus,
  button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }

}
</style>
