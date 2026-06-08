export const leafletCategories = [
  {
    id: 2000,
    name: "Leaflet案例",
    icon: "🗺️",
    count: 0,
    subcategories: [
      { id: 2001, name: "基础入门", count: 0, parentId: 2000 },
      { id: 2002, name: "图层与数据", count: 0, parentId: 2000 },
      { id: 2003, name: "交互与工具", count: 0, parentId: 2000 },
      { id: 2004, name: "应用案例", count: 0, parentId: 2000 },
    ],
  },
];

export const leafletExamples = [
  {
    id: "01_初始化",
    name: "初始化",
    fileName: "leafletExample/01_初始化.vue",
    category: 2001,
    preview: "@/assets/leafletImg/01_初始化.png",
  },
  {
    id: "100_基础图层",
    name: "基础图层绘制",
    fileName: "leafletExample/100_基础图层.vue",
    category: 2001,
    preview: "@/assets/leafletImg/100_基础图层.png",
  },
  {
    id: "104_图层切换",
    name: "图层切换控制器",
    fileName: "leafletExample/104_图层切换.vue",
    category: 2002,
    preview: "@/assets/leafletImg/104_图层切换.png",
  },
  {
    id: "108_加载WMS",
    name: "加载WMS",
    fileName: "leafletExample/108_加载WMS.vue",
    category: 2002,
    preview: "@/assets/leafletImg/108_加载WMS.png",
  },
  {
    id: "102_聚合点",
    name: "聚合点",
    fileName: "leafletExample/102_聚合点.vue",
    category: 2002,
    preview: "@/assets/leafletImg/102_聚合点.png",
  },
  {
    id: "105_热力图",
    name: "热力图",
    fileName: "leafletExample/105_热力图.vue",
    category: 2002,
    preview: "@/assets/leafletImg/105_热力图.png",
  },
  {
    id: "110_自定义弹窗",
    name: "自定义弹窗",
    fileName: "leafletExample/110_自定义弹窗.vue",
    category: 2002,
    preview: "@/assets/leafletImg/110_自定义弹窗.png",
  },
  {
    id: "112_截图插件",
    name: "截图插件",
    fileName: "leafletExample/112_截图插件.vue",
    category: 2003,
    preview: "@/assets/leafletImg/112_截图插件.png",
  },
  {
    id: "103_绘制",
    name: "绘制",
    fileName: "leafletExample/103_绘制.vue",
    category: 2003,
    preview: "@/assets/leafletImg/103_绘制.png",
  },
];
