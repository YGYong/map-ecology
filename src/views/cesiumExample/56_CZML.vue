<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

// 设置访问令牌
Cesium.Ion.defaultAccessToken = window.CESIUM_ION_TOKEN;

onMounted(() => {
  // 初始化Viewer
  viewer = new Cesium.Viewer(cesiumContainer.value, {});
  // 清空logo
  viewer.cesiumWidget.creditContainer.style.display = "none";

  const czml = [
    {
      id: "document",
      name: "CZML Model",
      version: "1.0",
      clock: {
        interval: "2019-06-01T16:00:00Z/2019-06-01T16:10:00Z",
        currentTime: "2019-06-01T16:00:00Z",
        multiplier: 60,
        range: "LOOP_STOP",
        step: "SYSTEM_CLOCK_MULTIPLIER",
      },
    },
    {
      id: "test model",
      name: "Cesium Air",
      position: {
        cartographicDegrees: [-77, 37, 10000],
      },
      model: {
        gltf: "https://cesium.com/public/SandcastleSampleData/launchvehicle.glb",
        scale: 2.0,
        minimumPixelSize: 128,
        runAnimations: false,
        articulations: {
          "Fairing Open": {
            epoch: "2019-06-01T16:00:00Z",
            number: [0, 0, 600, 120],
          },
          "Fairing Separate": {
            epoch: "2019-06-01T16:00:00Z",
            number: [0, 0, 400, -50],
          },
          "Fairing Drop": {
            epoch: "2019-06-01T16:00:00Z",
            interpolationAlgorithm: "LAGRANGE",
            interpolationDegree: 2,
            number: [0, 0, 80, 0, 100, 0, 120, -1, 600, -120],
          },
        },
      },
    },
  ];

  // 加载CZML数据
  viewer.clock.shouldAnimate = true; // 开启动画

  const dataSource = Cesium.CzmlDataSource.load(czml);
  viewer.dataSources
    .add(dataSource)
    .then(function (dataSource) {
      viewer.trackedEntity = dataSource.entities.getById("test model");
    })
    .catch(function (error) {
      console.error(error);
    });
});

</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>