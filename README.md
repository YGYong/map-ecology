# Map Ecology - 二三维地图开发生态库

本项目是一个集成 **二三维地图** 技术栈的综合学习与展示平台，涵盖了从基础理论到高级实战的完整内容。项目主要基于 **Cesium.js**、**OpenLayers** 和 **Leaflet** 三大主流地图框架进行构建。

## 🌟 项目简介

本项目旨在为 GIS 开发者提供一站式的学习资源，解决二三维地图开发中的常见痛点。通过“文档 + 案例”的双驱动模式，帮助开发者快速掌握地图底图加载、坐标转换、实体渲染、空间分析等核心技能。

- **📖 技术文档**: [http://c.ygyong.cn](http://c.ygyong.cn) (基于 VitePress)
- **🎨 案例演示**: [http://map.ygyong.cn](http://map.ygyong.cn) (基于 Vue 3 + Vite)

### 📸 效果预览

<div align="center">
  <table border="0">
    <tr>
      <td align="center">
        <img src="/public/home.png" width="400" /><br />
        <b>首页</b>
      </td>
      <td align="center">
        <img src="/public/example.png" width="400" /><br />
        <b>案例</b>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="/public/docs.png" width="400" /><br />
        <b>文档</b>
      </td>
    </tr>
  </table>
</div>

---

## 📂 项目结构

```text
map-ecology/
├── map-docs/          # 技术文档项目 (VitePress)
│   ├── docs/          # 文档源码 (.md)
│   └── package.json   # 文档依赖配置
├── map-example/       # 案例演示项目 (Vue3 + Vite)
│   ├── src/           # 示例源码
│   ├── public/        # 静态资源 (包含模型、地图数据等)
│   └── package.json   # 示例依赖配置
└── README.md          # 项目总览文档
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YGYong/map-ecology.git
cd map-ecology
```

### 2. 运行文档 (map-docs)

```bash
cd map-docs
npm install
npm run dev
```

访问 `http://localhost:3000` 查看技术文档。

### 3. 运行案例 (map-example)

```bash
cd map-example
npm install
npm run dev
```

访问 `http://localhost:5173` 查看交互式地图案例。

---

## 🛠️ 技术栈

### 三维引擎：Cesium.js

- **核心功能**: 地形加载、3D Tiles、Entity 实体、Primitive 图元、材质系统、相机控制、CZML/KML 加载等。
- **特色案例**: 漫游飞行、雷达扫描、海量点渲染、区域掩膜等。

### 二维引擎：OpenLayers

- **核心功能**: 图层管理、Source 数据源、Interaction 交互、投影转换、矢量图形绘制等。
- **特色案例**: 轨迹回放、热力图、点位聚合、模拟台风风场、WebGL 高性能渲染等。

### 轻量引擎：Leaflet

- **核心功能**: 地图初始化、UI 图层、矢量图层、常用插件集成等。
- **特色案例**: 热力图、绘制插件、聚合点等。

---

## 👤 关于作者

如果你觉得本项目对你有帮助，欢迎关注我的个人账号进行交流，或者通过下方渠道支持我的创作！

### 💬 扫码交流

<div align="center">
  <table border="0">
    <tr>
      <td align="center">
        <img src="map-example/public/me/card.jpg" width="200" /><br />
        <b>个人微信</b>
      </td>
      <td align="center">
        <img src="map-example/public/me/gzh.jpg" width="200" /><br />
        <b>微信公众号</b>
      </td>
    </tr>
  </table>
</div>

### ☕ 赞赏支持

如果你觉得本项目为你节省了时间，欢迎请我喝杯咖啡，你的支持是我持续更新的最大动力！

<div align="center">
  <img src="map-example/public/me/pay.png" width="300" /><br />
  <b>扫码赞赏</b>
</div>

---

## 📄 开源协议

本项目遵循 [MIT](LICENSE) 开源协议。
