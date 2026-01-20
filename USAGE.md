# Cesium 示例系统使用说明

## 功能概述

这是一个基于 Vue 3 + Cesium 的交互式示例系统，支持：

- ✅ 在线编辑和运行 Cesium 代码
- ✅ 每个示例都有独立的路由
- ✅ 实时预览效果
- ✅ 错误提示和调试
- ✅ 响应式布局（支持桌面和移动端）

## 路由系统

### 路由结构

- 首页：`/`
- 示例详情：`/examples/:id`

### 示例路由

基础分类下的天地图示例：

| 路由 | 示例名称 | 说明 |
|------|---------|------|
| `/examples/13` | 初始化 | Cesium Viewer 基础初始化 |
| `/examples/14` | 天地图影像 | 加载天地图影像底图 |
| `/examples/15` | 天地图标注 | 加载天地图影像+标注 |
| `/examples/16` | 高德地图 | 加载高德地图底图 |

## 使用方法

### 1. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:5174/` 启动（如果 5173 端口被占用）。

### 2. 浏览示例

1. 打开浏览器访问 `http://localhost:5174/`
2. 在左侧边栏点击"1、基础"展开分类
3. 点击任意示例（如"天地图影像"）
4. 系统会自动：
   - 更新路由到 `/examples/14`
   - 加载示例代码到编辑器
   - 运行代码并显示效果

### 3. 编辑和运行代码

1. 在代码编辑器中修改代码
2. 点击右上角"运行"按钮
3. 效果会实时显示在右侧 Cesium Viewer 中
4. 如果有错误，会在底部显示错误面板

### 4. 重置代码

点击"重置"按钮可以恢复到原始示例代码。

## 代码结构

### 核心文件

- `src/router.js` - 路由配置
- `src/utils/examplesData.js` - 示例数据和分类
- `src/components/NewMainLayout.vue` - 主布局组件
- `src/components/CodeEditor.vue` - 代码编辑器
- `src/components/CesiumViewer.vue` - Cesium 查看器
- `src/utils/codeExecutor.js` - 代码执行器（沙箱）
- `src/utils/sfcParser.js` - Vue SFC 解析器

### 添加新示例

在 `src/utils/examplesData.js` 中添加：

```javascript
{
  id: 17, // 唯一 ID
  category: 1, // 分类 ID（1 = 基础）
  name: '新示例名称',
  preview: 'data:image/svg+xml;base64,...', // 预览图
  code: `
<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
const cesiumContainer = ref(null);
let viewer = null;

onMounted(() => {
  viewer = new Cesium.Viewer(cesiumContainer.value);
  // 你的代码...
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
  `
}
```

然后在 `categories` 数组中更新对应分类的 `subcategories`：

```javascript
{
  id: 1,
  name: '基础',
  count: 17, // 更新数量
  subcategories: [
    // ... 其他示例
    { id: 17, name: '新示例名称' }
  ]
}
```

## 技术特性

### 路由集成

- 使用 Vue Router 管理路由
- 点击侧边栏自动更新 URL
- 支持直接访问示例 URL（如 `/examples/14`）
- 路由变化时自动加载对应示例

### 代码执行

- 使用 iframe 沙箱隔离执行环境
- 支持 Vue 3 Composition API
- 自动注入 Cesium API
- 错误捕获和提示

### 性能优化

- 示例预览图懒加载
- iframe 复用（避免重复创建）
- 代码执行性能监控

## 常见问题

### Q: 为什么点击示例后 URL 没有变化？

A: 确保已经正确导入并使用了 `useRouter` 和 `useRoute`。

### Q: 如何调试代码执行错误？

A: 查看底部的错误面板，它会显示错误类型、消息和行号。

### Q: 天地图加载失败怎么办？

A: 检查天地图 token 是否有效，或者网络连接是否正常。

### Q: 如何添加更多分类？

A: 在 `examplesData.js` 的 `categories` 数组中添加新的分类对象。

## 开发建议

1. **代码格式**：所有示例代码必须是有效的 Vue SFC 格式
2. **样式隔离**：使用 `scoped` 样式避免污染全局
3. **资源清理**：在 `onUnmounted` 中清理 Cesium 资源
4. **错误处理**：使用 try-catch 捕获可能的错误
5. **性能考虑**：避免在示例中创建过多实体

## 许可证

MIT
