<template>
  <div>
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import ImageLayer from "ol/layer/Image";
import Map from "ol/Map";
import View from "ol/View";
import XYZ from "ol/source/XYZ";
import "ol/ol.css";
import { Raster as RasterSource } from "ol/source";
onMounted(() => {
  //定义颜色转换方法
  let reverseFunc = function (pixelsTemp) {
    //蓝色
    for (var i = 0; i < pixelsTemp.length; i += 4) {
      var r = pixelsTemp[i];
      var g = pixelsTemp[i + 1];
      var b = pixelsTemp[i + 2];
      //运用图像学公式，设置灰度值
      var grey = r * 0.3 + g * 0.59 + b * 0.11;
      //将rgb的值替换为灰度值
      pixelsTemp[i] = grey;
      pixelsTemp[i + 1] = grey;
      pixelsTemp[i + 2] = grey;

      //基于灰色，设置为蓝色，这几个数值是我自己试出来的，可以根据需求调整
      pixelsTemp[i] = 55 - pixelsTemp[i];
      pixelsTemp[i + 1] = 255 - pixelsTemp[i + 1];
      pixelsTemp[i + 2] = 305 - pixelsTemp[i + 2];
    }
  };
  //openlayer 像素转换类，可以直接当做source使用
  const raster = new RasterSource({
    sources: [
      new XYZ({
        url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        crossOrigin: "anonymous", // 添加跨域支持
      }),
    ],
    //这里设置为image类型，与官方示例不同，优化速度
    operationType: "image",
    operation: function (pixels) {
      //执行颜色转换方法，注意，这里的方法需要使用lib引入进来才可以使用
      reverseFunc(pixels[0].data);
      return pixels[0];
    },
    //线程数量
    threads: 10,
    //允许operation使用外部方法
    lib: {
      reverseFunc: reverseFunc,
    },
  });

  //设置地图
  new Map({
    target: "map",
    layers: [
      new ImageLayer({
        source: raster,
      }),
    ],
    view: new View({
      center: [12958752, 4825923], // 中国中心坐标 (Web Mercator)
      zoom: 4,
      maxZoom: 18,
    }),
  });
});
</script>

<style scoped>
.map {
  width: 100vw;
  height: 100vh;
}
</style>
