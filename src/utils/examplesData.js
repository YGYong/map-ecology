// 示例分类数据 - 参考 Mars3D 网站的分类结构
export const categories = [
  { 
    id: 1, 
    name: "快速开始", 
    count: 5, 
    icon: "⚡",
    subcategories: [
      { id: 11, name: "快速开始示例", count: 5, parentId: 1 }
    ]
  },
  { 
    id: 2, 
    name: "三维场景", 
    count: 48, 
    icon: "🌍",
    subcategories: [
      { id: 21, name: "场景基础控制", count: 5, parentId: 2 },
      { id: 22, name: "球场景序列化", count: 10, parentId: 2 },
      { id: 23, name: "球场景基础", count: 5, parentId: 2 },
      { id: 24, name: "场景视觉控制", count: 7, parentId: 2 },
      { id: 25, name: "相机及视角", count: 7, parentId: 2 },
      { id: 26, name: "场景背景控制", count: 7, parentId: 2 },
      { id: 27, name: "其他", count: 7, parentId: 2 }
    ]
  },
  { 
    id: 3, 
    name: "三维地形", 
    count: 12, 
    icon: "⛰️",
    subcategories: [
      { id: 31, name: "地形示例", count: 12, parentId: 3 }
    ]
  },
  { 
    id: 4, 
    name: "瓦片图层", 
    count: 34, 
    icon: "🗺️",
    subcategories: [
      { id: 41, name: "瓦片图层示例", count: 34, parentId: 4 }
    ]
  },
  { 
    id: 5, 
    name: "矢量图层", 
    count: 33, 
    icon: "📊",
    subcategories: [
      { id: 51, name: "矢量图层示例", count: 33, parentId: 5 }
    ]
  },
  { 
    id: 6, 
    name: "3DTiles三维模型", 
    count: 40, 
    icon: "🏗️",
    subcategories: [
      { id: 61, name: "3DTiles示例", count: 40, parentId: 6 }
    ]
  },
  { 
    id: 7, 
    name: "矢量对象", 
    count: 205, 
    icon: "🎯",
    subcategories: [
      { id: 71, name: "点对象", count: 50, parentId: 7 },
      { id: 72, name: "线对象", count: 50, parentId: 7 },
      { id: 73, name: "面对象", count: 50, parentId: 7 },
      { id: 74, name: "模型对象", count: 55, parentId: 7 }
    ]
  },
  { 
    id: 8, 
    name: "工具控件", 
    count: 31, 
    icon: "🛠️",
    subcategories: [
      { id: 81, name: "工具控件示例", count: 31, parentId: 8 }
    ]
  },
  { 
    id: 9, 
    name: "环境特效", 
    count: 16, 
    icon: "✨",
    subcategories: [
      { id: 91, name: "环境特效示例", count: 16, parentId: 9 }
    ]
  },
  { 
    id: 10, 
    name: "管理分析", 
    count: 27, 
    icon: "📈",
    subcategories: [
      { id: 101, name: "管理分析示例", count: 27, parentId: 10 }
    ]
  }
];

// 示例数据
export const examples = [
  // 快速开始示例
  { id: 1, name: "01_初始化", fileName: "01_初始化.vue", category: 11, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Cesium+Init" },
  { id: 2, name: "02_天地图影像", fileName: "02_天地图影像.vue", category: 11, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=TianDiTu+Image" },
  { id: 3, name: "03_天地图标注", fileName: "03_天地图标注.vue", category: 11, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=TianDiTu+Label" },
  { id: 4, name: "04_高德地图", fileName: "04_高德地图.vue", category: 11, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Amap" },
  { id: 5, name: "05_顶级影像", fileName: "05_顶级影像.vue", category: 11, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Top+Image" },
  
  // 场景基础控制
  { id: 10, name: "10_场景初始化", fileName: "10_场景初始化.vue", category: 21, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Scene+Init" },
  { id: 11, name: "11_场景切换", fileName: "11_场景切换.vue", category: 21, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Scene+Switch" },
  { id: 12, name: "12_场景重置", fileName: "12_场景重置.vue", category: 21, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Scene+Reset" },
  { id: 13, name: "13_场景保存", fileName: "13_场景保存.vue", category: 21, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Scene+Save" },
  { id: 14, name: "14_场景加载", fileName: "14_场景加载.vue", category: 21, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Scene+Load" },
  { id: 7, name: "07_气泡窗口", fileName: "07_气泡窗口.vue", category: 21, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Popup+Window" },
  
  // 球场景序列化
  { id: 15, name: "15_场景序列化", fileName: "15_场景序列化.vue", category: 22, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Scene+Serialize" },
  { id: 16, name: "16_场景反序列化", fileName: "16_场景反序列化.vue", category: 22, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Scene+Deserialize" },
  { id: 17, name: "17_场景状态保存", fileName: "17_场景状态保存.vue", category: 22, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Scene+State" },
  
  // 相机及视角
  { id: 18, name: "18_默认相机视角", fileName: "11_默认相机视角.vue", category: 25, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Default+Camera" },
  { id: 19, name: "19_相机常用方法", fileName: "12_相机常用方法.vue", category: 25, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Camera+Methods" },
  { id: 20, name: "20_键盘控制相机", fileName: "13_键盘控制相机交互.vue", category: 25, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Keyboard+Camera" },
  
  // 点对象
  { id: 21, name: "21_实体点", fileName: "18_实体点.vue", category: 71, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Entity+Point" },
  { id: 22, name: "22_聚合点", fileName: "19_聚合点.vue", category: 71, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Point+Cluster" },
  { id: 23, name: "23_海量图标", fileName: "10_海量图标.vue", category: 71, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Mass+Icons" },
  
  // 线对象
  { id: 24, name: "24_实体线", fileName: "20_实体线.vue", category: 72, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Entity+Line" },
  { id: 25, name: "25_折线发光材质", fileName: "41_折线发光材质.vue", category: 72, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Glow+Line" },
  { id: 26, name: "26_折线轮廓材质", fileName: "42_折线轮廓材质.vue", category: 72, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Outline+Line" },
  { id: 27, name: "27_折线虚线材质", fileName: "43_折线虚线材质.vue", category: 72, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Dashed+Line" },
  { id: 44, name: "44_折线箭头材质", fileName: "44_折线箭头材质.vue", category: 72, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Arrow+Line" },
  
  // 面对象
  { id: 28, name: "28_实体面", fileName: "21_实体面.vue", category: 73, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Entity+Polygon" },
  { id: 29, name: "29_带孔洞面", fileName: "22_带孔洞面.vue", category: 73, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Hole+Polygon" },
  { id: 30, name: "30_动态颜色材质", fileName: "36_动态颜色材质.vue", category: 73, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Dynamic+Color" },
  
  // 模型对象
  { id: 31, name: "31_模型加载", fileName: "23_模型加载.vue", category: 74, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Model+Load" },
  { id: 32, name: "32_模型动画", fileName: "24_模型动画.vue", category: 74, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Model+Animation" },
  { id: 33, name: "33_模型裁剪", fileName: "25_模型裁剪.vue", category: 74, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Model+Clipping" },
  
  // 地形示例
  { id: 34, name: "34_地形加载", fileName: "地形加载.vue", category: 31, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Terrain+Load" },
  { id: 35, name: "35_地形分析", fileName: "地形分析.vue", category: 31, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Terrain+Analysis" },
  
  // 瓦片图层示例
  { id: 36, name: "36_瓦片图层管理", fileName: "瓦片图层管理.vue", category: 41, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Imagery+Manage" },
  { id: 37, name: "37_自定义瓦片图层", fileName: "自定义瓦片图层.vue", category: 41, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Custom+Imagery" },
  
  // 矢量图层示例
  { id: 38, name: "38_GeoJSON加载", fileName: "09_加载GeoJSON.vue", category: 51, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=GeoJSON+Load" },
  { id: 39, name: "39_KML加载", fileName: "KML加载.vue", category: 51, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=KML+Load" },
  
  // 3DTiles示例
  { id: 40, name: "40_3DTiles加载", fileName: "3DTiles加载.vue", category: 61, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=3DTiles+Load" },
  { id: 41, name: "41_3DTiles样式", fileName: "3DTiles样式.vue", category: 61, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=3DTiles+Style" },
  
  // 工具控件示例
  { id: 42, name: "42_测量工具", fileName: "测量工具.vue", category: 81, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Measurement" },
  { id: 43, name: "43_剖分工具", fileName: "剖分工具.vue", category: 81, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Section" },
  
  // 环境特效示例
  { id: 45, name: "45_自定义天空盒", fileName: "08_自定义天空盒.vue", category: 91, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Custom+Skybox" },
  { id: 46, name: "46_大气效果", fileName: "大气效果.vue", category: 91, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Atmosphere" },
  
  // 管理分析示例
  { id: 47, name: "47_空间分析", fileName: "空间分析.vue", category: 101, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Spatial+Analysis" },
  { id: 48, name: "48_路径规划", fileName: "路径规划.vue", category: 101, preview: "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Path+Planning" }
];

// 根据 ID 获取示例
export function getExampleById(id) {
  return examples.find((ex) => ex.id === id);
}

// 加载示例代码
export async function loadExampleCode(fileName) {
  try {
    const modules = import.meta.glob("../views/*.vue", {
      as: "raw",
      eager: false,
    });
    const modulePath = `../views/${fileName}`;

    if (modules[modulePath]) {
      const code = await modules[modulePath]();
      return code;
    }

    throw new Error(`找不到示例文件: ${fileName}`);
  } catch (error) {
    console.error("加载示例代码失败:", error);
    throw error;
  }
}
