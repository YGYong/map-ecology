// 02_天地图影像
// 天地图TOKEN
const token = "05be06461004055923091de7f3e51aa6";

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

// 加载天地图影像
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

viewer.imageryLayers.addImageryProvider(tiandituProvider);
