<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, Vector as VectorSource, Cluster } from "ol/source";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import { Style, Fill, Stroke, Circle, Text } from "ol/style";
import "ol/ol.css";

const mapContainer = ref(null);
let map = null;

onMounted(() => {
  // 1. 创建原始矢量数据源并生成随机点
  const count = 1000;
  const features = new Array(count);
  const e = 4500000;
  for (let i = 0; i < count; ++i) {
    const coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
    features[i] = new Feature(new Point(coordinates));
  }

  const source = new VectorSource({
    features: features,
  });

  // 2. 创建聚合数据源
  const clusterSource = new Cluster({
    distance: 40, // 聚合距离
    source: source,
  });

  // 3. 创建聚合图层样式
  const styleCache = {};
  const clusters = new VectorLayer({
    source: clusterSource,
    style: function (feature) {
      const size = feature.get("features").length;
      let style = styleCache[size];
      if (!style) {
        style = new Style({
          image: new Circle({
            radius: 10,
            stroke: new Stroke({
              color: "#fff",
            }),
            fill: new Fill({
              color: "#3399CC",
            }),
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({
              color: "#fff",
            }),
          }),
        });
        styleCache[size] = style;
      }
      return style;
    },
  });

  // 4. 创建基础底图
  const raster = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    }),
  });

  // 5. 初始化地图
  map = new Map({
    layers: [raster, clusters],
    target: mapContainer.value,
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  });
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
