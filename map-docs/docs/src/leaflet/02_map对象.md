### 🗺️ 一、初始化与基本配置

#### 控件选项

| 参数                 | 类型      | 默认值 | 说明                       |
| -------------------- | --------- | ------ | -------------------------- |
| `attributionControl` | `Boolean` | `true` | 是否显示右下角版权信息控件 |
| `zoomControl`        | `Boolean` | `true` | 是否显示左上角缩放控件     |

#### 交互选项

| 参数                | 类型              | 默认值 | 说明                                                         |
| ------------------- | ----------------- | ------ | ------------------------------------------------------------ |
| `dragging`          | `Boolean`         | `true` | 是否允许鼠标/触摸拖动地图                                    |
| `closePopupOnClick` | `Boolean`         | `true` | 点击地图关闭弹窗                                             |
| `doubleClickZoom`   | `Boolean\|String` | `true` | 双击缩放（`'center'` 表示固定中心缩放）                      |
| `boxZoom`           | `Boolean`         | `true` | 是否允许按住 `Shift` + 拖动矩形框缩放                        |
| `zoomSnap`          | `Number`          | 1      | 强制地图的缩放级别始终是这个的倍数                           |
| `zoomDelta`         | `Number`          | 1      | 缩放级别在 zoomIn() 、 zoomOut() 、 或使用缩放控件后变化多少 |
| `trackResize`       | `Boolean`         | `true` | 地图是否随窗口大小调整                                       |

#### 平移惯性选项

| 参数                  | 类型      | 默认值   | 说明                                                    |
| --------------------- | --------- | -------- | ------------------------------------------------------- |
| `inertia`             | `Boolean` | -        | 如果启用，地图平移将具有惯性效果,默认启用               |
| `inertiaDeceleration` | `Number`  | 3000     | 惯性移动减速的速率，单位为像素/秒 ²。                   |
| `inertiaMaxSpeed`     | `Number`  | Infinity | 惯性移动的最大速度，单位为像素/秒                       |
| `easeLinearity`       | `Number`  | 0.2      | 惯性移动的线性度，值越小越线性                          |
| `worldCopyJump`       | `Boolean` | `false`  | 启用世界拷贝跳转（启用后，地图会在 180 度经线处断开）   |
| `maxBoundsViscosity`  | `Number`  | 0.0      | 设置了 maxBounds 后, 0.0 允许用户以正常速度拖动到边界外 |

#### 键盘导航选项

| 参数               | 类型      | 默认值 | 说明                                        |
| ------------------ | --------- | ------ | ------------------------------------------- |
| `keyboard`         | `Boolean` | `true` | 允许用户使用键盘箭头键和 + / - 键来导航地图 |
| `keyboardPanDelta` | `Number`  | 80     | 按下箭头键时平移的像素数量                  |

#### 鼠标滚轮选项

| 参数                  | 类型      | 默认值 | 说明                             |
| --------------------- | --------- | ------ | -------------------------------- |
| `scrollWheelZoom`     | `Boolean` | `true` | 是否启用鼠标滚轮缩放             |
| `wheelDebounceTime`   | `Number`  | 40     | 限制滚轮触发速率（以毫秒为单位） |
| `wheelPxPerZoomLevel` | `Number`  | 60     | 鼠标滚轮每一级别缩放的像素数量   |

#### 触摸交互选项

| 参数                 | 类型             | 默认值 | 说明                                                 |
| -------------------- | ---------------- | ------ | ---------------------------------------------------- |
| `touchZoom`          | `Boolean/String` | \*     | 是否启用触摸缩放交互                                 |
| `tapHold`            | `Boolean`        | -      | 启用 contextmenu 事件的模拟，移动 Safari 为 true     |
| `tapTolerance`       | `Number`         | 15     | 用户在触摸时可以移动手指的最大像素数                 |
| `bounceAtZoomLimits` | `Boolean`        | `true` | 当用户缩放地图到最大或最小缩放级别时，地图是否会反弹 |

#### 地图状态

| 参数                | 类型           | 默认值           | 说明                                   |
| ------------------- | -------------- | ---------------- | -------------------------------------- |
| `center`            | `LatLng`       | -                | 初始中心坐标（如 `[51.505, -0.09]`）   |
| `zoom`              | `Number`       | -                | 初始缩放级别（如 `13`）                |
| `crs`               | `CRS`          | `L.CRS.EPSG3857` | 使用的坐标参考系统                     |
| `minZoom`/`maxZoom` | `Number`       | -                | 最小/最大缩放级别                      |
| `layers`            | `Array`        | -                | 地图图层数组                           |
| `maxBounds`         | `LatLngBounds` | -                | 地图边界限制（用户无法平移超出此范围） |
| `renderer`          | `Renderer`     | -                | 在地图上绘制矢量层的默认方法           |

#### 动画选项

| 参数                     | 类型      | 默认值 | 说明                                     |
| ------------------------ | --------- | ------ | ---------------------------------------- |
| `zoomAnimation`          | `Boolean` | `true` | 是否启用缩放动画（Android 默认禁用）     |
| `zoomAnimationThreshold` | `Number`  | 4      | 如果缩放差异超过此值，则不会进行缩放动画 |
| `fadeAnimation`          | `Boolean` | `true` | 是否启用图层淡入淡出动画                 |
| `markerZoomAnimation`    | `Boolean` | `true` | 标记是否随缩放动画同步显示               |
| `transform3DLimit`       | `Number`  | 2^23   | 定义 CSS 平移变换的最大尺寸              |

---

### ⚙️ 二、核心常用属性

| 属性名        | 类型           | 说明                                                    |
| ------------- | -------------- | ------------------------------------------------------- |
| `zoom`        | `Number`       | 当前缩放级别                                            |
| `center`      | `LatLng`       | 地图中心点坐标                                          |
| `maxBounds`   | `LatLngBounds` | 当前地图可视区域边界                                    |
| `layers`      | `Array`        | 已添加到地图的所有图层                                  |
| `zoomControl` | `Control.Zoom` | 缩放控件实例（可通过 `map.zoomControl.disable()` 禁用） |
| `dragging`    | `Handler`      | 拖拽交互处理器实例                                      |
| `boxZoom`     | `Handler`      | 框选缩放交互处理器实例                                  |

---

### 事件

#### 图层事件

| 事件              | 说明                     |
| ----------------- | ------------------------ |
| `layeradd`        | 图层添加到地图时触发     |
| `layerremove`     | 图层从地图移除时触发     |
| `overlayadd`      | 叠加图层添加到地图时触发 |
| `overlayremove`   | 叠加图层从地图移除时触发 |
| `baselayerchange` | 底图图层切换时触发       |

#### 地图状态变化事件

| 事件               | 说明                                                    |
| ------------------ | ------------------------------------------------------- |
| `zoomlevelschange` | 当因添加或移除图层导致地图上的缩放级别发生变化时触发    |
| `resize`           | 地图尺寸变化时触发                                      |
| `load`             | 地图加载完成时触发                                      |
| `unload`           | 当使用 remove 方法销毁地图时触发                        |
| `viewreset`        | 当地图需要重绘其内容时触发,对于创建自定义覆盖物非常有用 |
| `zoomstart`        | 地图缩放开始时触发                                      |
| `movestart`        | 地图移动开始时触发                                      |
| `move`             | 地图移动时触发                                          |
| `moveend`          | 地图移动结束时触发                                      |
| `zoom`             | 地图缩放时触发                                          |
| `zoomend`          | 地图缩放结束时触发                                      |

#### 弹窗事件

| 事件           | 说明                                 |
| -------------- | ------------------------------------ |
| `popupopen`    | 弹窗打开时触发                       |
| `popupclose`   | 弹窗关闭时触发                       |
| `autopanstart` | 当地图在打开弹窗时开始自动平移时触发 |

#### 工具提示事件

| 事件           | 说明                       |
| -------------- | -------------------------- |
| `tooltipopen`  | 当地图中打开提示框时触发   |
| `tooltipclose` | 当地图中的提示框关闭时触发 |

#### 位置事件

| 事件            | 说明           |
| --------------- | -------------- |
| `locationfound` | 定位成功时触发 |
| `locationerror` | 定位失败时触发 |

#### 交互事件

| 事件          | 说明                     |
| ------------- | ------------------------ |
| `click`       | 地图点击事件             |
| `dblclick`    | 地图双击事件             |
| `mousedown`   | 鼠标按下事件             |
| `mouseup`     | 鼠标抬起事件             |
| `mouseover`   | 鼠标移入事件             |
| `mouseout`    | 鼠标移出事件             |
| `mousemove`   | 鼠标移动事件             |
| `contextmenu` | 鼠标右键点击事件         |
| `keydown`     | 键盘按下事件             |
| `keyup`       | 键盘抬起事件             |
| `preclick`    | 在地图上鼠标点击之前触发 |

#### 其他事件

| 事件类型   | 触发时机                   |
| ---------- | -------------------------- |
| `zoomanim` | 在每次缩放动画至少触发一次 |

### ⚡️ 三、核心方法

#### 1. 图层与控件管理

| 方法名                   | 返回值    | 说明                                 |
| ------------------------ | --------- | ------------------------------------ |
| `addLayer(layer)`        | `this`    | 添加图层（如 `TileLayer`, `Marker`） |
| `removeLayer(layer)`     | `this`    | 移除指定图层                         |
| `hasLayer(layer)`        | `Boolean` | 检查图层是否存在                     |
| `addControl(control)`    | `this`    | 添加控件（如 `L.control.scale()`）   |
| `removeControl(control)` | `this`    | 移除控件                             |
| `eachLayer(callback)`    | `this`    | 遍历所有图层                         |
| `openPopup(popup)`       | `this`    | 打开指定弹窗（自动关闭其他弹窗）     |
| `closePopup(popup?)`     | `this`    | 关闭弹窗（不指定则关闭所有）         |
| `openTooltip(tooltip)`   | `this`    | 打开指定工具提示                     |
| `closeTooltip(tooltip?)` | `this`    | 关闭工具提示（不指定则关闭所有）     |

#### 2. 视图操作

| 方法名                               | 返回值 | 说明                                       |
| ------------------------------------ | ------ | ------------------------------------------ |
| `setView(center, zoom, options?)`    | `this` | 设置中心点和缩放级别（带动画）             |
| `setZoom(zoom)`                      | `this` | 直接设置缩放级别（无动画）                 |
| `zoomIn(options?)`                   | `this` | 放大地图（带动画）                         |
| `zoomOut(options?)`                  | `this` | 缩小地图（带动画）                         |
| `setZoomAround(latlng, zoom)`        | `this` | 围绕指定点缩放（保持该点位置不变）         |
| `fitBounds(bounds, options?)`        | `this` | 自适应调整视图以完整显示给定区域           |
| `fitWorld(options?)`                 | `this` | 自适应调整视图以显示整个世界               |
| `panTo(latlng, options?)`            | `this` | 平移到指定坐标（平滑移动）                 |
| `panBy(offset, options?)`            | `this` | 平移地图（带动画效果）                     |
| `flyTo(latlng, zoom, options?)`      | `this` | 平滑飞行到目标位置（动画效果）             |
| `flyToBounds(bounds, options?)`      | `this` | 设置地图视图，执行类似 flyTo 的平滑动画    |
| `setMaxBounds(bounds)`               | `this` | 设置地图最大可显示区域                     |
| `setMinZoom(zoom)`                   | `this` | 设置地图允许的最小缩放级别                 |
| `setMaxZoom(zoom)`                   | `this` | 设置地图允许的最大缩放级别                 |
| `panInsideBounds(latlng, options?)`  | `this` | 平移地图，确保指定点在最大可显示区域内     |
| `panInsideMinZoom(latlng, options?)` | `this` | 平移地图，确保指定点在最小可显示区域内     |
| `invalidateSize(options?)`           | `this` | 强制重新计算地图尺寸（容器大小变化后调用） |
| `stop()`                             | `this` | 停止地图动画                               |

#### 3. 状态获取

| 方法名                           | 返回值         | 说明                             |
| -------------------------------- | -------------- | -------------------------------- |
| `getCenter()`                    | `LatLng`       | 返回当前中心点                   |
| `getZoom()`                      | `Number`       | 返回当前缩放级别                 |
| `getBounds()`                    | `LatLngBounds` | 返回地图可视区域边界             |
| `getMinZoom()`                   | `Number`       | 获取地图允许的最小缩放级别       |
| `getMaxZoom()`                   | `Number`       | 获取地图允许的最大缩放级别       |
| `getBoundsZoom(bounds,padding?)` | `Number`       | 返回地图可视区域的缩放级别       |
| `getSize()`                      | `Point`        | 返回地图容器的像素尺寸           |
| `getPixelBounds()`               | `LatLngBounds` | 返回地图可视区域边界的像素坐标   |
| `getPixelOrigin()`               | `Point`        | 返回地图容器的像素坐标原点       |
| `getPixelWorldBounds()`          | `LatLngBounds` | 返回 zoom 级别的世界边界像素坐标 |

##### padding

| 选项名               | 类型    | 默认值 | 说明                             |
| -------------------- | ------- | ------ | -------------------------------- |
| `padding`            | `Point` | [0, 0] | 地图边界与视图边界的间距（像素） |
| `paddingTopLeft`     | `Point` | [0, 0] | 设置地图容器左上角的填充量       |
| `paddingBottomRight` | `Point` | [0, 0] | 地图右下角的填充量               |

#### 4. 地理定位

| 方法名             | 返回值 | 说明             |
| ------------------ | ------ | ---------------- |
| `locate(options?)` | `this` | 获取用户位置     |
| `stopLocate()`     | `this` | 停止持续定位监听 |

##### options

| 选项名               | 类型      | 默认值     | 说明                     |
| -------------------- | --------- | ---------- | ------------------------ |
| `enableHighAccuracy` | `Boolean` | `false`    | 启用高精度定位           |
| `maximumAge`         | `Number`  | `0`        | 定位结果缓存时间（毫秒） |
| `timeout`            | `Number`  | `Infinity` | 定位超时时间（毫秒）     |
| `watch`              | `Boolean` | `false`    | 启用监听模式             |
| `setView`            | `Boolean` | `false`    | 定位成功后是否设置视图   |
| `maxZoom`            | `Number`  | `Infinity` | 定位成功后最大缩放级别   |

#### 5. 转换方法

| 方法名                              | 返回值         | 说明                                                 |
| ----------------------------------- | -------------- | ---------------------------------------------------- |
| `latLngToLayerPoint(latlng)`        | `Point`        | 将地理坐标转为视图内像素坐标（相对于地图容器左上角） |
| `layerPointToLatLng(point)`         | `LatLng`       | 将视图内像素坐标转为地理坐标                         |
| `latLngToContainerPoint(latlng)`    | `Point`        | 将地理坐标转为容器像素坐标（包含滚动条偏移）         |
| `containerPointToLayerPoint(point)` | `Point`        | 将容器像素坐标转为视图内像素坐标                     |
| `containerPointToLatLng(point)`     | `LatLng`       | 将容器像素坐标转为地理坐标                           |
| `layerPointToContainerPoint(point)` | `Point`        | 将视图内像素坐标转为容器像素坐标                     |
| `mouseEventToLayerPoint(e)`         | `Point`        | 将鼠标事件坐标转为视图内像素坐标                     |
| `mouseEventToContainerPoint(e)`     | `Point`        | 将鼠标事件坐标转为容器像素坐标                       |
| `mouseEventToLatLng(e)`             | `LatLng`       | 将鼠标事件坐标直接转为地理坐标                       |
| `project(latlng, zoom)`             | `Point`        | 将地理坐标转为投影坐标系像素坐标（基于 CRS 原点）    |
| `unproject(point, zoom)`            | `LatLng`       | 将投影坐标系像素坐标转为地理坐标                     |
| `wrapLatLng(latlng)`                | `LatLng`       | 将经纬度规范到 CRS 范围内（如经度-180°~180°）        |
| `wrapLatLngBounds(bounds)`          | `LatLngBounds` | 将经纬度边界规范到 CRS 范围内（如经度-180°~180°）    |
| `distance(latlng1, latlng2)`        | `Number`       | 计算两点间地理距离（单位：米）                       |
| `getZoomScale(toZoom, fromZoom)`    | `Number`       | 计算两个缩放级别间的比例因子                         |
| `getScaleZoom(scale, fromZoom)`     | `Number`       | 根据比例因子计算目标缩放级别                         |

#### 6. 其他方法

| 方法名                              | 返回值        | 说明                                                   |
| ----------------------------------- | ------------- | ------------------------------------------------------ |
| `removeHandler(eventName, handler)` | `this`        | 销毁地图并清除所有相关的事件监听器                     |
| `addHandler(eventName, handler)`    | `this`        | 向地图添加一个新的 Handler ，需要提供其名称和构造函数  |
| `createPane(name)`                  | `this`        | 创建一个新的图层叠层，需要提供图层叠层的名称           |
| `getPane(HTMLElement)`              | `HTMLElement` | 根据其名称或其 HTML 元素（其标识）返回一个地图面板     |
| `getPanes()`                        | `Object`      | 返回一个普通对象，其中包含所有层的名称作为键，层作为值 |
| `getContainer()`                    | `HTMLElement` | 返回地图容器的 HTML 元素（其标识）                     |

---
