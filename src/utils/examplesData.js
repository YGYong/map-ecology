// 示例分类数据
export const categories = [
  {
    id: 1,
    name: "基础案例",
    count: 57,
    icon: "🌏",
    subcategories: [
      { id: 11, name: "地图与影像", count: 7, parentId: 1 },
      { id: 12, name: "相机与交互", count: 7, parentId: 1 },
      { id: 13, name: "实体对象", count: 14, parentId: 1 },
      { id: 14, name: "模型与3DTiles", count: 5, parentId: 1 },
      { id: 15, name: "材质与外观", count: 12, parentId: 1 },
      { id: 16, name: "图元", count: 2, parentId: 1 },
      { id: 17, name: "数据加载", count: 4, parentId: 1 },
      { id: 18, name: "其他", count: 6, parentId: 1 },
    ],
  },
  {
    id: 2,
    name: "进阶案例",
    count: 6,
    icon: "🚀",
    subcategories: [{ id: 21, name: "进阶功能", count: 6, parentId: 2 }],
  },
];

// 示例数据
export const examples = [
  // 1.1 地图与影像
  {
    id: 1,
    name: "默认地图",
    fileName: "cesiumExample/basic/01_初始化.vue",
    category: 11,
    preview: "@/assets/cesiumImg/01_默认地图.png",
  },
  {
    id: 2,
    name: "天地图影像",
    fileName: "cesiumExample/basic/02_天地图影像.vue",
    category: 11,
    preview: "@/assets/cesiumImg/02_天地图影像.png",
  },
  {
    id: 3,
    name: "天地图标注",
    fileName: "cesiumExample/basic/03_天地图标注.vue",
    category: 11,
    preview: "@/assets/cesiumImg/03_天地图标注.png",
  },
  {
    id: 4,
    name: "高德地图",
    fileName: "cesiumExample/basic/04_高德地图.vue",
    category: 11,
    preview: "@/assets/cesiumImg/04_高德地图.png",
  },
  {
    id: 5,
    name: "顶级影像",
    fileName: "cesiumExample/basic/05_顶级影像.vue",
    category: 11,
    preview: "@/assets/cesiumImg/05_顶级影像.png",
  },
  {
    id: 6,
    name: "底图综合案例",
    fileName: "cesiumExample/basic/06_底图综合案例.vue",
    category: 11,
    preview: "@/assets/cesiumImg/06_底图综合案例.png",
  },
  {
    id: 51,
    name: "全球OSM",
    fileName: "cesiumExample/basic/51_全球OSM.vue",
    category: 11,
    preview: "@/assets/cesiumImg/51_全球OSM.png",
  },

  // 1.2 相机与交互
  {
    id: 11,
    name: "默认相机视角",
    fileName: "cesiumExample/basic/11_默认相机视角.vue",
    category: 12,
    preview: "@/assets/cesiumImg/11_默认相机视角.png",
  },
  {
    id: 12,
    name: "相机常用方法",
    fileName: "cesiumExample/basic/12_相机常用方法.vue",
    category: 12,
    preview: "@/assets/cesiumImg/12_相机常用方法.png",
  },
  {
    id: 13,
    name: "键盘控制相机交互",
    fileName: "cesiumExample/basic/13_键盘控制相机交互.vue",
    category: 12,
    preview: "@/assets/cesiumImg/13_键盘控制相机交互.png",
  },
  {
    id: 14,
    name: "坐标系转换",
    fileName: "cesiumExample/basic/14_坐标系转换.vue",
    category: 12,
    preview: "@/assets/cesiumImg/14_坐标系转换.png",
  },
  {
    id: 15,
    name: "屏幕事件",
    fileName: "cesiumExample/basic/15_屏幕事件.vue",
    category: 12,
    preview: "@/assets/cesiumImg/15_屏幕事件.png",
  },
  {
    id: 16,
    name: "相机事件",
    fileName: "cesiumExample/basic/16_相机事件.vue",
    category: 12,
    preview: "@/assets/cesiumImg/16_相机事件.png",
  },
  {
    id: 17,
    name: "渲染事件",
    fileName: "cesiumExample/basic/17_渲染事件.vue",
    category: 12,
    preview: "@/assets/cesiumImg/17_渲染事件.png",
  },

  // 1.3 实体对象
  {
    id: 18,
    name: "实体点",
    fileName: "cesiumExample/basic/18_实体点.vue",
    category: 13,
    preview: "@/assets/cesiumImg/18_实体点.png",
  },
  {
    id: 19,
    name: "聚合点",
    fileName: "cesiumExample/basic/19_聚合点.vue",
    category: 13,
    preview: "@/assets/cesiumImg/19_聚合点.png",
  },
  {
    id: 20,
    name: "实体线",
    fileName: "cesiumExample/basic/20_实体线.vue",
    category: 13,
    preview: "@/assets/cesiumImg/20_实体线.png",
  },
  {
    id: 21,
    name: "实体面",
    fileName: "cesiumExample/basic/21_实体面.vue",
    category: 13,
    preview: "@/assets/cesiumImg/21_实体面.png",
  },
  {
    id: 22,
    name: "带孔洞面",
    fileName: "cesiumExample/basic/22_带孔洞面.vue",
    category: 13,
    preview: "@/assets/cesiumImg/22_带孔洞面.png",
  },
  {
    id: 26,
    name: "标签",
    fileName: "cesiumExample/basic/26_标签.vue",
    category: 13,
    preview: "@/assets/cesiumImg/26_标签.png",
  },
  {
    id: 27,
    name: "广告牌",
    fileName: "cesiumExample/basic/27_广告牌.vue",
    category: 13,
    preview: "@/assets/cesiumImg/27_广告牌.png",
  },
  {
    id: 28,
    name: "矩形",
    fileName: "cesiumExample/basic/28_矩形.vue",
    category: 13,
    preview: "@/assets/cesiumImg/28_矩形.png",
  },
  {
    id: 29,
    name: "墙",
    fileName: "cesiumExample/basic/29_墙.vue",
    category: 13,
    preview: "@/assets/cesiumImg/29_墙.png",
  },
  {
    id: 30,
    name: "椭圆",
    fileName: "cesiumExample/basic/30_椭圆.vue",
    category: 13,
    preview: "@/assets/cesiumImg/30_椭圆.png",
  },
  {
    id: 31,
    name: "椭圆体",
    fileName: "cesiumExample/basic/31_椭圆体.vue",
    category: 13,
    preview: "@/assets/cesiumImg/31_椭圆体.png",
  },
  {
    id: 32,
    name: "圆柱体",
    fileName: "cesiumExample/basic/32_圆柱体.vue",
    category: 13,
    preview: "@/assets/cesiumImg/32_圆柱体.png",
  },
  {
    id: 33,
    name: "箱",
    fileName: "cesiumExample/basic/33_箱.vue",
    category: 13,
    preview: "@/assets/cesiumImg/33_箱.png",
  },
  {
    id: 34,
    name: "走廊",
    fileName: "cesiumExample/basic/34_走廊.vue",
    category: 13,
    preview: "@/assets/cesiumImg/34_走廊.png",
  },

  // 1.4 模型与3DTiles
  {
    id: 23,
    name: "模型加载",
    fileName: "cesiumExample/basic/23_模型加载.vue",
    category: 14,
    preview: "@/assets/cesiumImg/23_模型加载.png",
  },
  {
    id: 24,
    name: "模型动画",
    fileName: "cesiumExample/basic/24_模型动画.vue",
    category: 14,
    preview: "@/assets/cesiumImg/24_模型动画.png",
  },
  {
    id: 25,
    name: "模型裁剪",
    fileName: "cesiumExample/basic/25_模型裁剪.vue",
    category: 14,
    preview: "@/assets/cesiumImg/25_模型裁剪.png",
  },
  {
    id: 47,
    name: "添加模型",
    fileName: "cesiumExample/basic/47_添加模型.vue",
    category: 14,
    preview: "@/assets/cesiumImg/47_添加模型.png",
  },

  // 1.5 材质与外观
  {
    id: 36,
    name: "动态颜色材质",
    fileName: "cesiumExample/basic/36_动态颜色材质.vue",
    category: 15,
    preview: "@/assets/cesiumImg/36_动态颜色材质.png",
  },
  {
    id: 37,
    name: "图片材质",
    fileName: "cesiumExample/basic/37_图片材质.vue",
    category: 15,
    preview: "@/assets/cesiumImg/37_图片材质.png",
  },
  {
    id: 38,
    name: "棋盘材质",
    fileName: "cesiumExample/basic/38_棋盘材质.vue",
    category: 15,
    preview: "@/assets/cesiumImg/38_棋盘材质.png",
  },
  {
    id: 39,
    name: "条纹材质",
    fileName: "cesiumExample/basic/39_条纹材质.vue",
    category: 15,
    preview: "@/assets/cesiumImg/39_条纹材质.png",
  },
  {
    id: 40,
    name: "网格材质",
    fileName: "cesiumExample/basic/40_网格材质.vue",
    category: 15,
    preview: "@/assets/cesiumImg/40_网格材质.png",
  },
  {
    id: 41,
    name: "折线发光材质",
    fileName: "cesiumExample/basic/41_折线发光材质.vue",
    category: 15,
    preview: "@/assets/cesiumImg/41_折线发光材质.png",
  },
  {
    id: 42,
    name: "折线轮廓材质",
    fileName: "cesiumExample/basic/42_折线轮廓材质.vue",
    category: 15,
    preview: "@/assets/cesiumImg/42_折线轮廓材质.png",
  },
  {
    id: 43,
    name: "折线虚线材质",
    fileName: "cesiumExample/basic/43_折线虚线材质.vue",
    category: 15,
    preview: "@/assets/cesiumImg/43_折线虚线材质.png",
  },
  {
    id: 44,
    name: "折线箭头材质",
    fileName: "cesiumExample/basic/44_折线箭头材质.vue",
    category: 15,
    preview: "@/assets/cesiumImg/44_折线箭头材质.png",
  },
  {
    id: 48,
    name: "PerInstanceColorAppearance",
    fileName: "cesiumExample/basic/48_PerInstanceColorAppearance.vue",
    category: 15,
    preview: "@/assets/cesiumImg/48_PerInstanceColorAppearance.png",
  },
  {
    id: 49,
    name: "EllipsoidSurfaceAppearance",
    fileName: "cesiumExample/basic/49_EllipsoidSurfaceAppearance.vue",
    category: 15,
    preview: "@/assets/cesiumImg/49_EllipsoidSurfaceAppearance.png",
  },
  {
    id: 50,
    name: "PolylineMaterialAppearance",
    fileName: "cesiumExample/basic/50_PolylineMaterialAppearance.vue",
    category: 15,
    preview: "@/assets/cesiumImg/50_PolylineMaterialAppearance.png",
  },

  // 1.6 图元
  {
    id: 45,
    name: "矩形图元",
    fileName: "cesiumExample/basic/45_矩形图元.vue",
    category: 16,
    preview: "@/assets/cesiumImg/45_矩形图元.png",
  },
  {
    id: 46,
    name: "箱图元",
    fileName: "cesiumExample/basic/46_箱图元.vue",
    category: 16,
    preview: "@/assets/cesiumImg/46_箱图元.png",
  },

  // 1.7 数据加载
  {
    id: 9,
    name: "加载GeoJSON",
    fileName: "cesiumExample/basic/09_加载GeoJSON.vue",
    category: 17,
    preview: "@/assets/cesiumImg/09_加载GeoJSON.png",
  },
  {
    id: 56,
    name: "CZML",
    fileName: "cesiumExample/basic/56_CZML.vue",
    category: 17,
    preview: "@/assets/cesiumImg/56_CZML.png",
  },
  {
    id: 57,
    name: "KML",
    fileName: "cesiumExample/basic/57_KML.vue",
    category: 17,
    preview: "@/assets/cesiumImg/57_KML.png",
  },

  // 1.8 其他
  {
    id: 7,
    name: "气泡窗口",
    fileName: "cesiumExample/basic/07_气泡窗口.vue",
    category: 18,
    preview: "@/assets/cesiumImg/07_气泡窗口.png",
  },
  {
    id: 8,
    name: "自定义天空盒",
    fileName: "cesiumExample/basic/08_自定义天空盒.vue",
    category: 18,
    preview: "@/assets/cesiumImg/08_自定义天空盒.png",
  },
  {
    id: 10,
    name: "海量点",
    fileName: "cesiumExample/basic/10_海量点.vue",
    category: 18,
    preview: "@/assets/cesiumImg/10_海量点.png",
  },
  {
    id: 53,
    name: "点击事件及样式表达式",
    fileName: "cesiumExample/basic/53_点击事件及样式表达式.vue",
    category: 18,
    preview: "@/assets/cesiumImg/53_点击事件及样式表达式.png",
  },
  {
    id: 55,
    name: "区域掩膜",
    fileName: "cesiumExample/basic/55_区域掩膜.vue",
    category: 18,
    preview: "@/assets/cesiumImg/55_区域掩膜.png",
  },

  // 2.1 进阶功能
  {
    id: 101,
    name: "网格",
    fileName: "cesiumExample/advanced/01_网格.vue",
    category: 21,
    preview: "@/assets/cesiumImg/101_网格.png",
  },
  {
    id: 102,
    name: "飞机飞行",
    fileName: "cesiumExample/advanced/02_飞机飞行.vue",
    category: 21,
    preview: "@/assets/cesiumImg/102_飞机飞行.png",
  },
  {
    id: 103,
    name: "加载控件",
    fileName: "cesiumExample/advanced/03_加载控件.vue",
    category: 21,
    preview: "@/assets/cesiumImg/103_加载控件.png",
  },
  {
    id: 104,
    name: "GUI调试",
    fileName: "cesiumExample/advanced/04_GUI调试.vue",
    category: 21,
    preview: "@/assets/cesiumImg/104_GUI调试.png",
  },
  {
    id: 105,
    name: "动态时序图",
    fileName: "cesiumExample/advanced/05_动态时序图.vue",
    category: 21,
    preview: "@/assets/cesiumImg/105_动态时序图.png",
  },
  {
    id: 106,
    name: "沿线标注",
    fileName: "cesiumExample/advanced/06_沿线标注.vue",
    category: 21,
    preview: "@/assets/cesiumImg/106_沿线标注.png",
  },
];

// 根据 ID 获取示例
export function getExampleById(id) {
  return examples.find((ex) => ex.id === id);
}

// 加载示例代码
export async function loadExampleCode(fileName) {
  try {
    // 匹配 views 下的所有 .vue 文件，包括子目录
    const modules = import.meta.glob("../views/**/*.vue", {
      as: "raw",
      eager: false,
    });

    // 构造模块路径，fileName 已经包含了 cesiumExample/basic/ 前缀
    const modulePath = `../views/${fileName}`;

    if (modules[modulePath]) {
      const code = await modules[modulePath]();
      return normalizeExampleTokens(code);
    }

    throw new Error(`找不到示例文件: ${fileName} (路径: ${modulePath})`);
  } catch (error) {
    console.error("加载示例代码失败:", error);
    throw error;
  }
}

function normalizeExampleTokens(code) {
  let result = String(code || "");

  result = result.replace(
    /^\s*(const|let|var)\s+token\s*=\s*['"][^'"]+['"]\s*;?\s*$/gm,
    "$1 token = window.TIANDITU_TOKEN;",
  );

  result = result.replace(
    /Cesium\.Ion\.defaultAccessToken\s*=\s*(?:\s*['"][^'"]+['"]\s*;?|\s*[\s\S]*?\s*;)/g,
    "Cesium.Ion.defaultAccessToken = window.CESIUM_ION_TOKEN;",
  );

  return result;
}
