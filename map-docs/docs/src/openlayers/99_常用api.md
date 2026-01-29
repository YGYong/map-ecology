# 常用 API

## coordinate

一个表示 xy 、 xyz 或 xyzm 坐标的数字数组。示例： [16, 48]

### add

```js
import { add } from "ol/coordinate.js";

const coord = [7.85, 47.983333];
add(coord, [-2, 4]);
console.log(coord); // 输出: [5.85, 51.983333]
```

### createStringXY

```js
import { createStringXY } from "ol/coordinate.js";

const coord = [7.85, 47.983333];
const stringifyFunc = createStringXY(2); // 保留两位小数
const out = stringifyFunc(coord);
console.log("坐标转换结果:", out); // 输出: "7.85, 47.98"
```

### format

```js
import { format } from "ol/coordinate.js";

const coord = [7.85, 47.983333];
const template = "Coordinate is ({x}|{y})."; // 一个带有 {x} 和 {y} 占位符的模板字符串，将被第一个和第二个坐标值替换
const out = format(coord, template, 2); // 保留两位小数
console.log("Formatted coordinate:", out); // 输出: "Coordinate is (7.85|47.98)."
```

### toStringXY

```js
import { toStringXY } from "ol/coordinate.js";
const coord = [7.85, 47.983333];
const out = toStringXY(coord, 2);
console.log("坐标转换结果:", out); // 输出: "7.85, 47.98"
```

## easing

- `easeIn`:开始慢速，逐渐加速
- `easeOut`:开始快，然后变慢
- `inAndOut`:慢慢开始，逐渐加速，然后再次减速
- `linear`:匀速运动
- `upAndDown`:先加速后减速，形成一个抛

```js
import { easeIn } from "ol/easing.js";

view.animate({
  center: [118.5, 39.9],
  zoom: 14,
  duration: 2000,
  easing: easeIn,
});
```

## Condition

用于鼠标键盘交互

- `altKeyOnly`：按下 alt 键
- `altShiftKeysOnly`：按下 alt 键和 shift 键
- `always`：始终为 true
- `click`：如果事件是点击事件，返回 true ，否则返回 false 。
- `doubleClick`：如果事件是地图 dblclick 事件，则返回 true ，否则返回 false 。
- `focus`：如果地图拥有焦点，则返回 true 。此条件需要一个具有 tabindex 属性的地图目标元素，例如 `<div id="map" tabindex="1"> `。
- `mouseOnly`：如果事件来自鼠标设备，则返回 true 。
- `never`：始终为 false
- `noModifierKeys`：如果没有按下修饰键（alt、ctrl、meta 或 shift），则返回 true 。
- `platformModifierKey`：如果按下平台修饰键（alt 键或 meta 键），则返回 true 。
- `platformModifierKeyOnly`：仅按下平台修饰键（Mac 上的 meta 键，否则为 ctrl 键），则返回 true
- `pointerMove`：指针移动
- `primaryAction`：如果事件是主操作（如点击或拖动），则返回 true 。
- `shiftKeyOnly`：仅按下 shift 键。
- `singleClick`：单击

```js
const dragBox = new DragZoom({
  condition: platformModifierKeyOnly, // 按住ctrl键,鼠标拖拽绘制矩形
});
```

## sphere

### getArea(geometry, options)

获取几何体的球面面积，返回几何体的球面面积（单位：平方米）

#### 参数

- `geometry`：要计算面积的几何体。
- `options`：可选参数，用于配置计算。
  - `projection`：投影，用于将几何体坐标转换为平面坐标。默认值为 `EPSG:3857` ，即 Web 墨卡托投影。
  - `radius`：球体半径，用于计算面积。默认值为 `6371008.8` ，即地球平均半径（单位：米）。

#### 示例

```js
import { getArea } from "ol/sphere";
import { Polygon } from "ol/geom.js";

const geometry = new Polygon([
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0],
  ],
]);
const area = getArea(geometry, {
  projection: "EPSG:4326",
});
```

### getDistance(coord1, coord2, radius)

获取两个地理坐标之间的大圆距离（以米为单位）

#### 参数

- `coord1`：第一个坐标，格式为 `[经度, 纬度]` 。
- `coord2`：第二个坐标，格式为 `[经度, 纬度]` 。
- `radius`：可选参数，球体半径，使用的球体半径。默认为使用 WGS84 椭球体的地球平均半径。

#### 示例

```js
import { getDistance } from "ol/sphere";

const coord1 = [10, 20];
const coord2 = [30, 40];
const distance = getDistance(coord1, coord2);
```

### getLength(geometry, options)

获取几何体的长度（单位：米）

#### 参数

- `geometry`：要计算长度的几何体。
- `options`：可选参数，用于配置计算。
  - `projection`：投影，用于将几何体坐标转换为平面坐标。默认值为 `EPSG:3857` ，即 Web 墨卡托投影。
  - `radius`：球体半径，用于计算长度。默认值为 `6371008.8` ，即地球平均半径（单位：米）。

#### 示例

```js
import { getLength } from "ol/sphere";
import { LineString } from "ol/geom.js";

const line = new LineString([
  [116.4074, 39.9042],
  [118.7784, 32.0647],
]);
const length = getLength(line, {
  projection: "EPSG:4326",
});
```
