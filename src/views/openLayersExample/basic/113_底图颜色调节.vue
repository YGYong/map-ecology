<template>
  <div>
    <div id="map" class="map"></div>
    <table class="controls">
      <tr>
        <td><label for="red">Red</label></td>
        <td>
          <input id="red" type="range" min="0" max="500" v-model="redValue" />
        </td>
        <td>
          <span>{{ redValue }}</span> %
        </td>
      </tr>
      <tr>
        <td><label for="green">Green</label></td>
        <td>
          <input
            id="green"
            type="range"
            min="0"
            max="500"
            v-model="greenValue"
          />
        </td>
        <td>
          <span>{{ greenValue }}</span> %
        </td>
      </tr>
      <tr>
        <td><label for="blue">Blue</label></td>
        <td>
          <input id="blue" type="range" min="0" max="500" v-model="blueValue" />
        </td>
        <td>
          <span>{{ blueValue }}</span> %
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import Map from "ol/Map.js";
import View from "ol/View.js";
import XYZ from "ol/source/XYZ.js";
import ImageLayer from "ol/layer/Image.js";
import RasterSource from "ol/source/Raster.js";
import "ol/ol.css";

let map = null;
let raster = null;

// 定义响应式变量，用于双向绑定
const redValue = ref(89);
const greenValue = ref(223);
const blueValue = ref(325);

onMounted(() => {
  // 定义RGB调节函数
  const adjustRGB = function (imageData, data) {
    const pixels = imageData.data;
    const redMultiplier = data.red || 89;
    const greenMultiplier = data.green || 223;
    const blueMultiplier = data.blue || 325;
    // 遍历所有像素 (每4个值代表一个像素: R, G, B, A)
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = redMultiplier - pixels[i]; // Red
      pixels[i + 1] = greenMultiplier - pixels[i + 1]; // Green
      pixels[i + 2] = blueMultiplier - pixels[i + 2]; // Blue
    }
  };

  // 创建栅格源 - 使用XYZ瓦片源
  raster = new RasterSource({
    sources: [
      new XYZ({
        url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        crossOrigin: "anonymous", // 添加跨域支持
      }),
    ],
    operationType: "image", // 设置为image模式,无卡顿高效渲染
    operation: function (pixels, data) {
      // 在image模式下，pixels[0]是ImageData对象
      const imageData = pixels[0];
      // 调用RGB调节函数
      adjustRGB(imageData, data);
      // 返回修改后的ImageData
      return imageData;
    },
    // 将函数添加到lib中
    lib: {
      adjustRGB: adjustRGB,
    },
  });

  // 监听栅格操作前事件，将响应式变量的值传递给操作数据
  raster.on("beforeoperations", function (event) {
    const data = event.data;
    data.red = redValue.value;
    data.green = greenValue.value;
    data.blue = blueValue.value;
  });

  // 创建地图
  map = new Map({
    layers: [
      // 使用ImageLayer显示处理后的栅格
      new ImageLayer({
        source: raster,
      }),
    ],
    target: "map",
    view: new View({
      center: [12958752, 4825923], // 中国中心坐标 (Web Mercator)
      zoom: 4,
      maxZoom: 18,
    }),
  });

  // 监听响应式变量的变化，并触发栅格图层更新
  watch([redValue, greenValue, blueValue], () => {
    if (raster) {
      raster.changed();
    }
  });
});

onUnmounted(() => {
  if (map) {
    map.setTarget(null);
    map = null;
  }
});
</script>

<style scoped>
.map {
  width: 100vw;
  height: 100vh;
}
table.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
table.controls td {
  padding: 2px 5px;
}
table.controls td:nth-child(3) {
  text-align: right;
  min-width: 4.5em;
}
table.controls label {
  font-weight: bold;
  color: #333;
}
table.controls input[type="range"] {
  width: 150px;
}
table.controls span {
  color: #666;
  font-family: monospace;
}
/* 为不同的滑块添加颜色提示 */
table.controls tr:nth-child(1) input[type="range"] {
  accent-color: #ff4444;
}
table.controls tr:nth-child(2) input[type="range"] {
  accent-color: #44ff44;
}
table.controls tr:nth-child(3) input[type="range"] {
  accent-color: #4444ff;
}
</style>
