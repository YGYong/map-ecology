<template>
  <div class="container">
    <div id="map" class="map"></div>
    <!-- 控制面板 -->
    <div class="controls-panel">
      <h2 class="panel-title">图层控制</h2>
      <!-- 台风路径不再有开关，始终显示 -->
      <label class="checkbox-label">
        <!-- 仅作显示，无实际控制功能 -->
        <input type="checkbox" checked disabled class="checkbox-input" />
        <span class="checkbox-text">台风路径 (始终显示)</span>
      </label>
    </div>
    <!-- 台风信息卡片 -->
    <div v-if="selectedTyphoon" class="info-card">
      <h3 class="card-title">
        {{ selectedTyphoon.name }} - {{ selectedTyphoon.time }}
      </h3>
      <div class="card-content">
        <p>
          <strong>中心位置:</strong> 东经{{ selectedTyphoon.lon }}° 北纬{{
            selectedTyphoon.lat
          }}°
        </p>
        <p><strong>中心气压:</strong> {{ selectedTyphoon.pressure }}百帕</p>
        <p>
          <strong>风速风力:</strong> {{ selectedTyphoon.windSpeed }}米/秒,
          {{ selectedTyphoon.windForce }}级({{ selectedTyphoon.windType }})
        </p>
        <p><strong>当前位置:</strong> {{ selectedTyphoon.currentLocation }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import XYZ from "ol/source/XYZ.js";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import LineString from "ol/geom/LineString.js";
import Circle from "ol/geom/Circle.js";
import { fromLonLat } from "ol/proj.js"; // 用于经纬度坐标与地图投影坐标之间的转换
import { Style, Stroke, Fill, Circle as CircleStyle, Icon } from "ol/style.js"; // OpenLayers 样式相关模块，新增 Icon
import "ol/ol.css"; // OpenLayers 默认样式

// OpenLayers 地图实例
let map = null;
// 台风路径和中心点图层
let typhoonTrackLayer = null;
// 风场模拟图层
let windFieldLayer = null;
// 风场数据源，用于存储风场粒子要素
let windFieldSource = null;
// 风场动画帧请求ID，用于取消 requestAnimationFrame 动画
let animationFrameId = null;
// 台风路径动画的定时器ID，用于清除 setInterval 定时器
let typhoonAnimationIntervalId = null;

// 当前选中的台风信息，用于信息卡片显示，响应式更新
const selectedTyphoon = ref(null);
// 台风路径动画的当前索引，用于追踪台风在路径上的位置
const typhoonPathIndex = ref(0);

// 模拟台风数据
const typhoonData = {
  name: "竹节草", // 台风名称
  // 模拟的台风路径点数组，每个点包含经纬度、时间、气压、风速风力等信息
  path: [
    {
      lon: 118.0,
      lat: 20.0,
      time: "7月28日0时",
      pressure: 1000,
      windSpeed: 15,
      windForce: 7,
      windType: "热带低压",
      currentLocation: "位于南海中部",
    },
    {
      lon: 119.5,
      lat: 21.5,
      time: "7月28日8时",
      pressure: 998,
      windSpeed: 16,
      windForce: 7,
      windType: "热带低压",
      currentLocation: "位于南海北部",
    },
    {
      lon: 121.0,
      lat: 23.0,
      time: "7月28日16时",
      pressure: 995,
      windSpeed: 17,
      windForce: 8,
      windType: "热带风暴",
      currentLocation: "位于巴士海峡",
    },
    {
      lon: 122.5,
      lat: 24.5,
      time: "7月29日0时",
      pressure: 993,
      windSpeed: 18,
      windForce: 8,
      windType: "热带风暴",
      currentLocation: "位于台湾以东洋面",
    },
    {
      lon: 123.8,
      lat: 26.0,
      time: "7月29日4时",
      pressure: 992,
      windSpeed: 18,
      windForce: 8,
      windType: "热带风暴",
      currentLocation: "位于台湾东北部洋面",
    },
    {
      lon: 124.9,
      lat: 27.3,
      time: "7月29日8时",
      pressure: 992,
      windSpeed: 18,
      windForce: 8,
      windType: "热带风暴",
      currentLocation: "当前位于东海，距离登陆点上海市东南方向549公里",
    }, // 当前位置
    {
      lon: 126.0,
      lat: 28.5,
      time: "7月29日16时",
      pressure: 990,
      windSpeed: 20,
      windForce: 9,
      windType: "热带风暴",
      currentLocation: "预计向西北方向移动",
    }, // 预测
    {
      lon: 127.5,
      lat: 29.5,
      time: "7月30日0时",
      pressure: 988,
      windSpeed: 22,
      windForce: 9,
      windType: "热带风暴",
      currentLocation: "预计在东海北部",
    },
    {
      lon: 129.0,
      lat: 30.0,
      time: "7月30日8时",
      pressure: 985,
      windSpeed: 25,
      windForce: 10,
      windType: "强热带风暴",
      currentLocation: "预计在黄海南部",
    },
  ],
  windRadius: 300000, // 7级风圈半径，单位米
};

// 风场粒子数组，存储每个粒子的属性和对应的 OpenLayers Feature
const windParticles = [];
// 风场粒子数量
const NUM_WIND_PARTICLES = 1500; // 增加粒子数量以提高密度
// 风场粒子线段长度（模拟），增加长度使其更明显
const WIND_PARTICLE_LENGTH = 10000; // 米 (10公里)

// 风场行为的新常量（实现更强的漩涡和向内拉力）
const WIND_FIELD_MAX_RADIUS = typhoonData.windRadius * 3.5; // 粒子最大半径 (1050公里)
const WIND_FIELD_MIN_RADIUS = typhoonData.windRadius * 0.05; // 粒子最小半径 (15公里)，允许粒子更靠近中心
const INWARD_ACCELERATION = 2.0; // 每帧粒子向内拉力的强度（已增加）
const SWIRL_ACCELERATION = 4.0; // 每帧粒子漩涡（切向力）的强度（已增加）
const MAX_PARTICLE_SPEED = 1000; // 粒子最大速度（米/帧）（已增加）
const MIN_PARTICLE_SPEED = 100; // 粒子最小速度（米/帧）（已增加）
const DRAG_FACTOR = 0.97; // 阻尼/拖曳因子，防止无限加速（略微减小阻力）

// 用于更轻松更新的点要素引用
let typhoonPointFeatures = [];
let windCircleFeature = null;

// 台风中心点图片 URL，请替换为您的图片路径
const TYPHOON_ICON_URL = "/src/assets/风圈.png"; // 示例占位符图片

onMounted(() => {
  // 基础瓦片图层 (高德地图)
  const gaodeLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
      crossOrigin: "anonymous", // 允许跨域加载瓦片，避免图片加载问题
    }),
  });

  // 台风路径图层的数据源
  const typhoonSource = new VectorSource();
  typhoonTrackLayer = new VectorLayer({
    source: typhoonSource,
    // 根据要素类型设置不同的样式
    style: (feature) => {
      if (feature.get("type") === "path") {
        // 台风路径线样式
        return new Style({
          stroke: new Stroke({
            color: "red",
            width: 3,
            lineDash: [10, 10], // 虚线效果
          }),
        });
      } else if (feature.get("type") === "current") {
        // 当前台风中心点样式（使用circle代替）
        // return new Style({
        //   image: new CircleStyle({
        //     radius: 10,
        //     fill: new Fill({ color: "rgba(0, 150, 255, 0.8)" }), // 蓝色填充
        //     stroke: new Stroke({ color: "white", width: 2 }), // 白色边框
        //   }),
        // });
        // 当前台风中心点样式 (使用图片)
        return new Style({
          image: new Icon({
            anchor: [0.5, 0.5], // 图片中心与坐标点对齐
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            src: TYPHOON_ICON_URL, // 您的图片 URL
            scale: 3.5, // 根据图片实际大小调整缩放比例
          }),
        });
      } else if (feature.get("type") === "point") {
        // 路径上的历史/预测点样式
        return new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: "rgba(0, 200, 0, 0.8)" }), // 绿色填充
            stroke: new Stroke({ color: "white", width: 1 }), // 白色边框
          }),
        });
      } else if (feature.get("type") === "windCircle") {
        // 风圈样式
        return new Style({
          stroke: new Stroke({
            color: "rgba(0, 255, 0, 0.6)", // 绿色边框
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(0, 255, 0, 0.1)", // 半透明绿色填充
          }),
        });
      }
      return null;
    },
  });

  // 初始化台风路径和点要素
  const initialPathCoordinates = typhoonData.path.map((p) =>
    fromLonLat([p.lon, p.lat])
  );
  // 创建台风路径线要素
  const pathFeature = new Feature({
    geometry: new LineString(initialPathCoordinates),
    type: "path",
  });
  typhoonSource.addFeature(pathFeature);

  // 创建台风路径上的所有点要素并存储引用
  typhoonData.path.forEach((p, i) => {
    const pointFeature = new Feature({
      geometry: new Point(fromLonLat([p.lon, p.lat])),
      type: "point", // 初始都设为普通点
    });
    typhoonSource.addFeature(pointFeature);
    typhoonPointFeatures.push(pointFeature);
  });

  // 获取当前台风中心点要素和风圈要素的引用，方便后续动画更新
  if (typhoonPointFeatures[typhoonPathIndex.value]) {
    typhoonPointFeatures[typhoonPathIndex.value].set("type", "current"); // 设置初始当前点类型
  }

  // 创建风圈要素
  windCircleFeature = new Feature({
    geometry: new Circle(
      fromLonLat([
        typhoonData.path[typhoonPathIndex.value].lon,
        typhoonData.path[typhoonPathIndex.value].lat,
      ]),
      typhoonData.windRadius
    ),
    type: "windCircle",
  });
  typhoonSource.addFeature(windCircleFeature);

  // 初始化台风信息卡片显示为路径的第一个点数据
  selectedTyphoon.value = {
    ...typhoonData.path[typhoonPathIndex.value],
    name: typhoonData.name,
  };

  // 风场图层的数据源
  windFieldSource = new VectorSource();
  windFieldLayer = new VectorLayer({
    source: windFieldSource,
    style: new Style({
      stroke: new Stroke({
        color: "rgba(0, 150, 255, 0.8)", // 风线颜色略微加深
        width: 2, // 增加风线宽度
      }),
    }),
  });

  // 初始化风场粒子，并添加到风场数据源
  for (let i = 0; i < NUM_WIND_PARTICLES; i++) {
    resetWindParticle(i); // 调用重置函数，它会创建并添加新的Feature
  }

  // 创建地图实例
  map = new Map({
    layers: [gaodeLayer, typhoonTrackLayer, windFieldLayer], // 添加所有图层到地图
    target: "map", // 地图容器的DOM元素ID
    view: new View({
      center: fromLonLat([
        typhoonData.path[typhoonPathIndex.value].lon,
        typhoonData.path[typhoonPathIndex.value].lat,
      ]), // 初始地图中心为台风起始点
      zoom: 6, // 初始缩放级别
      maxZoom: 18, // 最大缩放级别
    }),
  });

  // 鼠标按下时停止定时器，抬起时启用定时器
  map.on("pointerdown", () => {
    if (typhoonAnimationIntervalId) {
      clearInterval(typhoonAnimationIntervalId);
      typhoonAnimationIntervalId = null;
    }
  });
  map.on("pointerup", () => {
    if (!typhoonAnimationIntervalId) {
      startTyphoonAnimation(); // 恢复台风路径动画
    }
  });

  // 初始状态下，启动风场动画
  startWindAnimation();
  // 启动台风路径动画
  startTyphoonAnimation();
});

// 组件卸载时清理资源，防止内存泄漏
onUnmounted(() => {
  if (map) {
    map.setTarget(null); // 解除地图与DOM元素的绑定
    map = null;
  }
  stopWindAnimation(); // 停止风场动画
  stopTyphoonAnimation(); // 停止台风路径动画
});

/**
 * 重置单个风场粒子位置
 * 当粒子超出范围或需要重新生成时调用
 * @param {number} index - 粒子在 windParticles 数组中的索引
 */
function resetWindParticle(index) {
  const currentTyphoonCenter = fromLonLat([
    selectedTyphoon.value.lon,
    selectedTyphoon.value.lat,
  ]);

  // 在环形区域 [最小半径, 最大半径] 内生成随机位置
  const angle = Math.random() * 2 * Math.PI;
  const distance =
    WIND_FIELD_MIN_RADIUS +
    Math.random() * (WIND_FIELD_MAX_RADIUS - WIND_FIELD_MIN_RADIUS);

  const startX = currentTyphoonCenter[0] + distance * Math.cos(angle);
  const startY = currentTyphoonCenter[1] + distance * Math.sin(angle);

  // 初始速度（在范围内随机速度，随机方向）
  let initialSpeed =
    MIN_PARTICLE_SPEED +
    Math.random() * (MAX_PARTICLE_SPEED - MIN_PARTICLE_SPEED);
  let initialAngle = Math.random() * 2 * Math.PI;

  let initialVx = initialSpeed * Math.cos(initialAngle);
  let initialVy = initialSpeed * Math.sin(initialAngle);

  // 应用一些初始的向内/漩涡趋势，以实现即时视觉效果
  const dxToCenter = currentTyphoonCenter[0] - startX;
  const dyToCenter = currentTyphoonCenter[1] - startY;
  const distToCenter = Math.sqrt(
    dxToCenter * dxToCenter + dyToCenter * dyToCenter
  );

  if (distToCenter > 0) {
    // 初始向内拉力
    initialVx += (dxToCenter / distToCenter) * INWARD_ACCELERATION * 5; // 增强初始向内力
    initialVy += (dyToCenter / distToCenter) * INWARD_ACCELERATION * 5;

    // 初始漩涡
    initialVx += (-dyToCenter / distToCenter) * SWIRL_ACCELERATION * 5; // 增强初始漩涡力
    initialVy += (dxToCenter / distToCenter) * SWIRL_ACCELERATION * 5;
  }

  const particleRenderAngle = Math.atan2(initialVy, initialVx);
  const endX = startX + WIND_PARTICLE_LENGTH * Math.cos(particleRenderAngle);
  const endY = startY + WIND_PARTICLE_LENGTH * Math.sin(particleRenderAngle);

  if (windParticles[index]) {
    windParticles[index].x = startX;
    windParticles[index].y = startY;
    windParticles[index].vx = initialVx;
    windParticles[index].vy = initialVy;
    windParticles[index].feature.getGeometry().setCoordinates([
      [startX, startY],
      [endX, endY],
    ]);
  } else {
    const feature = new Feature({
      geometry: new LineString([
        [startX, startY],
        [endX, endY],
      ]),
    });
    windParticles.push({
      feature: feature, // 存储 Feature 对象
      x: startX,
      y: startY,
      vx: initialVx,
      vy: initialVy,
    });
    windFieldSource.addFeature(feature); // 将新创建的 Feature 添加到数据源
  }
}

/**
 * 风场粒子动画循环函数
 * 使用 requestAnimationFrame 实现平滑动画
 */
function animateWindField() {
  // 获取当前台风中心点，风场粒子会围绕此中心移动
  const currentTyphoonCenter = fromLonLat([
    selectedTyphoon.value.lon,
    selectedTyphoon.value.lat,
  ]);

  windParticles.forEach((p, index) => {
    const dx = currentTyphoonCenter[0] - p.x;
    const dy = currentTyphoonCenter[1] - p.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果粒子太近或太远，则重置
    if (distance < WIND_FIELD_MIN_RADIUS || distance > WIND_FIELD_MAX_RADIUS) {
      resetWindParticle(index);
      return; // 本帧跳过此粒子的后续处理
    }

    // 计算力（加速度）
    let ax = 0;
    let ay = 0;

    if (distance > 0) {
      // 向内拉力（越靠近中心越强）
      // 使用更平滑的向内力衰减，可能类似反平方定律
      const inwardFactor = INWARD_ACCELERATION / (distance / 50000 + 1); // 调整除数以控制力强度
      ax += (dx / distance) * inwardFactor;
      ay += (dy / distance) * inwardFactor;

      // 切向漩涡（顺时针，越靠近中心越强）
      const swirlFactor = SWIRL_ACCELERATION / (distance / 50000 + 1); // 调整除数以控制力强度
      ax += (-dy / distance) * swirlFactor; // 垂直于 (dx, dy)
      ay += (dx / distance) * swirlFactor;
    }

    // 更新速度
    p.vx += ax;
    p.vy += ay;

    // 应用阻力/阻尼
    p.vx *= DRAG_FACTOR;
    p.vy *= DRAG_FACTOR;

    // 限制速度
    const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (currentSpeed > MAX_PARTICLE_SPEED) {
      p.vx = (p.vx / currentSpeed) * MAX_PARTICLE_SPEED;
      p.vy = (p.vy / currentSpeed) * MAX_PARTICLE_SPEED;
    } else if (currentSpeed < MIN_PARTICLE_SPEED && currentSpeed > 0) {
      // 确保粒子不会完全停止，除非速度为0
      p.vx = (p.vx / currentSpeed) * MIN_PARTICLE_SPEED;
      p.vy = (p.vy / currentSpeed) * MIN_PARTICLE_SPEED;
    }

    // 更新位置
    p.x += p.vx;
    p.y += p.vy;

    // 更新要素几何形状（线段方向基于当前速度）
    const particleAngle = Math.atan2(p.vy, p.vx);
    const endX = p.x + WIND_PARTICLE_LENGTH * Math.cos(particleAngle);
    const endY = p.y + WIND_PARTICLE_LENGTH * Math.sin(particleAngle);
    p.feature.getGeometry().setCoordinates([
      [p.x, p.y],
      [endX, endY],
    ]);
  });

  windFieldSource.changed(); // 强制重绘风场图层，显示粒子移动效果
  animationFrameId = requestAnimationFrame(animateWindField); // 请求下一帧动画
}

/**
 * 启动风场动画
 */
function startWindAnimation() {
  if (!animationFrameId) {
    // 避免重复启动动画
    animateWindField();
  }
}

/**
 * 停止风场动画
 */
function stopWindAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId); // 取消当前的动画帧请求
    animationFrameId = null;
  }
}

/**
 * 启动台风路径动画
 * 使用 setInterval 定时器模拟台风的移动
 */
function startTyphoonAnimation() {
  // 每隔1秒更新一次台风位置
  typhoonAnimationIntervalId = setInterval(() => {
    // 获取上一个当前点要素并重置其类型
    if (typhoonPointFeatures[typhoonPathIndex.value]) {
      typhoonPointFeatures[typhoonPathIndex.value].set("type", "point");
    }

    // 更新台风路径索引，循环遍历路径
    typhoonPathIndex.value =
      (typhoonPathIndex.value + 1) % typhoonData.path.length;
    const currentPointData = typhoonData.path[typhoonPathIndex.value];
    const newCenterCoordinates = fromLonLat([
      currentPointData.lon,
      currentPointData.lat,
    ]);

    // 更新台风信息卡片显示的数据
    selectedTyphoon.value = { ...currentPointData, name: typhoonData.name };

    // 设置新的当前点要素类型
    if (typhoonPointFeatures[typhoonPathIndex.value]) {
      typhoonPointFeatures[typhoonPathIndex.value].set("type", "current");
    }

    // 更新风圈位置
    if (windCircleFeature) {
      windCircleFeature.setGeometry(
        new Circle(newCenterCoordinates, typhoonData.windRadius)
      );
    }

    // 强制重绘台风路径图层，显示移动的台风中心和风圈
    typhoonTrackLayer.getSource().changed();

    // 确保风场粒子根据新的台风中心重置
    // 遍历所有风场粒子，确保它们对新的台风中心做出反应
    windParticles.forEach((p, index) => {
      // 当台风移动时，粒子也应调整
      // 相对于新的台风中心重新初始化粒子，以防止视觉“跳跃”
      const oldCenter = fromLonLat([
        typhoonData.path[
          (typhoonPathIndex.value - 1 + typhoonData.path.length) %
            typhoonData.path.length
        ].lon,
        typhoonData.path[
          (typhoonPathIndex.value - 1 + typhoonData.path.length) %
            typhoonData.path.length
        ].lat,
      ]);

      // 计算粒子相对于旧中心的位置
      const relativeX = p.x - oldCenter[0];
      const relativeY = p.y - oldCenter[1];

      // 将相同的相对位置应用于新中心
      p.x = newCenterCoordinates[0] + relativeX;
      p.y = newCenterCoordinates[1] + relativeY;

      // 重置速度，避免携带可能与新力冲突的旧动量
      const initialSpeed =
        MIN_PARTICLE_SPEED +
        Math.random() * (MAX_PARTICLE_SPEED - MIN_PARTICLE_SPEED);
      const initialAngle = Math.atan2(p.vy, p.vx); // 保持大致方向
      p.vx = initialSpeed * Math.cos(initialAngle);
      p.vy = initialSpeed * Math.sin(initialAngle);

      // 更新其要素几何形状
      const particleAngle = Math.atan2(p.vy, p.vx);
      const endX = p.x + WIND_PARTICLE_LENGTH * Math.cos(particleAngle);
      const endY = p.y + WIND_PARTICLE_LENGTH * Math.sin(particleAngle);
      p.feature.getGeometry().setCoordinates([
        [p.x, p.y],
        [endX, endY],
      ]);
    });
    windFieldSource.changed(); // 强制重绘风场图层
  }, 1000); // 每1秒更新一次台风位置
}

/**
 * 停止台风路径动画
 */
function stopTyphoonAnimation() {
  if (typhoonAnimationIntervalId) {
    clearInterval(typhoonAnimationIntervalId); // 清除定时器
    typhoonAnimationIntervalId = null;
  }
}
</script>

<style scoped>
/* 容器样式 */
.container {
  position: relative;
  width: 100vw; /* 视口宽度 */
  height: 100vh; /* 视口高度 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 地图容器样式 */
.map {
  width: 100%;
  height: 100%;
  background-color: #e0f2f7; /* 浅蓝色背景，模拟海洋区域 */
}

/* 控制面板样式 */
.controls-panel {
  position: absolute;
  top: 16px; /* 距离顶部16px */
  right: 16px; /* 距离右侧16px */
  background-color: rgba(255, 255, 255, 0.9); /* 半透明白色背景 */
  padding: 16px; /* 内边距 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  z-index: 10; /* 确保在地图上方 */
  display: flex;
  flex-direction: column; /* 垂直布局 */
  gap: 12px; /* 元素间距 */
}

/* 面板标题样式 */
.panel-title {
  font-size: 1.125rem; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
  color: #2d3748; /* 深灰色字体 */
  margin-bottom: 8px; /* 底部外边距 */
}

/* 复选框标签样式 */
.checkbox-label {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  cursor: pointer; /* 鼠标指针变为手型 */
}

/* 复选框输入框样式 */
.checkbox-input {
  height: 20px;
  width: 20px;
  accent-color: #2563eb; /* 改变复选框的颜色 */
  border-radius: 4px;
  border: 1px solid #ccc;
  appearance: none; /* 隐藏默认复选框样式 */
  -webkit-appearance: none; /* 兼容WebKit浏览器 */
  outline: none; /* 移除焦点轮廓 */
  cursor: pointer;
  position: relative;
}

/* 复选框选中时的样式 */
.checkbox-input:checked {
  background-color: #2563eb; /* 选中时背景色 */
  border-color: #2563eb; /* 选中时边框色 */
}

/* 复选框选中时显示对勾 */
.checkbox-input:checked::before {
  content: "✔"; /* 对勾符号 */
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 居中对勾 */
  font-size: 14px;
  color: white; /* 对勾颜色 */
}

/* 复选框文本样式 */
.checkbox-text {
  margin-left: 8px; /* 左侧外边距 */
  color: #4a5568; /* 灰色字体 */
}

/* 信息卡片样式 */
.info-card {
  position: absolute;
  bottom: 16px; /* 距离底部16px */
  left: 16px; /* 距离左侧16px */
  background-color: rgba(255, 255, 255, 0.9); /* 半透明白色背景 */
  padding: 24px; /* 内边距 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  z-index: 10; /* 确保在地图上方 */
  width: 384px; /* 固定宽度 */
}

/* 卡片标题样式 */
.card-title {
  font-size: 1.25rem; /* 字体大小 */
  font-weight: 700; /* 字体粗细 */
  color: #1d4ed8; /* 蓝色字体 */
  margin-bottom: 12px; /* 底部外边距 */
}

/* 卡片内容样式 */
.card-content {
  display: flex;
  flex-direction: column; /* 垂直布局 */
  gap: 8px; /* 元素间距 */
  color: #4a5568; /* 灰色字体 */
}

/* 卡片内容中加粗文本的样式 */
.card-content strong {
  font-weight: bold;
}
</style>
