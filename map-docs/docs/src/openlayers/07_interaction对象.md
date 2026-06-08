# 概述

Interaction 是 OpenLayers 中处理用户交互的核心机制，提供丰富的交互式地图体验。

- [基本使用](./02_map%E5%AF%B9%E8%B1%A1.html#interactions)已经在 map 中讲解过，这里主要讲`PointerInteraction`、`Select`和默认交互

## 默认交互集合

在`ol/interaction/defaults`类中定义了默认交互集合。

| 参数                 | 类型    | 默认值 | 功能描述                                         |
| -------------------- | ------- | ------ | ------------------------------------------------ |
| `altShiftDragRotate` | boolean | true   | 启用 alt+shift+拖动旋转功能（默认为 true）       |
| `onFocusOnly`        | boolean | false  | 仅在地图元素获得焦点时才启用交互（默认为 false） |
| `doubleClickZoom`    | boolean | true   | 启用双击缩放功能（默认为 true）                  |
| `keyboard`           | boolean | true   | 启用键盘交互功能（默认为 true）                  |
| `mouseWheelZoom`     | boolean | true   | 启用鼠标滚轮缩放功能（默认为 true）              |
| `shiftDragZoom`      | boolean | true   | 启用 shift+拖动缩放功能（默认为 true）           |
| `dragPan`            | boolean | true   | 启用拖拽平移功能（默认为 true）                  |
| `pinchRotate`        | boolean | true   | 启用双指旋转功能（默认为 true）                  |
| `pinchZoom`          | boolean | true   | 启用双指捏合缩放功能（默认为 true）              |
| `zoomDelta`          | number  | -      | 缩放增量（类型：number）                         |
| `zoomDuration`       | number  | -      | 缩放动画持续时间（单位：毫秒，类型：number）     |

```js
import { defaults as defaultInteractions } from "ol/interaction/defaults";
map = new Map({
  interactions: defaultInteractions({
    altShiftDragRotate: false, // 禁用alt+shift+拖动旋转
    doubleClickZoom: false, // 禁用双击缩放
    mouseWheelZoom: false, // 禁用鼠标滚轮缩放
    dragPan: false, // 禁用拖拽平移,继承自PointerInteraction
  }),
  // 其他配置...
});
```

## PointerInteraction

PointerInteraction 是 OpenLayers 中处理指针事件（鼠标、触摸、笔等）的交互基类，它提供了处理鼠标和触摸事件的基本框架，所有具体的交互类都继承自它。

| 子类名称          | 核心功能     | 常用场景       |
| ----------------- | ------------ | -------------- |
| DragBox           | 绘制选择框   | 区域选择要素   |
| DragPan           | 地图拖拽平移 | 地图浏览       |
| DragRotateAndZoom | 拖拽旋转缩放 | 地图操作       |
| DragRotate        | 地图旋转     | 调整地图角度   |
| Draw              | 绘制图形     | 标记区域/路线  |
| Extent            | 绘制矩形     | 标记范围       |
| Modify            | 编辑图形     | 修改已有图形   |
| PinchRotate       | 双指旋转     | 移动端地图旋转 |
| PinchZoom         | 双指捏合缩放 | 移动端地图缩放 |
| Snap              | 要素吸附     | 精准绘制/编辑  |
| Translate         | 移动要素     | 拖动要素位置   |

### DragBox

允许用户通过在地图上点击和拖动来绘制矢量框，通常与一个 ol/events/condition 结合使用,[condition 类型](./99_%E5%B8%B8%E7%94%A8api.html#condition)

#### 常用配置

- `className`：矩形框的 CSS 类名（默认为`ol-dragbox`）
- `condition`：触发条件（默认为`mouseActionButton`，鼠标拖拽即绘制）
- `minArea`：矩形的最小面积（小于此面积则不触发操作，默认为 64 像素）

#### 核心方法

- `getGeometry()`：获取矩形框的几何对象（返回一个 ol/geom/Polygon 类型）

#### 核心事件

- `boxstart`：开始绘制时触发
- `boxdrag`：拖拽过程中触发（移动鼠标时）
- `boxend`：绘制完成时触发（释放鼠标）

#### 子类 DrawZoom

DragZoom 是 DragBox 的直接子类，专门用于实现拖拽矩形区域缩放的功能。当用户完成矩形绘制后，地图会自动缩放到该区域。

> - 使用方式和`DragBox`一样
> - 常用配置较`DragBox`多一个`duration`：动画持续时间（毫秒），默认 200

这里我以 DrawZoom 为例，实现区域选择

::: details 代码示例

```vue
<template>
  <div ref="mapContainer" id="map"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import "ol/ol.css";
import { platformModifierKeyOnly } from "ol/events/condition";
import DragZoom from "ol/interaction/DragZoom.js";

const mapContainer = ref(null);
let map = null;
const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 10,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});
onMounted(async () => {
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });

  // const dragBox = new DragBox({
  const dragBox = new DragZoom({
    condition: platformModifierKeyOnly, // 按住ctrl键,鼠标拖拽绘制矩形
  });

  map.addInteraction(dragBox);

  // 监听矩形绘制事件
  dragBox.on("boxstart", (event) => {
    console.log(event, "绘制开始");
  });

  // 监听矩形绘制过程事件
  dragBox.on("boxdrag", (event) => {
    console.log(event, "绘制过程中");
  });

  // 监听选择完成事件
  dragBox.on("boxend", (event) => {
    const extent = dragBox.getGeometry().getExtent();
    console.log("绘制结束，选择的区域范围:", extent);
    // 此处可添加区域选择逻辑
  });
});
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
  <source src="./imgs/框选缩放.mp4" type="video/mp4" />
  您的浏览器不支持HTML5视频标签。
</video>

### DragPan

允许用户通过拖动地图来平移地图，默认已启用

#### 常用配置

- `condition`：是否应处理该事件（默认为`noModifierKeys`和`primaryAction`）

```js
import DragPan from "ol/interaction/DragPan";
import { noModifierKeys } from "ol/events/condition";

new DragPan({
  condition: noModifierKeys,
});
```

### DragRotateAndZoom

允许用户通过点击和拖动地图来缩放和旋转地图。默认情况下，此交互仅在按住 Shift 键时受限

#### 常用配置

- `condition`：是否应处理该事件（默认为`shiftKeyOnly`）
- `duration`：动画持续时间（毫秒），默认 400

```js
import DragRotateAndZoom from "ol/interaction/DragRotateAndZoom";
import { shiftKeyOnly } from "ol/events/condition";

new DragRotateAndZoom({
  condition: shiftKeyOnly,
  duration: 400,
});
```

### DragRotate

允许用户通过点击和拖动地图来旋转地图，仅当同时按下 alt 和 shift 键时才生效

#### 常用配置

- `condition`：是否应处理该事件（默认为`altShiftKeysOnly`）
- `duration`：动画持续时间（毫秒），默认 250

### Draw

`Draw` 交互是 OpenLayers 中最常用的交互之一，它允许用户在地图上绘制各种几何图形

#### 核心功能

- 绘制点、线、多边形、圆等几何图形
- 支持自由绘制（freehand）模式
- 提供绘制过程中的视觉反馈
- 事件驱动：绘制开始、进行中、结束等事件
- 支持吸附（snap）到其他要素

#### 主要配置项

| **参数名**          | **类型**               | **默认值**       | **描述**                                                                                                                                                   |
| ------------------- | ---------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`            | `VectorSource`         | **必填**         | 绘制结果存放的数据源                                                                                                                                       |
| `type`              | `GeometryType`         | **必填**         | 绘制类型：`'Point'`, `'LineString'`,`'LinearRing'`, `'Polygon'`, `'Circle'`, `'MultiPoint'`, `'MultiLineString'`, `'MultiPolygon'` ,`'GeometryCollection'` |
| `style`             | `Style\|StyleFunction` | `null`           | 绘制过程中临时图形的样式                                                                                                                                   |
| `clickTolerance`    | `number`               | `6`              | 点击要素时的容差（像素）                                                                                                                                   |
| `features`          | `Array<Feature>`       | `[]`             | 初始要素数组                                                                                                                                               |
| `freehand`          | `boolean`              | `false`          | 是否开启自由绘制（手绘）模式                                                                                                                               |
| `freehandCondition` | `function`             | `null`           | 触发自由绘制的条件（如按住 Shift 键）                                                                                                                      |
| `dragVertexDelay`   | `number`               | `500`            | 拖动顶点时的延迟（毫秒）                                                                                                                                   |
| `snapTolerance`     | `number`               | `12`             | 吸附到其他要素的容差（像素）                                                                                                                               |
| `stopClick`         | `boolean`              | `false`          | 是否阻止点击事件                                                                                                                                           |
| `maxPoints`         | `number`               | `undefined`      | 最大点数（例如矩形需要 4 个点，但自动闭合）                                                                                                                |
| `minPoints`         | `number`               | `undefined`      | 完成图形所需的最小点数                                                                                                                                     |
| `finishCondition`   | `function`             | `null`           | 在绘制点或多点几何体时不使用                                                                                                                               |
| `condition`         | `function`             | `noModifierKeys` | 是否应处理该事件（默认为`noModifierKeys`）                                                                                                                 |
| `geometryFunction`  | `function`             | `undefined`      | 自定义几何图形生成函数                                                                                                                                     |
| `geometryName`      | `string`               | `undefined`      | 要素中存储几何图形的属性名                                                                                                                                 |

#### 常用方法

| **方法名**          | **参数**          | **返回值** | **描述**               |
| ------------------- | ----------------- | ---------- | ---------------------- |
| `finishDrawing()`   | 无                | 无         | 完成当前绘制并创建要素 |
| `removeLastPoint()` | 无                | 无         | 删除最后一个添加的点   |
| `setActive(active)` | `active: boolean` | 无         | 启用/禁用交互          |

#### 重要事件

| **事件名**  | **触发时机**           |
| ----------- | ---------------------- |
| `drawstart` | 开始绘制时             |
| `drawend`   | 绘制完成（创建要素后） |
| `drawabort` | 绘制中止时             |

#### 综合案例

:::details 案例代码

```vue
<template>
  <div class="map-container">
    <div ref="mapElement" class="map"></div>
    <div class="controls">
      <select v-model="drawType">
        <option value="Point">点</option>
        <option value="LineString">线</option>
        <option value="Polygon">多边形</option>
        <option value="Circle">圆</option>
      </select>
      <button @click="toggleDrawing">
        {{ isDrawing ? "停止绘制" : "开始绘制" }}
      </button>
      <button @click="clearAll">清除所有</button>
      <label style="color: black">
        <input type="checkbox" v-model="freehandMode" /> 自由绘制
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Map, View } from "ol";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";

const mapElement = ref(null);
const drawType = ref("Polygon");
const isDrawing = ref(false);
const freehandMode = ref(false);
let map = null;
let drawInteraction = null;
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({ source: vectorSource });

const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 10,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});

// 初始化地图
onMounted(() => {
  map = new Map({
    target: mapElement.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
      vectorLayer,
    ],
    view,
  });
});

// 切换绘制类型和状态
watch([drawType, isDrawing, freehandMode], ([type, drawing, freehand]) => {
  if (drawInteraction) {
    map.removeInteraction(drawInteraction);
    drawInteraction = null;
  }

  if (drawing) {
    drawInteraction = new Draw({
      source: vectorSource,
      type: type,
      freehand: freehand,
      style: new Style({
        fill: new Fill({ color: "rgba(255,0,0,0.2)" }),
        stroke: new Stroke({
          color: "red",
          width: 2,
          lineDash: [5, 5],
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: "red" }),
        }),
      }),
    });

    // 事件监听
    drawInteraction.on("drawend", (event) => {
      console.log("绘制完成:", event.feature);
      // 添加自定义属性
      event.feature.set("type", type);
      event.feature.set("timestamp", new Date());
    });

    map.addInteraction(drawInteraction);
  }
});

const toggleDrawing = () => {
  isDrawing.value = !isDrawing.value;
};

const clearAll = () => {
  vectorSource.clear();
};
</script>

<style>
.map-container {
  position: relative;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
}

.map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 4px;
  z-index: 100;
}

.controls select,
.controls button {
  margin-right: 10px;
}
</style>
```

:::

<video controls width="600">
  <source src="./imgs/综合案例.mp4" type="video/mp4" />
  您的浏览器不支持HTML5视频标签。
</video>

### Extent

允许用户通过在地图上点击和拖动来绘制矢量框。绘制完成后，可以通过拖动其顶点或边缘来修改矢量框。此交互仅支持鼠标设备。

**常用配置**：

- `condition`：是否应处理该事件（默认为`always`）
- `extent`：初始范围。默认为无初始范围
- `boxStyle`：绘制范围框的样式
- `pixelTolerance`：像素公差，默认为 10，用于定义用户可以拖动矢量框的距离。
- `pointerStyle`：绘制范围时使用的光标样式

:::details 代码示例

```vue
<template>
  <div ref="mapContainer" id="map"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import "ol/ol.css";
import { platformModifierKeyOnly } from "ol/events/condition";
import Extent from "ol/interaction/Extent.js";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";

const mapContainer = ref(null);
let map = null;
const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 10,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});
onMounted(async () => {
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });

  // 定义一个Extent交互
  const extentInteraction = new Extent({
    condition: platformModifierKeyOnly, // 按住Ctrl键时激活交互
    boxStyle: new Style({
      stroke: new Stroke({
        color: "#ff0000",
        width: 2,
      }),
    }),
  });

  // 将Extent交互添加到地图
  map.addInteraction(extentInteraction);

  // 监听Extent交互的change事件
  extentInteraction.on("extentchanged", (event) => {
    const extent = event.target.getExtent();
    console.log("选择的范围:", extent);
  });
});
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
  <source src="./imgs/extent.mp4" type="video/mp4" />
  您的浏览器不支持HTML5视频标签。
</video>

### Modify

Modify 交互是 OpenLayers 中用于编辑矢量要素的核心工具，允许用户修改点、线、面等几何图形的形状和位置。默认情况下，当按下 alt 键时，交互将允许删除顶点。要使用不同的删除条件配置交互，请使用 deleteCondition 选项

#### 主要配置项

| **选项**                | **类型**               | **默认值**      | **描述**                      |
| ----------------------- | ---------------------- | --------------- | ----------------------------- |
| `features`              | `Collection<Feature>`  | `null`          | 要编辑的要素集合（必填）      |
| `source`                | `VectorSource`         | `null`          | 替代 features，指定整个数据源 |
| `pixelTolerance`        | `number`               | `10`            | 点击容差（像素）              |
| `hitDetection`          | `boolean`              | `true`          | 是否使用精确碰撞检测          |
| `style`                 | `Style\|StyleFunction` | `null`          | 顶点和边的样式                |
| `condition`             | `function`             | `primaryAction` | 顶点移动                      |
| `deleteCondition`       | `function`             | `altKeyOnly`    | 默认 alt 键删除顶点           |
| `insertVertexCondition` | `function`             | `always`        | 插入顶点的条件                |
| `wrapX`                 | `boolean`              | `false`         | 是否跨越日期变更线            |

#### 常用方法

- `setActive(active: boolean)`: 启用/禁用交互
- `removePoint(coordinate)`: 从要素中移除指定顶点

#### 重要事件

| **事件**        | **触发时机**     |
| --------------- | ---------------- |
| `modifystart`   | 开始修改要素     |
| `modifyend`     | 修改完成         |
| `change:active` | 交互激活状态改变 |

#### 综合案例

:::details 代码示例

```vue
<template>
  <div class="map-container">
    <div ref="mapElement" class="map"></div>
    <div class="controls">
      <button @click="toggleEditing">
        {{ editingActive ? "停止编辑" : "开始编辑" }}
      </button>
      <button @click="clearAll">清除所有要素</button>
      <div v-if="selectedFeature" style="color: #4a6fa5">
        <p>当前要素: {{ selectedFeature.get("name") }}</p>
        <p>类型: {{ selectedFeature.getGeometry().getType() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Map, View } from "ol";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { Modify, Select } from "ol/interaction";
import { Circle, Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";
import { Polygon, Point } from "ol/geom";

const mapElement = ref(null);
const editingActive = ref(false);
const selectedFeature = ref(null);

let map = null;
const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 10,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});
let modifyInteraction = null;
let selectInteraction = null;
const vectorSource = new VectorSource({
  features: [
    new Feature({
      // geometry: new Point([116.4074, 39.9042]),
      geometry: new Polygon([
        [
          [116.4074, 39.9042],
          [116.4074, 40.0042],
          [116.5074, 40.0042],
          [116.5074, 39.9042],
          [116.4074, 39.9042],
        ],
      ]),
      name: "北京",
    }),
  ],
});
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: new Style({
    fill: new Fill({ color: "rgba(0, 255, 0, 0.3)" }),
    stroke: new Stroke({ color: "green", width: 2 }),
    image: new Circle({
      radius: 7,
      fill: new Fill({ color: "green" }),
    }),
  }),
});

// 初始化地图
onMounted(() => {
  map = new Map({
    target: mapElement.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
      vectorLayer,
    ],
    view,
  });

  // 添加选择交互
  selectInteraction = new Select({
    style: new Style({
      fill: new Fill({ color: "rgba(255, 0, 0, 0.3)" }),
      stroke: new Stroke({ color: "red", width: 3 }),
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: "red" }),
      }),
    }),
  });

  map.addInteraction(selectInteraction);

  // 监听选择变化
  selectInteraction.on("select", (event) => {
    selectedFeature.value = event.selected[0] || null;
  });
});

// 监听编辑状态变化
watch([editingActive], ([active]) => {
  if (modifyInteraction) {
    map.removeInteraction(modifyInteraction);
    modifyInteraction = null;
  }

  if (active) {
    // 创建自定义顶点样式
    const vertexStyle = new Style({
      image: new Circle({
        radius: 7,
        fill: new Fill({ color: "rgba(255, 0, 0, 0.8)" }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    });

    // 创建Modify交互
    modifyInteraction = new Modify({
      source: vectorSource,
      style: vertexStyle,
    });

    // 事件监听
    modifyInteraction.on("modifystart", (event) => {
      console.log("开始编辑:", event.features.getLength(), "个要素");
    });

    modifyInteraction.on("modifyend", (event) => {
      // 更新修改时间
      event.features.forEach((feature) => {
        feature.set("lastModified", new Date());
      });
      console.log("编辑完成", event.features);
    });

    map.addInteraction(modifyInteraction);
  }
});

const toggleEditing = () => {
  editingActive.value = !editingActive.value;
};

const clearAll = () => {
  vectorSource.clear();
  selectedFeature.value = null;
};
</script>

<style>
.map-container {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
}

.map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.controls button {
  padding: 6px 12px;
  background: #4a6fa5;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.controls button:hover {
  background: #3a5a80;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
```

:::

<video controls width="600">
  <source src="./imgs/编辑图形.mp4" type="video/mp4" />
  您的浏览器不支持HTML5视频标签。
</video>

### PinchRotate

允许用户通过在触摸屏上用两根手指扭曲来旋转地图

### PinchZoom

允许用户通过在触摸屏上用两根手指捏合来缩放地图

### Snap

处理在修改或绘制矢量要素时的自动吸附,更多属性参考[ol/Snap](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Snap-Snap.html)

```js
new Snap({
  source: vectorSource, // 目标数据源
  //   features:Feature, // 吸附的要素
  // 可选配置
  pixelTolerance: 15, // 吸附容差（像素）
  vertex: true, // 是否吸附顶点
  edge: true, // 是否吸附边
});
```

### Translate

用于平移（移动）要素的交互,常和 `Select` 交互一起使用,用于平移选中的要素

#### 主要配置项

- `features`：要平移的要素集合
- `condition`：触发条件（默认为`always`）
- `layers`：平移操作的图层，如果提供了 features ，则不会使用此选项
- `filter`：一个接受 Feature 和 Layer 并返回 true 或 false 的函数。如果提供了 features ，则不会使用此选项

#### 常用方法

- `setActive(active)`：启用/禁用交互

#### 重要事件

- `translatestart`：平移开始事件
- `translateend`：平移结束事件
- `translating`：平移进行中事件

#### 综合案例

:::details 案例代码

```vue
<template>
  <div class="map-container">
    <div ref="mapElement" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Map, View } from "ol";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { Translate, Select } from "ol/interaction";
import { Circle, Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";

const mapElement = ref(null);

let map = null;
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({ source: vectorSource });

const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 10,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});

// 初始化地图
onMounted(() => {
  map = new Map({
    target: mapElement.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
      vectorLayer,
    ],
    view,
  });
  toggleTranslate();
});

// 切换平移模式
const toggleTranslate = () => {
  // 创建多边形要素
  const polygonCoords = [
    [116.4074, 39.9042],
    [116.5074, 39.9042],
    [116.5074, 39.8042],
    [116.4074, 39.8042],
    [116.4074, 39.9042],
  ];
  const polygon = new Feature({
    geometry: new Polygon([polygonCoords]),
    name: "Polygon",
  });
  vectorSource.addFeature(polygon);

  const select = new Select({
    style: new Style({
      fill: new Fill({ color: "rgba(255, 0, 0, 0.5)" }),
      stroke: new Stroke({ color: "red", width: 3 }),
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: "red" }),
      }),
    }),
  });
  map.addInteraction(select);

  // 创建平移交互
  const translateInteraction = new Translate({
    features: select.getFeatures(),
  });

  // 添加事件监听
  translateInteraction.on("translatestart", (event) => {
    console.log("开始平移:");
  });

  translateInteraction.on("translating", (event) => {
    console.log("平移中:", event.coordinate);
  });

  translateInteraction.on("translateend", (event) => {
    console.log("平移结束");
  });

  map.addInteraction(translateInteraction);
};
</script>

<style>
.map-container {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
}

.map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
```

:::

<video controls width="600">
  <source src="./imgs/平移.mp4" type="video/mp4" />
  您的浏览器不支持HTML5视频标签。
</video>


## Select

Select 交互用于选择矢量要素的交互选中的要素会以不同的样式显示，可用于视觉高亮显示，以及选择用于其他操作（如修改或输出）。

### 主要配置说明

| **参数**          | **类型**               | **默认值**    | **描述**                                             |
| ----------------- | ---------------------- | ------------- | ---------------------------------------------------- |
| `condition`       | `function`             | `singleClick` | 触发选择的鼠标条件                                   |
| `addCondition`    | `function`             | `never`       | 使用不同的添加和删除事件而不是 toggle ，则使用此选项 |
| `toggleCondition` | `function`             | `never`       | 切换选择状态的条件                                   |
| `removeCondition` | `function`             | `never`       | 移除选择的条件                                       |
| `multi`           | `boolean`              | `false`       | 是否允许多选                                         |
| `layers`          | `Array<Layer>`         | `null`        | 指定可选择要素所在的图层                             |
| `features`        | `Collection<Feature>`  | `null`        | 指定可选择要素                                       |
| `filter`          | `function`             | `null`        | 过滤哪些要素可以被选择                               |
| `hitTolerance`    | `number`               | `0`           | 增加点击的容差范围（像素）                           |
| `style`           | `Style或StyleFunction` | `null`        | 选中要素的样式，默认使用要素本身的样式               |

### 核心方法

- `getFeatures(): Collection<Feature>`：返回当前选中的要素集合（Collection）。该集合是响应式的，可以直接操作（添加/移除要素）来改变选择状态。
- `setHitTolerance(tolerance: number)`：设置选择要素的点击容差（像素）。例如，设置为 5，则距离要素 5 像素内的点击都能选中该要素。
- `setActive(active: boolean)`：激活或禁用选择交互。

### 事件

- `select`：当 Feature 被选中或取消时触发

### 综合案例

:::details 鼠标移动区域变色

```vue
<template>
  <div ref="mapContainer" id="map"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Map from "ol/Map.js";
import XYZ from "ol/source/XYZ.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import GeoJSON from "ol/format/GeoJSON.js";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import "ol/ol.css";
import Select from "ol/interaction/Select.js";
import { pointerMove } from "ol/events/condition";
const mapContainer = ref(null);
let map = null;
const view = new View({
  center: [116.4074, 39.9042], // 北京市中心经纬度
  zoom: 5,
  projection: "EPSG:4326", // 默认使用Web Mercator投影，需要设置为EPSG:4326经纬度
  // extent: [73.66, 3.86, 135.05, 53.55], // 设置地图平移范围（当前为中国区域）
});
onMounted(async () => {
  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        // 设置高德地图为数据源底图
        source: new XYZ({
          // 设置路网图层
          url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
        }),
      }),
    ],
    view,
  });

  // 加载jeojson数据，给每个省添加随机色
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      url: "https://geojson.cn/api/china/1.6.2/china.json", // 替换为你的GeoJSON数据URL
      format: new GeoJSON(),
    }),
    style: () => {
      return new Style({
        fill: new Fill({
          color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256
          )}, ${Math.floor(Math.random() * 256)}, 0.6)`, // 随机颜色
        }),
        stroke: new Stroke({
          color: "#000",
          width: 1,
        }),
      });
    },
  });
  map.addLayer(vectorLayer);

  // 选中省份变色
  const select = new Select({
    condition: pointerMove, // 默认为选中，当前为触摸
  });
  map.addInteraction(select);
  select.on("select", (e) => {
    e.selected[0] &&
      e.selected[0].setStyle(
        new Style({
          fill: new Fill({
            color: "rgba(255, 0, 0, 0.8)",
          }),
        })
      );
  });
});
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
  <source src="./imgs/Select交互.mp4" type="video/mp4" />
  您的浏览器不支持HTML5视频标签。
</video>
