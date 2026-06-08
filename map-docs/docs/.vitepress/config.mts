import { defineConfig } from "vitepress";
import { resolve } from "path";
import { VueReplMdPlugin } from "vitepress-plugin-vue-repl";

const siteUrl = "https://ygyong.github.io/map-ecology/";
const siteName = "地图生态";
const siteDescription =
  "地图生态是面向 WebGIS 开发者的 Cesium、OpenLayers、Leaflet 中文文档与地图案例集合，覆盖二三维地图开发、底图加载、坐标转换、实体渲染、3D Tiles 与空间数据可视化。";
const siteKeywords =
  "地图生态,WebGIS,Cesium中文,OpenLayers中文,Leaflet中文,二三维地图,地图开发,3D Tiles,GIS案例";

function pageToUrl(page: string) {
  const cleanPage = page
    .replace(/(^|\/)index\.md$/, "")
    .replace(/\.md$/, ".html");
  return new URL(cleanPage, siteUrl).href;
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-CN",
  base: "/map-ecology/",
  title: siteName,
  sitemap: {
    hostname: siteUrl,
  },
  description: siteDescription,
  head: [
    ["link", { rel: "icon", href: "/map-ecology/favicon.ico" }],
    ["meta", { name: "description", content: siteDescription }],
    ["meta", { name: "keywords", content: siteKeywords }],
    ["meta", { name: "author", content: "YGYong" }],
    ["meta", { name: "robots", content: "index,follow" }],
    ["meta", { name: "theme-color", content: "#0f172a" }],
    ["meta", { property: "og:site_name", content: siteName }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    ["meta", { name: "twitter:card", content: "summary" }],
  ],
  transformHead({ page, title, description }) {
    const url = pageToUrl(page);
    const pageDescription = description || siteDescription;

    return [
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:title", content: title || siteName }],
      ["meta", { property: "og:description", content: pageDescription }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { name: "twitter:title", content: title || siteName }],
      ["meta", { name: "twitter:description", content: pageDescription }],
    ];
  },
  srcDir: "src",
  // lastUpdated: true,
  themeConfig: {
    // aside: false,
    logo: "/favicon.ico",
    outline: {
      level: "deep",
      label: "目录",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Openlayers基础", link: "/openlayers/00_简介.md" },
      { text: "Leaflet基础", link: "/leaflet/00_简介.md" },
      { text: "Cesium基础", link: "/cesium/00_简介.md" },
      { text: "知识补充", link: "/knowledge/00_引言.md" },
      { text: "网站案例", link: "/example/", target: "_blank" },
      {
        text: "相关资料",
        items: [
          {
            text: "Cesium API",
            link: "https://cesium.com/learn/cesiumjs/ref-doc/",
          },
          {
            text: "Cesium Demo",
            link: "https://sandcastle.cesium.com/",
          },
          {
            text: "Openlayers 官网",
            link: "https://openlayers.org/",
          },
          {
            text: "Leaflet 官网",
            link: "https://leafletjs.cn",
          },
        ],
      },
    ],

    sidebar: {
      "/cesium/": [
        {
          text: "Cesium基础",
          items: [
            { text: "介绍", link: "/cesium/00_简介.md" },
            { text: "快速开始", link: "/cesium/01_快速开始" },
            { text: "添加底图", link: "/cesium/04_添加底图" },
            { text: "Viewer视图", link: "/cesium/03_Viewer视图" },
            { text: "相机", link: "/cesium/05_相机" },
            { text: "坐标系", link: "/cesium/06_坐标系" },
            { text: "事件系统", link: "/cesium/07_事件" },
            { text: "实体类型", link: "/cesium/08_实体" },
            { text: "实体材质", link: "/cesium/09_实体材质" },
            { text: "Primitive图元", link: "/cesium/10_Primitive图元" },
            { text: "日期与时钟", link: "/cesium/13_日期与时钟" },
            { text: "3D_Tiles", link: "/cesium/14_3DTiles" },
            { text: "数据加载", link: "/cesium/15_数据加载" },
            { text: "专业名词", link: "/cesium/66_专业名词.md" },
          ],
        },
      ],
      "/openlayers/": [
        {
          text: "Openlayers基础",
          items: [
            { text: "介绍", link: "/openlayers/00_简介.md" },
            { text: "快速开始", link: "/openlayers/01_快速开始" },
            { text: "Map对象", link: "/openlayers/02_map对象" },
            { text: "Layer图层", link: "/openlayers/03_layer对象" },
            { text: "Source源", link: "/openlayers/04_source对象" },
            { text: "View对象", link: "/openlayers/05_view对象" },
            {
              text: "Controls对象",
              link: "/openlayers/06_controls对象",
            },
            {
              text: "Interaction对象",
              link: "/openlayers/07_interaction对象.md",
            },
            { text: "矢量图形", link: "/openlayers/08_矢量图形.md" },
            { text: "事件系统", link: "/openlayers/09_事件系统.md" },
            { text: "extent", link: "/openlayers/10_extent.md" },
            { text: "知识补充", link: "/openlayers/50_知识补充.md" },
            { text: "API补充", link: "/openlayers/99_常用api.md" },
          ],
        },
      ],
      "/leaflet/": [
        {
          text: "Leaflet基础",
          items: [
            { text: "介绍", link: "/leaflet/00_简介.md" },
            { text: "快速开始", link: "/leaflet/01_快速开始" },
            { text: "Map对象", link: "/leaflet/02_map对象" },
            { text: "UI图层", link: "/leaflet/03_UI图层" },
            { text: "栅格图层", link: "/leaflet/04_栅格图层" },
            // { text: "矢量图层", link: "/leaflet/05_矢量图层" },
            // { text: "图层补充", link: "/leaflet/06_图层补充" },
            // { text: "控件", link: "/leaflet/07_控件" },
          ],
        },
      ],
      "/knowledge": [
        {
          text: "知识补充",
          items: [
            { text: "介绍", link: "/knowledge/00_引言.md" },
            { text: "坐标系", link: "/knowledge/01_坐标系.md" },
            { text: "地图服务", link: "/knowledge/02_地图服务.md" },
            { text: "数据格式", link: "/knowledge/03_数据格式.md" },
            { text: "常用插件", link: "/knowledge/04_常用插件.md" },
            { text: "gis工具", link: "/knowledge/05_gis工具.md" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/YGYong/map-ecology" },
    ],
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    // lastUpdatedText: "最后更新时间",
    search: {
      provider: "local",
    },
  },
  markdown: {
    config: (md) => {
      md.use(VueReplMdPlugin);
    },
  },
  vite: {
    resolve: {
      alias: {
        "@": resolve(__dirname, ".", "../src/"),
      },
    },
    ssr: {
      // 完全禁用这些依赖的 SSR
      external: ["cesium", "cesium-navigation-es6", "dat.gui"],
      noExternal: [],
    },
  },
  // 添加构建配置以避免 SSR 问题
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith("cesium-"),
      },
    },
  },
});
