# View 对象：地图视图控制中心

View 是 OpenLayers 中控制地图显示状态的核心组件，负责管理地图的中心点、缩放级别、旋转角度和坐标系等关键参数。

## 核心属性

| 属性名                 | 类型    | 默认值      | 描述                                                           |
| ---------------------- | ------- | ----------- | -------------------------------------------------------------- |
| center                 | Array   | [0, 0]      | 地图中心坐标（地图投影坐标系）                                 |
| constrainRotation      | boolean | true        | 是否约束旋转角度为 0、90、180、270 度（默认为 false）          |
| zoom                   | number  | undefined   | 仅在 resolution 未定义时使用。用于计算视图初始分辨率的缩放级别 |
| projection             | string  | 'EPSG:3857' | 地图坐标系（如'EPSG:4326'）                                    |
| minZoom                | number  | 0           | 最小缩放级别                                                   |
| maxZoom                | number  | 28          | 最大缩放级别                                                   |
| resolution             | number  | undefined   | 分辨率（替代 zoom 使用）                                       |
| resolutions            | Array   | undefined   | 分辨率数组（用于自定义缩放级别）                               |
| rotation               | number  | 0           | 旋转角度（弧度）                                               |
| extent                 | Array   | undefined   | 地图视图的边界限制（[minx, miny, maxx, maxy]）                 |
| constrainOnlyCenter    | boolean | false       | 是否仅限制中心点在 extent 内（默认为限制整个视图）             |
| constrainResolution    | boolean | false       | 是否将缩放操作约束为固定分辨率（整数级别）                     |
| smoothExtentConstraint | boolean | true        | 是否平滑过渡到约束范围                                         |
| enableRotation         | boolean | true        | 是否允许旋转                                                   |
| maxResolution          | number  | undefined   | 最大分辨率                                                     |
| minResolution          | number  | undefined   | 最小分辨率                                                     |
| zoomFactor             | number  | 2           | 缩放因子（每次缩放的比例）                                     |
| multiWorld             | boolean | false       | 是否允许地图在世界范围外平移（WGS84 投影下通常设为 true）      |

```js
// 中国区域推荐配置
const view = new View({
  projection: "EPSG:4326", // 使用经纬度坐标
  center: [116.4, 39.9], // 北京市中心
  zoom: 10,
  minZoom: 3, // 限制最小缩放
  maxZoom: 18, // 限制最大缩放
  constrainResolution: true, // 整数缩放级别
  multiWorld: true, // 允许超出经度-180~180范围
});
```

### projection

- 定义地图坐标系，`EPSG:3857`为 Web 墨卡托投影（默认），`EPSG:4326`为 WGS84 经纬度坐标系（常用）。
- 所有图层必须使用相同投影

```js
new View({
  projection: "EPSG:4326", // 使用经纬度坐标系
});
```

- 经纬度 -> 墨卡托投影坐标

```js
import { fromLonLat } from "ol/proj";

new View({
  center: fromLonLat([116.4, 39.9]), // 将经纬度转换为EPSG:3857坐标
});
```

- 墨卡托投影坐标 -> 经纬度

```js
import { toLonLat } from "ol/proj";
const lonLat = toLonLat([1296000, 4820000]); // 将墨卡托投影坐标转换为经纬度
console.log(lonLat); // 输出经纬度坐标[11.642166082188997, 39.68311704790915]
```

- `transform` 将坐标从源投影转换到目标投影。这会返回一个新的坐标（并且不会修改原始坐标）

```js
import { transform } from "ol/proj";

// 经纬度坐标转换为墨卡托投影坐标
var mercator = transform([116.4074, 39.9042], "EPSG:4326", "EPSG:3857");
console.log(mercator); // 输出：[12958412.492568914, 4852030.634814578]

// 墨卡托投影坐标转换为经纬度坐标
var lonlat = transform(
  [12958412.492568914, 4852030.634814578],
  "EPSG:3857",
  "EPSG:4326"
);
console.log(lonlat); // 输出：[116.4074, 39.9042]
```

### center

设置地图中心点坐标，一般使用经纬度坐标

```js
new View({
  center: [116.4074, 39.9042], // 北京市中心坐标
  projection: "EPSG:4326", // 使用经纬度坐标系
});
```

### zoom

设置地图缩放级别，如果设置了 resolution，则 zoom 会被忽略

```js
new View({
  zoom: 10.5, // 设置缩放级别，可以为小数
});
```

### minZoom & maxZoom

限制缩放级别范围，只影响用户交互和 API 缩放，不影响直接设置 resolution

```js
new View({
  minZoom: 3,
  maxZoom: 18,
  zoom: 10,
});
```

### rotation

视图的初始旋转角度，以弧度表示（正旋转为顺时针方向，0 表示北方）

```js
new View({
  rotation: Math.PI / 4, // 旋转45度
});
```

### extent

设置地图边界，此范围之外的内容无法在地图上显示,值为`[minx, miny, maxx, maxy]`

```js
// 限制视图在北京市范围内
new View({
  extent: [115.4, 39.4, 117.5, 41.0],
});
```

### resolution

直接设置分辨率，一般直接设置`zoom`即可，除非需要精确控制显示比例时使用

```js
// 在EPSG:3857中，zoom0的分辨率约为156543.03392804097
new View({
  resolution: 78271.51696402048, // 相当于zoom1
});
```

## 核心方法

| 方法名                    | 描述                                                    |
| ------------------------- | ------------------------------------------------------- |
| getCenter()               | 获取当前视图中心坐标                                    |
| setCenter(center)         | 设置视图中心                                            |
| getZoom()                 | 获取当前缩放级别（整数或小数）                          |
| setZoom(zoom)             | 设置缩放级别（立即生效）                                |
| getRotation()             | 获取当前旋转角度（弧度）                                |
| setRotation(rotation)     | 设置旋转角度（弧度）                                    |
| getProjection()           | 获取当前投影对象                                        |
| getResolution()           | 获取当前分辨率                                          |
| setResolution(resolution) | 设置分辨率（立即生效）                                  |
| getResolutions()          | 获取分辨率数组（如果设置）                              |
| getMinZoom()              | 获取最小缩放级别                                        |
| setMinZoom(zoom)          | 设置最小缩放级别                                        |
| getMaxZoom()              | 获取最大缩放级别                                        |
| setMaxZoom(zoom)          | 设置最大缩放级别                                        |
| getMinResolution()        | 获取最小分辨率                                          |
| getMaxResolution()        | 获取最大分辨率                                          |
| animate(animation)        | 执行动画效果（移动、缩放、旋转等）                      |
| cancelAnimations()        | 取消任何正在进行的动画                                  |
| fit(geometry, options)    | 调整视图以适配指定几何体或范围                          |
| calculateExtent(size)     | 计算当前视图的范围（需传入地图容器尺寸[width, height]） |

### 视图控制方法

```js
// 获取当前视图状态
const center = view.getCenter();
const zoom = view.getZoom();
const rotation = view.getRotation();

// 设置视图状态（立即生效）
view.setCenter([13500000, 4500000]);
view.setZoom(8);
view.setRotation(Math.PI / 6);
```

### animate() - 动画效果

执行平滑的视图过渡，单个动画配置对象或数组

动画配置属性

| 属性名     | 类型     | 描述                                             |
| ---------- | -------- | ------------------------------------------------ |
| center     | Array    | 目标中心                                         |
| zoom       | number   | 目标缩放                                         |
| resolution | number   | 目标分辨率                                       |
| rotation   | number   | 目标旋转                                         |
| duration   | number   | 动画时长（毫秒）                                 |
| easing     | function | 缓动函数 参考 [常用 api](./99_常用api.md#easing) |

```js
// 平滑移动到新位置
view.animate({
  center: [116.4, 39.9],
  zoom: 14,
  duration: 2000,
  easing: ol.easing.easeIn,
});

// 链式动画：先缩放后移动
view.animate([
  { zoom: 10, duration: 1500 },
  { center: [121.4, 31.2], duration: 1000 },
]);
```

### fit() - 适配显示

`fit(geometryOrExtent, options)`自动调整视图以完整显示指定区域

- `geometryOrExtent`：适配视图的几何形状或范围，[矢量图形](./08_矢量图形.md)

- `options`：适配选项对象，包含以下属性：

| 选项名        | 类型     | 默认值       | 描述                                      |
| ------------- | -------- | ------------ | ----------------------------------------- |
| size          | Array    | 地图容器尺寸 | 用于计算适配的容器尺寸（[width, height]） |
| padding       | Array    | [0,0,0,0]    | 内边距（[top, right, bottom, left]）      |
| minResolution | number   | 0            | 适配的最小分辨率                          |
| maxZoom       | number   | undefined    | 适配的最大缩放级别                        |
| duration      | number   | undefined    | 动画时长（毫秒）                          |
| easing        | function | undefined    | 缓动函数                                  |
| callback      | function | undefined    | 动画完成后的回调函数                      |

:::details 定位跳转

```vue
<template>
  <div ref="mapContainer" id="map"></div>
  <div style="position: absolute; top: 10px; left: 100px; z-index: 1000">
    <button @click="goto">定位到polygon区域</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import "ol/ol.css";
import Polygon from "ol/geom/Polygon.js";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Vector from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Feature from "ol/Feature.js";

const mapContainer = ref(null);
let map = null;
let view = null;
let polygon = null;
onMounted(() => {
  initMap();
});
const initMap = () => {
  view = new View({
    center: [116.4, 39.9], // 北京市中心经纬度
    zoom: 10.5,
    projection: "EPSG:4326", // 默认使用球面墨卡托投影(EPSG:3857)，需要设置为WGS 84(EPSG:4326)经纬度
    // extent: [115.4, 39.4, 117.5, 41.0],
  });
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 矢量图（含路网、含注记）
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7 ",
        }),
      }),
    ],
    view,
  });

  polygon = new Polygon([
    [
      [117.4, 39.9],
      [117.5, 39.9],
      [117.5, 40.0],
      [117.4, 40.0],
      [117.4, 39.9],
    ],
  ]);
  // 将polygon渲染到地图上，设置颜色为红色
  const feature = new Feature({
    geometry: polygon,
  });
  const source = new Vector({
    features: [feature],
  });
  const layer = new VectorLayer({
    source,
    style: new Style({
      fill: new Fill({
        color: "rgba(255, 0, 0, 0.5)", // 半透明红色填充
      }),
      stroke: new Stroke({
        color: "red", // 红色边框
        width: 2,
      }),
    }),
  });
  map.addLayer(layer);
};
const goto = () => {
  // 定位到polygon区域
  view.fit(polygon, {
    padding: [50, 50, 50, 50], // 四周留白
    duration: 3000,
    maxZoom: 15,
  });
};
</script>
<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
```

:::

<video controls width="600">
  <source src="./imgs/定位.mp4" type="video/mp4" />
  您的浏览器不支持HTML5视频标签。
</video>

### calculateExtent()

通过传入地图容器的尺寸，计算当前视图的范围。返回值为 `[minX, minY, maxX, maxY]`。

```js
// 计算当前视图范围
const mapSize = map.getSize();
const currentExtent = view.calculateExtent(mapSize);
console.log(currentExtent); // 输出范围 [minX, minY, maxX, maxY]
```
