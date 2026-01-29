# extent 介绍

在 OpenLayers 中，extent（范围）是一个表示地理区域边界的数组，格式为 [minX, minY, maxX, maxY]。它用于定义地图的可见区域、图层范围、几何边界等

## 模块导入

导入 ol/extent 模块

```js
import * as extent from "ol/extent";
```

## createEmpty()

创建一个空范围（[Infinity, Infinity, -Infinity, -Infinity]）。

```js
const emptyExtent = extent.createEmpty(); // [Infinity, Infinity, -Infinity, -Infinity]
```

## isEmpty(extent)

检查范围是否为空。

```js
extent.isEmpty([1, 2, 3, 4]); // false
```

## getWidth(extent)、getHeight(extent)

计算范围的宽度和高度。

```js
const width = extent.getWidth([0, 0, 10, 20]); // 10
const height = extent.getHeight([0, 0, 10, 20]); // 20
```

## getCenter(extent)

返回范围的中心点坐标 [x, y]。

```js
const center = extent.getCenter([0, 0, 10, 10]); // [5, 5]
```

## containsCoordinate(extent, coordinate)

检查坐标是否在范围内。

```js
extent.containsCoordinate([0, 0, 10, 10], [5, 5]); // true
```

## containsExtent(extent1, extent2)

检查 extent1 是否完全包含 extent2。

```js
extent.containsExtent([0, 0, 20, 20], [5, 5, 15, 15]); // true
```

## intersects(extent1, extent2)

判断两个范围是否相交。

```js
extent.intersects([0, 0, 10, 10], [5, 5, 15, 15]); // true
```

## buffer(extent, value)

扩展范围（负值则缩小）。

```js
const buffered = extent.buffer([0, 0, 10, 10], 2); // [-2,-2,12,12]
```

## getIntersection(extent1, extent2)

返回两个范围的交集（无交集时返回 null）。

```js
const intersection = extent.getIntersection([0, 0, 10, 10], [5, 5, 15, 15]); // [5,5,10,10]
```

## boundingExtent(coordinates)

根据坐标数组计算最小包围范围：

```js
const coords = [
  [0, 0],
  [5, 10],
  [10, 0],
];
const bbox = extent.boundingExtent(coords); // [0,0,10,10]
```
