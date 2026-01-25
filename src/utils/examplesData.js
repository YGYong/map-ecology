
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
    subcategories: [
      { id: 21, name: "进阶功能", count: 6, parentId: 2 },
    ],
  },
];

// 示例数据
export const examples = [
  // 1.1 地图与影像
  { id: 2, name: "02_天地图影像", fileName: "cesiumExample/basic/02_天地图影像.vue", category: 11, preview: "" },
  { id: 3, name: "03_天地图标注", fileName: "cesiumExample/basic/03_天地图标注.vue", category: 11, preview: "" },
  { id: 4, name: "04_高德地图", fileName: "cesiumExample/basic/04_高德地图.vue", category: 11, preview: "" },
  { id: 5, name: "05_顶级影像", fileName: "cesiumExample/basic/05_顶级影像.vue", category: 11, preview: "" },
  { id: 6, name: "06_底图综合案例", fileName: "cesiumExample/basic/06_底图综合案例.vue", category: 11, preview: "" },
  { id: 51, name: "51_全球OSM", fileName: "cesiumExample/basic/51_全球OSM.vue", category: 11, preview: "" },

  // 1.2 相机与交互
  { id: 11, name: "11_默认相机视角", fileName: "cesiumExample/basic/11_默认相机视角.vue", category: 12, preview: "" },
  { id: 12, name: "12_相机常用方法", fileName: "cesiumExample/basic/12_相机常用方法.vue", category: 12, preview: "" },
  { id: 13, name: "13_键盘控制相机交互", fileName: "cesiumExample/basic/13_键盘控制相机交互.vue", category: 12, preview: "" },
  { id: 14, name: "14_坐标系转换", fileName: "cesiumExample/basic/14_坐标系转换.vue", category: 12, preview: "" },
  { id: 15, name: "15_屏幕事件", fileName: "cesiumExample/basic/15_屏幕事件.vue", category: 12, preview: "" },
  { id: 16, name: "16_相机事件", fileName: "cesiumExample/basic/16_相机事件.vue", category: 12, preview: "" },
  { id: 17, name: "17_渲染事件", fileName: "cesiumExample/basic/17_渲染事件.vue", category: 12, preview: "" },

  // 1.3 实体对象
  { id: 18, name: "18_实体点", fileName: "cesiumExample/basic/18_实体点.vue", category: 13, preview: "" },
  { id: 19, name: "19_聚合点", fileName: "cesiumExample/basic/19_聚合点.vue", category: 13, preview: "" },
  { id: 20, name: "20_实体线", fileName: "cesiumExample/basic/20_实体线.vue", category: 13, preview: "" },
  { id: 21, name: "21_实体面", fileName: "cesiumExample/basic/21_实体面.vue", category: 13, preview: "" },
  { id: 22, name: "22_带孔洞面", fileName: "cesiumExample/basic/22_带孔洞面.vue", category: 13, preview: "" },
  { id: 26, name: "26_标签", fileName: "cesiumExample/basic/26_标签.vue", category: 13, preview: "" },
  { id: 27, name: "27_广告牌", fileName: "cesiumExample/basic/27_广告牌.vue", category: 13, preview: "" },
  { id: 28, name: "28_矩形", fileName: "cesiumExample/basic/28_矩形.vue", category: 13, preview: "" },
  { id: 29, name: "29_墙", fileName: "cesiumExample/basic/29_墙.vue", category: 13, preview: "" },
  { id: 30, name: "30_椭圆", fileName: "cesiumExample/basic/30_椭圆.vue", category: 13, preview: "" },
  { id: 31, name: "31_椭圆体", fileName: "cesiumExample/basic/31_椭圆体.vue", category: 13, preview: "" },
  { id: 32, name: "32_圆柱体", fileName: "cesiumExample/basic/32_圆柱体.vue", category: 13, preview: "" },
  { id: 33, name: "33_箱", fileName: "cesiumExample/basic/33_箱.vue", category: 13, preview: "" },
  { id: 34, name: "34_走廊", fileName: "cesiumExample/basic/34_走廊.vue", category: 13, preview: "" },

  // 1.4 模型与3DTiles
  { id: 23, name: "23_模型加载", fileName: "cesiumExample/basic/23_模型加载.vue", category: 14, preview: "" },
  { id: 24, name: "24_模型动画", fileName: "cesiumExample/basic/24_模型动画.vue", category: 14, preview: "" },
  { id: 25, name: "25_模型裁剪", fileName: "cesiumExample/basic/25_模型裁剪.vue", category: 14, preview: "" },
  { id: 47, name: "47_添加模型", fileName: "cesiumExample/basic/47_添加模型.vue", category: 14, preview: "" },
  { id: 52, name: "52_3DTiles加载状态监听", fileName: "cesiumExample/basic/52_3DTiles加载状态监听.vue", category: 14, preview: "" },

  // 1.5 材质与外观
  { id: 36, name: "36_动态颜色材质", fileName: "cesiumExample/basic/36_动态颜色材质.vue", category: 15, preview: "" },
  { id: 37, name: "37_图片材质", fileName: "cesiumExample/basic/37_图片材质.vue", category: 15, preview: "" },
  { id: 38, name: "38_棋盘材质", fileName: "cesiumExample/basic/38_棋盘材质.vue", category: 15, preview: "" },
  { id: 39, name: "39_条纹材质", fileName: "cesiumExample/basic/39_条纹材质.vue", category: 15, preview: "" },
  { id: 40, name: "40_网格材质", fileName: "cesiumExample/basic/40_网格材质.vue", category: 15, preview: "" },
  { id: 41, name: "41_折线发光材质", fileName: "cesiumExample/basic/41_折线发光材质.vue", category: 15, preview: "" },
  { id: 42, name: "42_折线轮廓材质", fileName: "cesiumExample/basic/42_折线轮廓材质.vue", category: 15, preview: "" },
  { id: 43, name: "43_折线虚线材质", fileName: "cesiumExample/basic/43_折线虚线材质.vue", category: 15, preview: "" },
  { id: 44, name: "44_折线箭头材质", fileName: "cesiumExample/basic/44_折线箭头材质.vue", category: 15, preview: "" },
  { id: 48, name: "48_PerInstanceColorAppearance", fileName: "cesiumExample/basic/48_PerInstanceColorAppearance.vue", category: 15, preview: "" },
  { id: 49, name: "49_EllipsoidSurfaceAppearance", fileName: "cesiumExample/basic/49_EllipsoidSurfaceAppearance.vue", category: 15, preview: "" },
  { id: 50, name: "50_PolylineMaterialAppearance", fileName: "cesiumExample/basic/50_PolylineMaterialAppearance.vue", category: 15, preview: "" },

  // 1.6 图元
  { id: 45, name: "45_矩形图元", fileName: "cesiumExample/basic/45_矩形图元.vue", category: 16, preview: "" },
  { id: 46, name: "46_箱图元", fileName: "cesiumExample/basic/46_箱图元.vue", category: 16, preview: "" },

  // 1.7 数据加载
  { id: 9, name: "09_加载GeoJSON", fileName: "cesiumExample/basic/09_加载GeoJSON.vue", category: 17, preview: "" },
  { id: 54, name: "54_GeoJSON", fileName: "cesiumExample/basic/54_GeoJSON.vue", category: 17, preview: "" },
  { id: 56, name: "56_CZML", fileName: "cesiumExample/basic/56_CZML.vue", category: 17, preview: "" },
  { id: 57, name: "57_KML", fileName: "cesiumExample/basic/57_KML.vue", category: 17, preview: "" },

  // 1.8 其他
  { id: 7, name: "07_气泡窗口", fileName: "cesiumExample/basic/07_气泡窗口.vue", category: 18, preview: "" },
  { id: 8, name: "08_自定义天空盒", fileName: "cesiumExample/basic/08_自定义天空盒.vue", category: 18, preview: "" },
  { id: 10, name: "10_海量图标", fileName: "cesiumExample/basic/10_海量图标.vue", category: 18, preview: "" },
  { id: 35, name: "35_实体生命周期", fileName: "cesiumExample/basic/35_实体生命周期.vue", category: 18, preview: "" },
  { id: 53, name: "53_点击事件及样式表达式", fileName: "cesiumExample/basic/53_点击事件及样式表达式.vue", category: 18, preview: "" },
  { id: 55, name: "55_区域掩膜", fileName: "cesiumExample/basic/55_区域掩膜.vue", category: 18, preview: "" },

  // 2.1 进阶功能
  { id: 101, name: "01_网格", fileName: "cesiumExample/advanced/01_网格.vue", category: 21, preview: "" },
  { id: 102, name: "02_飞机飞行", fileName: "cesiumExample/advanced/02_飞机飞行.vue", category: 21, preview: "" },
  { id: 103, name: "03_加载控件", fileName: "cesiumExample/advanced/03_加载控件.vue", category: 21, preview: "" },
  { id: 104, name: "04_GUI调试", fileName: "cesiumExample/advanced/04_GUI调试.vue", category: 21, preview: "" },
  { id: 105, name: "05_动态时序图", fileName: "cesiumExample/advanced/05_动态时序图.vue", category: 21, preview: "" },
  { id: 106, name: "06_沿线标注", fileName: "cesiumExample/advanced/06_沿线标注.vue", category: 21, preview: "" },
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
      return code;
    }

    throw new Error(`找不到示例文件: ${fileName} (路径: ${modulePath})`);
  } catch (error) {
    console.error("加载示例代码失败:", error);
    throw error;
  }
}
