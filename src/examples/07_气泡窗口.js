// 07_气泡窗口
// 天地图TOKEN
const token = "2b34f6afbcd235c2bc4bed3f7735f1f5";

// 隐藏默认控件
viewer.geocoder.container.style.display = 'none';
viewer.homeButton.container.style.display = 'none';
viewer.sceneModePicker.container.style.display = 'none';
viewer.baseLayerPicker.container.style.display = 'none';
viewer.navigationHelpButton.container.style.display = 'none';
viewer.animation.container.style.display = 'none';
viewer.timeline.container.style.display = 'none';
viewer.fullscreenButton.container.style.display = 'none';

// 清空logo
viewer.cesiumWidget.creditContainer.style.display = "none";

// 移除默认底图
viewer.imageryLayers.removeAll();

// 设置相机视角
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(121.4737, 31.2304, 5000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-90),
    roll: 0,
  },
});

// 创建气泡窗口元素
const popup = document.createElement('div');
popup.className = 'popup-window';
popup.innerHTML = '气泡窗口';
popup.style.cssText = `
  position: absolute;
  padding: 12px 18px;
  background-color: rgba(44, 62, 80, 0.85);
  color: #ecf0f1;
  border: 1px solid #3498db;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  text-align: center;
  min-width: 120px;
  pointer-events: none;
  transform: translate(-50%, -100%);
  z-index: 1000;
`;

// 添加到 viewer 容器
viewer.container.appendChild(popup);

// 添加preRender事件，使窗口位置保持不变
viewer.scene.preRender.addEventListener(function () {
  const htmlPop = viewer.scene.cartesianToCanvasCoordinates(
    Cesium.Cartesian3.fromDegrees(121.4737, 31.2304, 0),
    new Cesium.Cartesian2()
  );
  if (popup && htmlPop) {
    popup.style.left = htmlPop.x + "px";
    popup.style.top = htmlPop.y + "px";
  }
});

// 加载天地图
const tiandituProvider = new Cesium.WebMapTileServiceImageryProvider({
  url:
    "http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
    token,
  layer: "img",
  style: "default",
  format: "tiles",
  tileMatrixSetID: "w",
  subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
  maximumLevel: 18,
  credit: new Cesium.Credit("天地图影像"),
});

// 添加地理标注
const labelProvider = new Cesium.WebMapTileServiceImageryProvider({
  url:
    "http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&tileMatrix={TileMatrix}&tileRow={TileRow}&tileCol={TileCol}&style=default&format=tiles&tk=" +
    token,
  layer: "img",
  style: "default",
  format: "tiles",
  tileMatrixSetID: "w",
  subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
  maximumLevel: 18,
  credit: new Cesium.Credit("天地图影像"),
});

viewer.imageryLayers.addImageryProvider(tiandituProvider);
viewer.imageryLayers.addImageryProvider(labelProvider);

// 清理函数
onUnmounted(() => {
  if (popup && popup.parentNode) {
    popup.parentNode.removeChild(popup);
  }
});
