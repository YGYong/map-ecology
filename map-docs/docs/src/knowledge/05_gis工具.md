# 常用的二维与三维 GIS 工具介绍

地理信息系统（GIS）是一个强大的工具，用于捕获、存储、操作、分析、管理和呈现所有类型的地理空间数据。为了实现这些功能，我们需要各种专业的 GIS 软件和开发工具。本文将为你介绍一些在 GIS 领域广泛使用的二维（2D）和三维（3D）工具。

## 1. 桌面 GIS 软件 (Desktop GIS Software)

桌面 GIS 软件是用户进行地理数据创建、编辑、分析和制图的主要工具。

### 1.1 ArcGIS Pro / ArcGIS Desktop (ESRI)

- **介绍**：由 Esri 公司开发的一套功能强大的商业 GIS 软件。ArcGIS Pro 是其新一代的桌面应用，支持 2D 和 3D 数据可视化、高级空间分析、数据管理、制图和发布。ArcGIS Desktop（包括 ArcMap 和 ArcCatalog）是其经典版本，功能同样全面。
- **特点**：行业标准，功能全面，生态系统完善，支持各种数据格式和分析模型。
- **2D/3D 支持**：全面支持 2D 和 3D 数据的处理、分析和可视化。
- **官网**：[https://www.esri.com/en-us/arcgis/products/arcgis-pro/overview](https://www.esri.com/en-us/arcgis/products/arcgis-pro/overview)

### 1.2 QGIS (Quantum GIS)

- **介绍**：一个免费、开源的桌面 GIS 应用，支持查看、编辑、分析和发布地理空间信息。QGIS 拥有庞大的用户社区和丰富的插件生态系统，功能日益强大，被认为是 ArcGIS 的有力替代品。
- **特点**：开源免费，跨平台，功能丰富，社区活跃，插件众多。
- **2D/3D 支持**：主要支持 2D 数据处理和可视化，但通过插件（如 QGIS2threejs）也支持基本的 3D 可视化。
- **官网**：[https://qgis.org/en/site/](https://qgis.org/en/site/)

### 1.3 GRASS GIS (Geographic Resources Analysis Support System)

- **介绍**：一个免费、开源的 GIS 软件套件，主要用于地理空间数据管理和分析、图像处理、图形和地图制作。GRASS GIS 以其强大的栅格和矢量处理能力而闻名，常用于科学研究和高级空间分析。
- **特点**：开源免费，功能强大，尤其擅长栅格和矢量分析，命令行操作灵活。
- **2D/3D 支持**：支持 2D 和 3D 栅格及矢量数据的处理和分析。
- **官网**：[https://grass.osgeo.org/](https://grass.osgeo.org/)

## 2. 服务器 GIS 软件 (Server GIS Software)

服务器 GIS 软件用于管理、发布和共享地理空间数据和服务，通常作为 Web 地图应用的数据后端。

### 2.1 GeoServer

- **介绍**：一个免费、开源的 Java 服务器，允许用户共享和编辑地理空间数据。GeoServer 支持 OGC 的 WMS、WFS、WCS 等标准，可以将各种地理数据源（如 Shapefile、PostGIS、GeoTIFF）发布为 Web 服务。
- **特点**：开源免费，支持 OGC 标准，灵活的数据源支持，广泛应用于 Web GIS。
- **2D/3D 支持**：主要发布 2D 地图服务，但可以发布包含高程信息的栅格数据。
- **官网**：[http://geoserver.org/](http://geoserver.org/)

### 2.2 MapServer

- **介绍**：一个免费、开源的 Web 地图渲染引擎，最初由明尼苏达大学开发。MapServer 是一个 CGI 程序，能够快速渲染地图图片，并支持 OGC 标准。
- **特点**：开源免费，渲染速度快，轻量级，支持 OGC 标准。
- **2D/3D 支持**：主要用于 2D 地图服务的渲染。
- **官网**：[https://mapserver.org/](https://mapserver.org/)

### 2.3 ArcGIS Enterprise (ESRI)

- **介绍**：Esri 的商业级 GIS 服务器产品，提供全面的地理空间数据管理、分析、可视化和共享能力。它包括 GIS Server、Portal for ArcGIS、Data Store 和 Web Adaptor 等组件，构建企业级的 Web GIS 平台。
- **特点**：商业级，功能强大，可扩展性强，与 ArcGIS Pro 等产品无缝集成。
- **2D/3D 支持**：全面支持 2D 和 3D 服务的发布和管理，包括场景服务（Scene Services）用于 3D 可视化。
- **官网**：[https://www.esri.com/en-us/arcgis/products/arcgis-enterprise/overview](https://www.esri.com/en-us/arcgis/products/arcgis-enterprise/overview)

## 3. Web 地图开发库/API (Web Mapping Libraries/APIs)

这些库允许开发者在网页浏览器中创建交互式地图应用。

### 3.1 Leaflet

- **介绍**：一个轻量级、开源的 JavaScript 库，用于构建移动友好的交互式地图。Leaflet 以其简洁的 API 和高性能而闻名，是 Web 地图开发的流行选择。
- **特点**：轻量级，易于使用，高性能，移动友好，插件丰富。
- **2D/3D 支持**：主要用于 2D 地图显示。
- **官网**：[https://leafletjs.com/](https://leafletjs.com/)

### 3.2 OpenLayers

- **介绍**：一个功能强大的开源 JavaScript 库，用于在 Web 浏览器中显示地图。OpenLayers 支持多种地图源（如 WMS、WMTS、XYZ 瓦片、GeoJSON 等），并提供丰富的地图操作和交互功能。
- **特点**：功能强大，支持多种数据源和投影，高度可定制。
- **2D/3D 支持**：主要用于 2D 地图显示，但可以通过集成其他库（如 CesiumJS）实现 3D 效果。
- **官网**：[https://openlayers.org/](https://openlayers.org/)

### 3.3 Mapbox GL JS

- **介绍**：Mapbox 提供的一个 JavaScript 库，用于在 Web 上渲染矢量瓦片地图。它利用 WebGL 技术，实现高性能的地图渲染和流畅的动画效果，支持自定义地图样式和 3D 地形。
- **特点**：基于 WebGL，高性能渲染，矢量瓦片，自定义样式，支持 3D 地形和建筑。
- **2D/3D 支持**：支持 2D 和 3D 地图渲染，包括 3D 建筑和地形。
- **官网**：[https://docs.mapbox.com/mapbox-gl-js/api/](https://docs.mapbox.com/mapbox-gl-js/api/)

### 3.4 CesiumJS

- **介绍**：一个开源的 JavaScript 库，用于在 Web 浏览器中创建世界级的 3D 地球和地图。CesiumJS 利用 WebGL 技术，能够渲染高精度的全球地形、影像、3D 模型（如 BIM/CAD、倾斜摄影模型）和矢量数据。
- **特点**：纯 3D 地球，高性能，支持多种 3D 数据格式（如 3D Tiles），可用于构建数字孪生、城市建模等。
- **2D/3D 支持**：专注于 3D 地球和场景渲染，也支持 2D 平面地图模式。
- **官网**：[https://cesium.com/cesiumjs/](https://cesium.com/cesiumjs/)

### 3.5 ArcGIS API for JavaScript (ESRI)

- **介绍**：Esri 提供的 JavaScript API，用于在 Web 应用中集成 ArcGIS 平台的功能。它支持 2D 和 3D 地图、空间分析、数据查询、编辑和可视化，与 ArcGIS Enterprise 和 ArcGIS Online 无缝集成。
- **特点**：功能全面，与 Esri 生态系统紧密结合，支持丰富的 GIS 功能。
- **2D/3D 支持**：全面支持 2D 和 3D 地图和场景的构建。
- **官网**：[https://developers.arcgis.com/javascript/](https://developers.arcgis.com/javascript/)

## 4. 其他重要 GIS 工具

### 4.1 PostGIS

- **介绍**：PostGIS 是 PostgreSQL 数据库的一个空间扩展，它为 PostgreSQL 增加了存储、索引和查询地理空间对象的能力。它是开源 GIS 领域最常用的空间数据库。
- **特点**：开源，功能强大，支持 SQL 查询空间数据，与各种 GIS 软件和库兼容。
- **2D/3D 支持**：支持 2D 和 3D 几何对象的存储和空间操作。
- **官网**：[https://postgis.net/](https://postgis.net/)

### 4.2 FME (Feature Manipulation Engine)

- **介绍**：由 Safe Software 公司开发的数据集成平台，主要用于地理空间数据的转换、集成和自动化。FME 支持数百种数据格式，能够解决复杂的 GIS 数据互操作性问题。
- **特点**：强大的数据转换能力，支持多种格式，可视化工作流构建，自动化。
- **2D/3D 支持**：支持 2D 和 3D 数据的转换和处理。
- **官网**：[https://www.safe.com/fme/](https://www.safe.com/fme/)
