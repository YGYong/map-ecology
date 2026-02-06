<template>
    <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
// 参考：https://jiawanlong.github.io/Cesium-Examples/examples/cesiumEx/editor.html#5.3.11%E3%80%81%E9%9B%B7%E8%BE%BE%E9%81%AE%E7%BD%A9%E6%89%AB%E6%8F%8F
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;
// 管理防御圈实体
let fenceEntities = [];

// 天地图TOKEN
const token = window.TIANDITU_TOKEN;

onMounted(() => {
    // 初始化Viewer
    viewer = new Cesium.Viewer(cesiumContainer.value, {
        geocoder: false, // 关闭地理编码搜索
        homeButton: false, // 关闭主页按钮
        sceneModePicker: false, // 关闭场景模式选择器
        baseLayerPicker: false, // 关闭底图选择器
        navigationHelpButton: false, // 关闭导航帮助
        animation: false, // 关闭动画控件
        timeline: false, // 关闭时间轴
        fullscreenButton: false, // 关闭全屏按钮
        baseLayer: false, // 关闭默认地图
    });
    // 清空logo
    viewer.cesiumWidget.creditContainer.style.display = "none";
    initMap();
    // 添加一个雷达扫描示例
    createSampleRadarFence();
});

// 计算雷达扫描的点位（参考开源代码实现）
// https://jiawanlong.github.io/Cesium-Examples/examples/cesiumEx/examples.html#mapping
const calcRadarPoints = (centerLon, centerLat, radius, heading) => {
    // 计算扫描线的终点
    const m = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(centerLon, centerLat),
    );
    const rx = radius * Math.cos((heading * Math.PI) / 180.0);
    const ry = radius * Math.sin((heading * Math.PI) / 180.0);
    const translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
    const d = Cesium.Matrix4.multiplyByPoint(
        m,
        translation,
        new Cesium.Cartesian3(),
    );
    const c = Cesium.Cartographic.fromCartesian(d);
    const endLon = Cesium.Math.toDegrees(c.longitude);
    const endLat = Cesium.Math.toDegrees(c.latitude);

    // 计算扇形的点
    return computeCircularFlight(centerLon, centerLat, endLon, endLat, 0, 90);
};

// 计算圆弧飞行路径点
const computeCircularFlight = (x1, y1, x2, y2, startAngle, sweepAngle) => {
    const positionArr = [];

    // 中心点
    positionArr.push(x1, y1, 0);

    const radius = Cesium.Cartesian3.distance(
        Cesium.Cartesian3.fromDegrees(x1, y1),
        Cesium.Cartesian3.fromDegrees(x2, y2),
    );

    // 生成扇形边缘的点
    for (let i = startAngle; i <= startAngle + sweepAngle; i++) {
        const h = radius * Math.sin((i * Math.PI) / 180.0);
        const r = Math.cos((i * Math.PI) / 180.0);
        const x = (x2 - x1) * r + x1;
        const y = (y2 - y1) * r + y1;
        positionArr.push(x, y, h);
    }

    return positionArr;
};

// 添加一个模拟雷达扫描示例
const createSampleRadarFence = () => {
    if (!viewer) return;
    const centerLon = 118.7969; // 南京经度
    const centerLat = 32.0603; // 南京纬度
    const maxDistance = 5000; // 半径，单位米
    const cesiumColor = Cesium.Color.fromCssColorString("#ff3333");

    let heading = 0;
    let positionArr = calcRadarPoints(centerLon, centerLat, maxDistance, heading);

    const radarEntity = viewer.entities.add({
        id: `sample-radar`,
        name: `模拟雷达扫描`,
        position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 0),
        wall: {
            positions: new Cesium.CallbackProperty(() => {
                return Cesium.Cartesian3.fromDegreesArrayHeights(positionArr);
            }, false),
            material: cesiumColor.withAlpha(0.5),
            outline: false,
        },
        ellipsoid: {
            radii: new Cesium.Cartesian3(maxDistance, maxDistance, maxDistance),
            maximumCone: Cesium.Math.toRadians(90),
            material: cesiumColor.withAlpha(0.2),
            outline: true,
            outlineColor: cesiumColor.withAlpha(0.6),
            outlineWidth: 1,
        },
    });
    fenceEntities.push(radarEntity);

    // 底部光环
    const circlePositions = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const dx = Math.cos(angle) * maxDistance;
        const dy = Math.sin(angle) * maxDistance;
        const lon =
            centerLon + dx / (111320 * Math.cos((centerLat * Math.PI) / 180));
        const lat = centerLat + dy / 111320;
        circlePositions.push(Cesium.Cartesian3.fromDegrees(lon, lat, 2));
    }

    const outerGlowCircleEntity = viewer.entities.add({
        id: `sample-nanjing-radar-circle`,
        name: `南京-雷达外环`,
        polyline: {
            positions: circlePositions,
            width: 12,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.15,
                taperPower: 1.0,
                color: cesiumColor.withAlpha(0.6),
            }),
            clampToGround: true,
        },
    });
    fenceEntities.push(outerGlowCircleEntity);

    // 旋转动画
    viewer.clock.onTick.addEventListener(() => {
        heading += 4.0;
        if (heading >= 360) heading = 0;
        positionArr = calcRadarPoints(centerLon, centerLat, maxDistance, heading);
    });

    // 定位
    viewer.camera.lookAt(
        Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 0),
        new Cesium.HeadingPitchRange(0, -30 * (Math.PI / 180), 20000),
    );
    // 取消绑定
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
};

// 加载天地图
const initMap = () => {
    // 以下为天地图及天地图标注加载
    const tiandituProvider = new Cesium.WebMapTileServiceImageryProvider({
        url:
            "http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
            token,
        layer: "img",
        style: "default",
        format: "tiles",
        tileMatrixSetID: "w",
        subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"], // 子域名
        maximumLevel: 18,
        credit: new Cesium.Credit("天地图影像"),
    });
    // 天地图影像添加到viewer实例的影像图层集合中
    viewer.imageryLayers.addImageryProvider(tiandituProvider);
};
</script>
<style scoped>
.container {
    width: 100%;
    height: 100%;
}
</style>