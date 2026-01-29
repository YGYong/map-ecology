<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
/**
 * 案例参考[官方示例 Animated GIF](https://openlayers.org/en/latest/examples/animated-gif.html)
 * 
 * 1. 需要使用到 `gifler` 库来加载 gif 图像。
 * 2. `gifler` 不支持 ES6 模块导入，通过 CDN 引入。
 */
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Style from "ol/style/Style.js";
import Icon from "ol/style/Icon.js";
import { fromLonLat } from "ol/proj.js";
import "ol/ol.css";

// 引入 gif 动图
import gifUrl from "./imgs/globe.gif";

const mapContainer = ref(null);
let map = null;

const view = new View({
  center: fromLonLat([116.4074, 39.9042]),
  zoom: 10,
});

onMounted(async () => {
  // 动态加载 gifler (如果全局没有)
  if (typeof window.gifler !== 'function') {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/gifler@0.1.0/gifler.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });

  loadGif();
});

const loadGif = () => {
  const iconFeature = new Feature({
    geometry: new Point(fromLonLat([116.4074, 39.9042])),
  });

  const vectorSource = new VectorSource({
    features: [iconFeature],
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  map.addLayer(vectorLayer);

  // 使用 gifler 加载 gif
  const gif = window.gifler(gifUrl);
  gif.frames(
    document.createElement("canvas"),
    function (ctx, frame) {
      if (!iconFeature.getStyle()) {
        iconFeature.setStyle(
          new Style({
            image: new Icon({
              img: ctx.canvas,
              opacity: 0.8,
            }),
          })
        );
      }
      ctx.clearRect(0, 0, frame.width, frame.height);
      ctx.drawImage(frame.buffer, frame.x, frame.y);
      map.render();
    },
    true
  );

  map.on("pointermove", function (e) {
    const hit = map.hasFeatureAtPixel(e.pixel);
    map.getTargetElement().style.cursor = hit ? "pointer" : "";
  });
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
