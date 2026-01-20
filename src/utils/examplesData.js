/**
 * 示例数据模块
 * 包含所有 Cesium 示例的数据和分类信息
 * 
 * 数据格式要求:
 * - Example: { id: number, category: number, name: string, preview: string, code: string }
 * - Category: { id: number, name: string, count: number, subcategories: Array<{ id: number, name: string }> }
 * 
 * 所有示例代码必须是有效的 Vue SFC (Single File Component)
 */

// 示例数据
export const examples = [
  {
    id: 0,
    category: 0,
    name: '智慧城市运营中心',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2ZiZmJmYiIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+57O757uf5YyX5Lqs57O757uf5YyX5LqsPC90ZXh0Pjwvc3ZnPg==',
    code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

onMounted(() => {
  // 初始化 Cesium 查看器
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: '© OpenStreetMap contributors'
    })
  });

  // 设置初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  });

  // 添加智慧城市模型
  // 这里使用示例数据，实际项目中可以加载真实的 3D 模型
  const cityModel = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923),
    label: {
      text: '智慧城市运营中心',
      font: '16px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER
    }
  });
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
    `
  },
  {
    id: 1,
    category: 0,
    name: '地下100米积水',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzBjOWViZiIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+57O757uf57uf5Zyw54mHPC90ZXh0Pjwvc3ZnPg==',
    code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

onMounted(() => {
  // 初始化 Cesium 查看器
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: '© OpenStreetMap contributors'
    })
  });

  // 设置初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  });

  // 模拟地下积水效果
  const waterArea = viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        116.39, 39.905,
        116.405, 39.905,
        116.405, 39.915,
        116.39, 39.915
      ]),
      material: Cesium.Color.BLUE.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.BLUE,
      outlineWidth: 2,
      height: -100, // 地下 100 米
      extrudedHeight: 0
    },
    label: {
      text: '地下100米积水',
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10)
    }
  });
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
    `
  },
  {
    id: 10,
    category: 1,
    name: '场景 Scene',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+55Sf57O757uf5ZCOPC90ZXh0Pjwvc3ZnPg==',
    code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

onMounted(() => {
  // 初始化 Cesium 查看器
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: '© OpenStreetMap contributors'
    })
  });

  // 获取场景对象
  const scene = viewer.scene;

  // 设置场景背景颜色
  scene.backgroundColor = Cesium.Color.SKY_BLUE.withAlpha(0.5);

  // 设置初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  });
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
    `
  },
  {
    id: 11,
    category: 1,
    name: '相机 Camera',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5YWD55qE55Sf57O757uf5ZCOPC90ZXh0Pjwvc3ZnPg==',
    code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

onMounted(() => {
  // 初始化 Cesium 查看器
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: '© OpenStreetMap contributors'
    })
  });

  // 设置相机视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 5000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  });

  // 相机飞行示例
  setTimeout(() => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(121.473701, 31.230416, 5000),
      orientation: {
        heading: Cesium.Math.toRadians(90),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      },
      duration: 3 // 飞行持续时间（秒）
    });
  }, 2000);
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
    `
  },
  {
    id: 12,
    category: 1,
    name: '实体 Entity',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5bGC6ICM56S+5pys56S+5pysPC90ZXh0Pjwvc3ZnPg==',
    code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

onMounted(() => {
  // 初始化 Cesium 查看器
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: '© OpenStreetMap contributors'
    })
  });

  // 设置初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  });

  // 创建点实体
  const pointEntity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923),
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED
    },
    label: {
      text: '北京',
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10)
    }
  });

  // 创建线实体
  const lineEntity = viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray([
        116.397428, 39.90923,
        121.473701, 31.230416
      ]),
      width: 5,
      material: Cesium.Color.BLUE
    }
  });

  // 创建面实体
  const polygonEntity = viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        116.3, 39.8,
        116.5, 39.8,
        116.5, 40.0,
        116.3, 40.0
      ]),
      material: Cesium.Color.GREEN.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2
    }
  });
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
    `
  },
  {
    id: 13,
    category: 1,
    name: '初始化',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzAwMjE0MCIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Yid5aeL5YyWPC90ZXh0Pjwvc3ZnPg==',
    code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

onMounted(() => {
  // 初始化 Cesium 查看器
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    terrain: Cesium.Terrain.fromWorldTerrain(),
  });

  // 设置初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  });
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
    `
  },
  {
    id: 14,
    category: 1,
    name: '天地图影像',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzAwYjVmNCIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5aSp5Zyw5Zu+5b2x5YOPwqA8L3RleHQ+PC9zdmc+',
    code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

// 天地图TOKEN
const token = "05be06461004055923091de7f3e51aa6";

onMounted(() => {
  // 初始化Viewer
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    baseLayer: false,
  });

  // 清空logo
  viewer.cesiumWidget.creditContainer.style.display = "none";

  // 加载天地图影像
  const tiandituProvider = new Cesium.WebMapTileServiceImageryProvider({
    url:
      "https://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
      token,
    layer: "img",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "w",
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    maximumLevel: 18,
    credit: new Cesium.Credit("天地图影像"),
  });

  viewer.imageryLayers.addImageryProvider(tiandituProvider);

  // 设置初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0
    }
  });
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
    `
  },
  {
    id: 15,
    category: 1,
    name: '天地图标注',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzAwYjVmNCIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5aSp5Zyw5Zu+5qCH5rOoPC90ZXh0Pjwvc3ZnPg==',
    code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

// 天地图TOKEN
const token = "05be06461004055923091de7f3e51aa6";

onMounted(() => {
  // 初始化Viewer
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    baseLayer: false,
  });

  // 清空logo
  viewer.cesiumWidget.creditContainer.style.display = "none";

  // 加载天地图影像
  const tiandituImgProvider = new Cesium.WebMapTileServiceImageryProvider({
    url:
      "https://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
      token,
    layer: "img",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "w",
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    maximumLevel: 18,
    credit: new Cesium.Credit("天地图影像"),
  });

  viewer.imageryLayers.addImageryProvider(tiandituImgProvider);

  // 加载天地图标注
  const tiandituCiaProvider = new Cesium.WebMapTileServiceImageryProvider({
    url:
      "https://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
      token,
    layer: "cia",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "w",
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    maximumLevel: 18,
    credit: new Cesium.Credit("天地图标注"),
  });

  viewer.imageryLayers.addImageryProvider(tiandituCiaProvider);

  // 设置初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 100000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  });
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
    `
  },
  {
    id: 16,
    category: 1,
    name: '高德地图',
    preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzAwYjVmNCIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+6auY5b635Zyw5Zu+PC90ZXh0Pjwvc3ZnPg==',
    code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

onMounted(() => {
  // 初始化Viewer
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    baseLayer: false,
  });

  // 清空logo
  viewer.cesiumWidget.creditContainer.style.display = "none";

  // 加载高德地图
  const gaodeProvider = new Cesium.UrlTemplateImageryProvider({
    url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    minimumLevel: 3,
    maximumLevel: 18,
  });

  viewer.imageryLayers.addImageryProvider(gaodeProvider);

  // 设置初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 100000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  });
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
    `
  }
];

/**
 * 分类数据
 * 定义示例的分类结构和子分类
 */
export const categories = [
  {
    id: 0,
    name: '综合应用',
    count: 20,
    subcategories: [
      { id: 0, name: '智慧城市运营中心' },
      { id: 1, name: '地下100米积水' },
      { id: 2, name: '二三维联动' },
      { id: 3, name: '双屏联动' },
      { id: 4, name: '智慧农业' },
      { id: 5, name: '智慧园区' },
      { id: 6, name: '台风' },
      { id: 7, name: '模拟闪电' },
      { id: 8, name: '实时在线云图' },
      { id: 9, name: '加载虚拟数字人' }
    ]
  },
  {
    id: 1,
    name: '基础',
    count: 16,
    subcategories: [
      { id: 10, name: '场景 Scene' },
      { id: 11, name: '相机 Camera' },
      { id: 12, name: '实体 Entity' },
      { id: 13, name: '初始化' },
      { id: 14, name: '天地图影像' },
      { id: 15, name: '天地图标注' },
      { id: 16, name: '高德地图' }
    ]
  },
  {
    id: 2,
    name: '地形',
    count: 10,
    subcategories: [
      { id: 20, name: '地形开挖' },
      { id: 21, name: '地形夸张' },
      { id: 22, name: '离线地形' },
      { id: 23, name: '在线地形' }
    ]
  },
  {
    id: 3,
    name: '空间分析',
    count: 12,
    subcategories: [
      { id: 30, name: '可视域分析' },
      { id: 31, name: '淹没分析' },
      { id: 32, name: '缓冲分析' },
      { id: 33, name: '日照分析' },
      { id: 34, name: '方量分析' },
      { id: 35, name: '透视分析' }
    ]
  },
  {
    id: 4,
    name: '特效',
    count: 18,
    subcategories: [
      { id: 40, name: '雨雪雾' },
      { id: 41, name: '天空盒' },
      { id: 42, name: '场景出图' },
      { id: 43, name: '体积云' },
      { id: 44, name: '闪电' },
      { id: 45, name: '视锥体' },
      { id: 46, name: '雷达扫描' },
      { id: 47, name: '流动线' },
      { id: 48, name: '水波纹' },
      { id: 49, name: '动态扩散点' }
    ]
  },
  {
    id: 5,
    name: '物理引擎',
    count: 8,
    subcategories: [
      { id: 50, name: '车辆运动' },
      { id: 51, name: '转动（旗子）' },
      { id: 52, name: '撞击（软体）' },
      { id: 53, name: '撞击断裂体' }
    ]
  },
  {
    id: 6,
    name: '模型',
    count: 14,
    subcategories: [
      { id: 60, name: '加载 glb' },
      { id: 61, name: '加载 gltf' },
      { id: 62, name: '加载 3dtiles' },
      { id: 63, name: '模型事件' },
      { id: 64, name: '模型编辑' },
      { id: 65, name: '模型运动' },
      { id: 66, name: '模型偏移' }
    ]
  },
  {
    id: 7,
    name: '可视化',
    count: 16,
    subcategories: [
      { id: 70, name: '大数据可视化' },
      { id: 71, name: '风场' },
      { id: 72, name: '3d 热力图' },
      { id: 73, name: '二维热力图' },
      { id: 74, name: '克里金' },
      { id: 75, name: '海流' },
      { id: 76, name: '等值面图' }
    ]
  },
  {
    id: 8,
    name: '性能优化',
    count: 9,
    subcategories: [
      { id: 80, name: '数据分块' },
      { id: 81, name: 'LOD 优化' },
      { id: 82, name: '渲染优化' },
      { id: 83, name: '内存优化' }
    ]
  }
];


/**
 * 运行时数据验证
 * 在开发环境中验证数据完整性
 */
if (import.meta.env.DEV) {
  // 验证示例数据
  examples.forEach((example, index) => {
    if (typeof example.id !== 'number') {
      console.warn(`[ExamplesData] Example at index ${index} has invalid id`);
    }
    if (typeof example.category !== 'number') {
      console.warn(`[ExamplesData] Example ${example.id} has invalid category`);
    }
    if (typeof example.name !== 'string' || !example.name.trim()) {
      console.warn(`[ExamplesData] Example ${example.id} has invalid name`);
    }
    if (typeof example.preview !== 'string' || !example.preview.trim()) {
      console.warn(`[ExamplesData] Example ${example.id} (${example.name}) has invalid preview`);
    }
    if (typeof example.code !== 'string' || !example.code.trim()) {
      console.warn(`[ExamplesData] Example ${example.id} (${example.name}) has invalid code`);
    }
  });

  // 验证分类数据
  categories.forEach((category, index) => {
    if (typeof category.id !== 'number') {
      console.warn(`[ExamplesData] Category at index ${index} has invalid id`);
    }
    if (typeof category.name !== 'string' || !category.name.trim()) {
      console.warn(`[ExamplesData] Category ${category.id} has invalid name`);
    }
    if (typeof category.count !== 'number' || category.count < 0) {
      console.warn(`[ExamplesData] Category ${category.id} (${category.name}) has invalid count`);
    }
    if (!Array.isArray(category.subcategories)) {
      console.warn(`[ExamplesData] Category ${category.id} (${category.name}) has invalid subcategories`);
    }
  });

  // 验证示例 ID 唯一性
  const exampleIds = new Set();
  examples.forEach(example => {
    if (exampleIds.has(example.id)) {
      console.warn(`[ExamplesData] Duplicate example ID: ${example.id}`);
    }
    exampleIds.add(example.id);
  });

  // 验证分类 ID 唯一性
  const categoryIds = new Set();
  categories.forEach(category => {
    if (categoryIds.has(category.id)) {
      console.warn(`[ExamplesData] Duplicate category ID: ${category.id}`);
    }
    categoryIds.add(category.id);
  });

  // 验证示例引用的分类是否存在
  examples.forEach(example => {
    if (!categoryIds.has(example.category)) {
      console.warn(`[ExamplesData] Example ${example.id} (${example.name}) references non-existent category ${example.category}`);
    }
  });

  console.log(`[ExamplesData] ✓ Loaded ${examples.length} examples and ${categories.length} categories`);
}
