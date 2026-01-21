// 示例分类数据
export const categories = [{ id: 1, name: "基础示例", count: 4 }];

// 示例数据
export const examples = [
  {
    id: 1,
    name: "01_初始化",
    fileName: "01_初始化.vue",
    category: 1,
    preview:
      "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Cesium+Init",
  },
  {
    id: 2,
    name: "02_天地图影像",
    fileName: "02_天地图影像.vue",
    category: 1,
    preview:
      "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=TianDiTu+Image",
  },
  {
    id: 3,
    name: "03_天地图标注",
    fileName: "03_天地图标注.vue",
    category: 1,
    preview:
      "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=TianDiTu+Label",
  },
  {
    id: 7,
    name: "07_气泡窗口",
    fileName: "07_气泡窗口.vue",
    category: 1,
    preview:
      "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Popup+Window",
  },
  {
    id: 44,
    name: "44_折线箭头材质",
    fileName: "44_折线箭头材质.vue",
    category: 1,
    preview:
      "https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Popup+Window",
  },
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
