<template>
  <div>
    <div id="map" class="map"></div>
    <table class="controls">
      <tr>
        <td><label for="hue">hue</label></td>
        <td><input id="hue" type="range" min="-180" max="180" value="0" /></td>
        <td><span id="hueOut"></span> °&nbsp;</td>
      </tr>
      <tr>
        <td><label for="chroma">chroma</label></td>
        <td>
          <input id="chroma" type="range" min="0" max="100" value="100" />
        </td>
        <td><span id="chromaOut"></span> %</td>
      </tr>
      <tr>
        <td><label for="lightness">lightness</label></td>
        <td>
          <input id="lightness" type="range" min="0" max="100" value="100" />
        </td>
        <td><span id="lightnessOut"></span> %</td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import Map from "ol/Map.js";
import View from "ol/View.js";
import XYZ from "ol/source/XYZ.js";
import ImageLayer from "ol/layer/Image.js";
import RasterSource from "ol/source/Raster.js";
import "ol/ol.css";

const Xn = 0.95047;
const Yn = 1;
const Zn = 1.08883;
const t0 = 4 / 29;
const t1 = 6 / 29;
const t2 = 3 * t1 * t1;
const t3 = t1 * t1 * t1;
const twoPi = 2 * Math.PI;

/**
 * Convert an RGB pixel into an HCL pixel.
 * @param {Array<number>} pixel A pixel in RGB space.
 * @return {Array<number>} A pixel in HCL space.
 */
function rgb2hcl(pixel) {
  const red = rgb2xyz(pixel[0]);
  const green = rgb2xyz(pixel[1]);
  const blue = rgb2xyz(pixel[2]);
  const x = xyz2lab(
    (0.4124564 * red + 0.3575761 * green + 0.1804375 * blue) / Xn
  );
  const y = xyz2lab(
    (0.2126729 * red + 0.7151522 * green + 0.072175 * blue) / Yn
  );
  const z = xyz2lab(
    (0.0193339 * red + 0.119192 * green + 0.9503041 * blue) / Zn
  );
  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a);
  if (h < 0) {
    h += twoPi;
  }
  pixel[0] = h;
  pixel[1] = c;
  pixel[2] = l;
  return pixel;
}

/**
 * Convert an HCL pixel into an RGB pixel.
 * @param {Array<number>} pixel A pixel in HCL space.
 * @return {Array<number>} A pixel in RGB space.
 */
function hcl2rgb(pixel) {
  const h = pixel[0];
  const c = pixel[1];
  const l = pixel[2];
  const a = Math.cos(h) * c;
  const b = Math.sin(h) * c;
  let y = (l + 16) / 116;
  let x = isNaN(a) ? y : y + a / 500;
  let z = isNaN(b) ? y : y - b / 200;
  y = Yn * lab2xyz(y);
  x = Xn * lab2xyz(x);
  z = Zn * lab2xyz(z);
  pixel[0] = xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
  pixel[1] = xyz2rgb(-0.969266 * x + 1.8760108 * y + 0.041556 * z);
  pixel[2] = xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
  return pixel;
}

function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

function rgb2xyz(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function xyz2rgb(x) {
  return (
    255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)
  );
}

let map = null;
let raster = null;
const controls = {};

onMounted(() => {
  // 创建栅格源 - 使用XYZ瓦片源
  raster = new RasterSource({
    sources: [
      new XYZ({
        url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        crossOrigin: "anonymous", // 添加跨域支持
      }),
    ],
    //这里设置为image类型，与官方示例不同，优化速度
    // operationType: "image",
    operation: function (pixels, data) {
      const hcl = rgb2hcl(pixels[0]);
      let h = hcl[0] + (Math.PI * data.hue) / 180;
      if (h < 0) {
        h += twoPi;
      } else if (h > twoPi) {
        h -= twoPi;
      }
      hcl[0] = h;
      hcl[1] *= data.chroma / 100;
      hcl[2] *= data.lightness / 100;
      return hcl2rgb(hcl);
    },
    lib: {
      rgb2hcl: rgb2hcl,
      hcl2rgb: hcl2rgb,
      rgb2xyz: rgb2xyz,
      lab2xyz: lab2xyz,
      xyz2lab: xyz2lab,
      xyz2rgb: xyz2rgb,
      Xn: Xn,
      Yn: Yn,
      Zn: Zn,
      t0: t0,
      t1: t1,
      t2: t2,
      t3: t3,
      twoPi: twoPi,
    },
  });

  // 监听栅格操作前事件
  raster.on("beforeoperations", function (event) {
    const data = event.data;
    for (const id in controls) {
      data[id] = Number(controls[id].value);
    }
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

  // 初始化控制器
  const controlIds = ["hue", "chroma", "lightness"];
  controlIds.forEach(function (id) {
    const control = document.getElementById(id);
    const output = document.getElementById(id + "Out");
    control.addEventListener("input", function () {
      output.innerText = control.value;
      raster.changed();
    });
    output.innerText = control.value;
    controls[id] = control;
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
</style>
