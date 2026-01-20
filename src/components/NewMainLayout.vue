<template>
  <div class="app-container">
    <!-- 顶部大专栏导航 -->
    <header class="top-navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <!-- 移动端侧边栏切换按钮 -->
          <button 
            class="sidebar-toggle-btn" 
            @click="toggleSidebar"
            aria-label="切换侧边栏"
          >
            <el-icon><Menu /></el-icon>
          </button>
          <h1 class="logo">Cesium 专栏</h1>
          <nav class="main-nav">
            <ul class="nav-list">
              <li><a href="#" class="nav-item active">Cesium Examples</a></li>
              <li><a href="#" class="nav-item">Three Examples</a></li>
              <li><a href="#" class="nav-item">WebGL</a></li>
              <li><a href="#" class="nav-item">WebGPU</a></li>
              <li><a href="#" class="nav-item">Cesium 官网</a></li>
            </ul>
          </nav>
        </div>
        <div class="navbar-right">
          <div class="nav-tools">
            <span class="tool-item">版权</span>
            <span class="tool-item">贡献</span>
            <span class="tool-item">源码</span>
            <span class="tool-item">==></span>
            <span class="tool-item">
              <el-icon><Menu /></el-icon>
            </span>
            <span class="tool-item">
              <el-icon><Setting /></el-icon>
            </span>
            <span class="tool-item">
              <el-icon><FullScreen /></el-icon>
            </span>
            <span class="tool-item">
              <el-icon><Refresh /></el-icon>
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主体内容区 -->
    <div class="main-container">
      <!-- 左侧案例分类 -->
      <aside 
        class="sidebar" 
        :class="{ 'sidebar-visible': isSidebarVisible }"
      >
        <nav class="category-nav">
          <ul class="category-list">
            <li
              v-for="category in categoriesData"
              :key="category.id"
              class="category-item"
            >
              <div class="category-header" @click="toggleCategoryAndRefreshLazyLoad(category.id)">
                <span class="category-index"
                  >{{ category.id }}、{{ category.name }}</span
                >
                <span class="category-count">({{ category.count }})</span>
                <el-icon
                  class="toggle-icon"
                  :class="{
                    expanded: expandedCategories.includes(category.id),
                  }"
                >
                  <ArrowRight />
                </el-icon>
              </div>
              <ul
                v-if="expandedCategories.includes(category.id)"
                class="subcategory-list"
              >
                <li
                  v-for="subcategory in category.subcategories"
                  :key="subcategory.id"
                  class="subcategory-item"
                  @click="selectExample(subcategory)"
                >
                  {{ subcategory.name }}
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>
      
      <!-- 移动端侧边栏遮罩 -->
      <div 
        v-if="isSidebarVisible" 
        class="sidebar-overlay"
        @click="toggleSidebar"
      ></div>

      <!-- 右侧内容区 -->
      <main class="content-area">
        <!-- 内容头部 -->
        <div class="content-header">
          <h2 class="content-title">{{ currentCategoryName }}</h2>
          <div class="content-actions">
            <el-button size="small" @click="resetCode">重置</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="runCode"
              :disabled="isRunning"
              :loading="isRunning"
            >
              运行
            </el-button>
          </div>
        </div>

        <!-- 案例列表 -->
        <div v-if="!selectedExample" class="examples-grid">
          <div
            v-for="example in currentExamples"
            :key="example.id"
            class="example-card"
            @click="selectExample(example)"
          >
            <div class="example-preview">
              <!-- Requirement 9.4: Lazy load example preview images -->
              <img 
                :data-src="example.preview" 
                :alt="example.name"
                class="lazy-image"
                loading="lazy"
              />
            </div>
            <div class="example-info">
              <h3 class="example-name">{{ example.name }}</h3>
            </div>
          </div>
        </div>

        <!-- 代码编辑器和效果图 -->
        <div v-else class="example-detail">
          <div class="code-editor-container">
            <div class="editor-tabs">
              <div
                class="tab-item"
                :class="{ active: activeTab === 'js' }"
                @click="activeTab = 'js'"
              >
                JS 代码
              </div>
              <div
                class="tab-item"
                :class="{ active: activeTab === 'source' }"
                @click="activeTab = 'source'"
              >
                完整源码（可编辑）
              </div>
            </div>
            <div class="editor-content">
              <code-editor v-model="code" @run="runCode" />
            </div>
          </div>
          <div class="cesium-viewer-container">
            <cesium-viewer ref="cesiumViewer" />
          </div>
        </div>
      </main>
    </div>

    <!-- 错误面板 -->
    <error-panel 
      :error="latestError" 
      @close="clearErrors" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CodeEditor from "./CodeEditor.vue"
import CesiumViewer from "./CesiumViewer.vue"
import ErrorPanel from "./ErrorPanel.vue"
import {
  Menu,
  Setting,
  FullScreen,
  Refresh,
  ArrowRight,
} from "@element-plus/icons-vue"
import { examples, categories } from "../utils/examplesData"
import { parseSFC } from "../utils/sfcParser"
import { CodeExecutor } from "../utils/codeExecutor"
import { useErrorHandler } from "../composables/useErrorHandler"

/**
 * NewMainLayout Component
 * 
 * 主布局组件，协调各子组件的交互
 * 
 * 职责：
 * - 管理示例选择和分类导航
 * - 集成代码编辑器和 Cesium 查看器
 * - 处理代码执行流程（解析 SFC -> 执行代码）
 * - 集成错误处理和展示
 * - 实现代码重置和运行控制
 * - 实现性能优化（懒加载、防抖等）
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 9.4
 */

// ========== 路由 ==========
const router = useRouter()
const route = useRoute()

// ========== 错误处理 ==========
const { errors, addError, clearErrors, latestError } = useErrorHandler()

// ========== 状态管理 ==========
const expandedCategories = ref([1]) // 默认展开"基础"分类
const selectedExample = ref(null)
const code = ref("")
const originalCode = ref("") // 存储原始代码用于重置
const currentCategory = ref(0)
const activeTab = ref("js") // 默认显示 JS 代码标签
const isRunning = ref(false) // 运行按钮禁用状态
const isSidebarVisible = ref(false) // 移动端侧边栏显示状态

// 分类数据
const categoriesData = categories

// 示例数据
const examplesData = examples

// Cesium Viewer 引用
const cesiumViewer = ref(null)

// 代码执行器实例（延迟初始化）
let codeExecutor = null

// Lazy loading observer (Requirement 9.4)
let lazyLoadObserver = null

// ========== 生命周期 ==========

/**
 * 组件挂载后初始化懒加载
 * Requirement 9.4: 实现示例预览图懒加载
 */
onMounted(() => {
  initLazyLoading()
  
  // 如果路由中有示例 ID，加载对应示例
  if (route.params.id) {
    const exampleId = parseInt(route.params.id)
    const example = examplesData.find(ex => ex.id === exampleId)
    if (example) {
      selectExample(example)
    }
  }
})

/**
 * 监听路由变化，加载对应示例
 */
watch(() => route.params.id, (newId) => {
  if (newId) {
    const exampleId = parseInt(newId)
    const example = examplesData.find(ex => ex.id === exampleId)
    if (example) {
      selectExample(example)
    }
  }
})

// ========== 计算属性 ==========

/**
 * 当前分类名称
 * Requirement 7.2: 显示分类名称
 */
const currentCategoryName = computed(() => {
  const category = categoriesData.find(
    (cat) => cat.id === currentCategory.value
  )
  return category ? category.name : "综合应用"
})

/**
 * 当前分类下的示例
 * Requirement 7.3: 根据分类筛选示例
 */
const currentExamples = computed(() => {
  return examplesData.filter(
    (example) => example.category === currentCategory.value
  )
})

// ========== 方法 ==========

/**
 * 初始化懒加载
 * Requirement 9.4: 实现示例预览图懒加载以减少初始加载时间
 * 
 * 使用 Intersection Observer API 实现图片懒加载
 */
function initLazyLoading() {
  // Check if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all images immediately
    loadAllImages()
    return
  }
  
  // Create observer for lazy loading
  lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.getAttribute('data-src')
        
        if (src) {
          // Load the image
          img.src = src
          img.removeAttribute('data-src')
          img.classList.add('loaded')
          
          // Stop observing this image
          lazyLoadObserver.unobserve(img)
        }
      }
    })
  }, {
    // Load images slightly before they enter viewport
    rootMargin: '50px 0px',
    threshold: 0.01
  })
  
  // Observe all lazy images
  nextTick(() => {
    const lazyImages = document.querySelectorAll('.lazy-image')
    lazyImages.forEach(img => {
      lazyLoadObserver.observe(img)
    })
  })
}

/**
 * 加载所有图片（降级方案）
 * 当浏览器不支持 IntersectionObserver 时使用
 */
function loadAllImages() {
  nextTick(() => {
    const lazyImages = document.querySelectorAll('.lazy-image')
    lazyImages.forEach(img => {
      const src = img.getAttribute('data-src')
      if (src) {
        img.src = src
        img.removeAttribute('data-src')
        img.classList.add('loaded')
      }
    })
  })
}

/**
 * 切换分类展开/收起
 * Requirement 8.5: 提供分类导航交互
 */
function toggleCategory(categoryId) {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

/**
 * 切换侧边栏显示/隐藏（移动端）
 * Requirement 8.5: 提供侧边栏切换按钮
 */
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value
}

/**
 * 选择示例
 * 
 * Requirement 7.3: 加载示例代码到编辑器
 * Requirement 10.1: 存储原始代码用于重置
 * Requirement 8.5: 选择示例后在移动端自动关闭侧边栏
 */
async function selectExample(example) {
  // 查找对应的完整示例数据
  const fullExample = examplesData.find((ex) => ex.id === example.id)
  if (fullExample) {
    selectedExample.value = fullExample
    code.value = fullExample.code
    originalCode.value = fullExample.code // 保存原始代码
    
    // 更新路由（如果当前路由不是该示例）
    if (route.params.id !== String(fullExample.id)) {
      router.push(`/examples/${fullExample.id}`)
    }
    
    // 移动端自动关闭侧边栏
    if (window.innerWidth <= 768) {
      isSidebarVisible.value = false
    }
    
    // 等待 DOM 更新和 Viewer 初始化
    await nextTick()
    
    // 等待 Viewer 准备就绪
    await waitForViewer()
    
    // 自动运行代码
    runCode()
  }
}

/**
 * 等待 Cesium Viewer 初始化完成
 * 
 * 使用轮询机制检查 Viewer 是否已经初始化
 * 最多等待 5 秒，超时后放弃
 */
async function waitForViewer(maxWaitTime = 5000, checkInterval = 100) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    // 检查 cesiumViewer ref 是否存在且有 getViewer 方法
    if (cesiumViewer.value && cesiumViewer.value.getViewer) {
      const viewerInstance = cesiumViewer.value.getViewer()
      
      // 检查 Viewer 实例是否已经创建
      if (viewerInstance) {
        return true
      }
    }
    
    // 等待一段时间后再次检查
    await new Promise(resolve => setTimeout(resolve, checkInterval))
  }
  
  // 超时
  return false
}

/**
 * 切换分类时重新初始化懒加载
 * Requirement 9.4: 确保新加载的图片也能懒加载
 */
function toggleCategoryAndRefreshLazyLoad(categoryId) {
  toggleCategory(categoryId)
  
  // 重新初始化懒加载以观察新的图片
  nextTick(() => {
    if (lazyLoadObserver) {
      const lazyImages = document.querySelectorAll('.lazy-image:not(.loaded)')
      lazyImages.forEach(img => {
        lazyLoadObserver.observe(img)
      })
    }
  })
}

/**
 * 重置代码到原始状态
 * 
 * Requirement 10.1: 恢复原始示例代码
 * Requirement 10.3: 清除错误消息
 */
async function resetCode() {
  if (selectedExample.value) {
    code.value = originalCode.value
    clearErrors() // 清除错误
    
    // 等待 DOM 更新
    await nextTick()
    
    // 等待 Viewer 准备就绪
    await waitForViewer()
    
    runCode() // 重新运行代码
  }
}

/**
 * 运行代码
 * 
 * 完整的代码执行流程：
 * 1. 解析 Vue SFC
 * 2. 检查解析错误
 * 3. 获取 Viewer 实例
 * 4. 创建代码执行器
 * 5. 执行代码
 * 6. 处理执行结果和错误
 * 
 * Requirements: 10.2, 10.3, 10.4
 * Requirements: 2.2, 2.4, 2.5, 4.1, 4.4
 */
async function runCode() {
  // Requirement 10.4: 禁用运行按钮防止并发执行
  if (isRunning.value) {
    return
  }
  
  isRunning.value = true
  
  try {
    // Step 1: 解析 Vue SFC
    // Requirement 2.2: 解析 Vue SFC 为 template、script、style 部分
    const parsed = parseSFC(code.value)
    
    // Step 2: 检查解析错误
    // Requirement 3.5: 如果 SFC 解析失败，显示解析错误
    if (parsed.errors && parsed.errors.length > 0) {
      const parseError = parsed.errors[0]
      addError({
        type: 'parse',
        message: parseError.message,
        line: parseError.line
      })
      return
    }
    
    // Step 3: 获取 Viewer 实例
    // Requirement 5.5: 访问 Viewer 实例用于代码执行
    if (!cesiumViewer.value || !cesiumViewer.value.getViewer) {
      addError({
        type: 'cesium',
        message: 'Cesium Viewer 未初始化，请等待 Viewer 加载完成'
      })
      return
    }
    
    const viewerInstance = cesiumViewer.value.getViewer()
    
    if (!viewerInstance) {
      addError({
        type: 'cesium',
        message: 'Cesium Viewer 实例不可用'
      })
      return
    }
    
    // Step 4: 创建代码执行器（如果还没有创建）
    // Requirement 2.4: 创建隔离的执行环境
    if (!codeExecutor) {
      codeExecutor = new CodeExecutor(viewerInstance)
    }
    
    // Step 5: 清空场景
    // Requirement 5.2: 执行新代码前清除之前的实体和数据源
    if (cesiumViewer.value.clearScene) {
      cesiumViewer.value.clearScene()
    }
    
    // Step 6: 执行代码
    // Requirement 2.4: 在沙箱中执行用户代码
    const result = await codeExecutor.execute(parsed)
    
    // Step 7: 处理执行结果
    if (result.success) {
      // Requirement 4.4: 代码执行成功时清除之前的错误消息
      clearErrors()
    } else {
      // Requirement 4.1: 捕获并显示运行时错误
      // Requirement 4.2: 包含错误类型、消息、行号和堆栈跟踪
      addError({
        type: result.error.type,
        message: result.error.message,
        line: result.error.line,
        stack: result.error.stack
      })
    }
  } catch (error) {
    // 捕获意外错误
    // Requirement 4.1: 捕获所有类型的错误
    addError({
      type: 'runtime',
      message: error.message,
      stack: error.stack
    })
  } finally {
    // Requirement 10.4: 执行完成后重新启用运行按钮
    isRunning.value = false
  }
}
</script>

<style scoped>
/**
 * NewMainLayout 样式
 * 
 * 实现三栏响应式布局：
 * - 桌面端：侧边栏 + 编辑器 + 查看器（三栏）
 * - 移动端：垂直堆叠，侧边栏可切换
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

/* ========== 全局容器 ========== */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

/* ========== 顶部导航栏 ========== */
.top-navbar {
  background-color: #002140;
  color: white;
  height: 60px;
  min-height: 60px;
  border-bottom: 1px solid #1890ff;
  flex-shrink: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 侧边栏切换按钮 */
.sidebar-toggle-btn {
  display: none; /* 默认隐藏，移动端显示 */
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.sidebar-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-toggle-btn:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  margin: 0;
  white-space: nowrap;
}

.main-nav {
  flex: 1;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 5px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-item:hover,
.nav-item.active {
  background-color: #1890ff;
  color: white;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.nav-tools {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tool-item {
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.tool-item:hover {
  color: #1890ff;
}

/* ========== 主体内容区 ========== */
/* Requirement 8.1: 桌面端三栏布局 */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  min-height: 0; /* 重要：允许 flex 子元素正确收缩 */
}

/* ========== 左侧案例分类 ========== */
/* Requirement 8.1: 侧边栏固定宽度 */
.sidebar {
  width: 220px;
  min-width: 220px;
  height: 100%;
  background-color: #f5f5f5;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  transition: transform 0.3s ease;
  z-index: 90;
}

/* 移动端侧边栏遮罩 */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 80;
}

.category-nav {
  padding: 10px 0;
}

.category-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-item {
  margin-bottom: 5px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  user-select: none;
}

.category-header:hover {
  background-color: #e6f7ff;
}

.category-index {
  flex: 1;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-count {
  font-size: 12px;
  color: #666;
  margin-right: 10px;
  flex-shrink: 0;
}

.toggle-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.toggle-icon.expanded {
  transform: rotate(90deg);
}

.subcategory-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background-color: white;
}

.subcategory-item {
  padding: 8px 25px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subcategory-item:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* ========== 右侧内容区 ========== */
/* Requirement 8.1: 内容区占据剩余空间 */
.content-area {
  flex: 1;
  min-width: 0; /* 重要：允许 flex 子元素正确收缩 */
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
}

/* ========== 内容头部 ========== */
.content-header {
  height: 50px;
  min-height: 50px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fafafa;
  flex-shrink: 0;
  gap: 10px;
}

.content-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.content-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

/* ========== 案例列表 ========== */
.examples-grid {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  align-content: start;
}

.example-card {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.example-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.example-preview {
  width: 100%;
  height: 150px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.example-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

/* Lazy loading image styles (Requirement 9.4) */
.lazy-image {
  opacity: 0;
  background-color: #f0f0f0;
}

.lazy-image.loaded {
  opacity: 1;
}

/* Loading placeholder for lazy images */
.lazy-image:not(.loaded) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.example-info {
  padding: 10px;
  background-color: #fafafa;
}

.example-name {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========== 代码编辑器和效果图 ========== */
/* Requirement 8.1: 桌面端编辑器和查看器并排显示 */
.example-detail {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
  min-height: 0; /* 重要：允许子元素正确收缩 */
}

.code-editor-container {
  flex: 1;
  min-width: 0; /* 重要：允许 flex 子元素正确收缩 */
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

/* 编辑器标签页 */
.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  background-color: #f0f0f0;
  flex-shrink: 0;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  border-right: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-item:hover {
  background-color: #e6f7ff;
}

.tab-item.active {
  background-color: #1890ff;
  color: white;
}

/* 编辑器内容 */
/* Requirement 8.4: 确保编辑器容器尺寸正确 */
.editor-content {
  flex: 1;
  overflow: hidden;
  min-height: 0; /* 重要：允许子元素正确收缩 */
}

/* 完整源码视图 */
.source-code-viewer {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.source-code-viewer pre {
  margin: 0;
  padding: 20px;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 语法高亮 */
.source-code-viewer pre .template {
  color: #4ec9b0;
}

.source-code-viewer pre .script {
  color: #569cd6;
}

.source-code-viewer pre .style {
  color: #ce9178;
}

/* Requirement 8.4: 确保 Viewer 容器尺寸正确 */
.cesium-viewer-container {
  flex: 1;
  min-width: 0; /* 重要：允许 flex 子元素正确收缩 */
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  background-color: black;
  position: relative;
}

/* ========== 响应式布局 ========== */
/* Requirement 8.2: 移动端垂直堆叠布局 */
/* Requirement 8.3: 窗口调整时平滑适配 */
/* Requirement 8.5: 移动端侧边栏切换 */

/* 平板设备 (768px - 1024px) */
@media (max-width: 1024px) {
  .navbar-container {
    padding: 0 15px;
  }
  
  .logo {
    font-size: 18px;
  }
  
  .nav-item {
    font-size: 13px;
    padding: 6px 10px;
  }
  
  .sidebar {
    width: 180px;
    min-width: 180px;
  }
  
  .example-detail {
    gap: 15px;
    padding: 15px;
  }
}

/* 移动端 (≤768px) */
@media (max-width: 768px) {
  /* 显示侧边栏切换按钮 */
  .sidebar-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 隐藏桌面端导航 */
  .main-nav {
    display: none;
  }
  
  .navbar-right {
    display: none;
  }
  
  .navbar-container {
    padding: 0 10px;
  }
  
  .logo {
    font-size: 16px;
  }
  
  /* 侧边栏默认隐藏，通过按钮切换 */
  .sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    width: 250px;
    min-width: 250px;
    transform: translateX(-100%);
    z-index: 90;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
  
  .sidebar.sidebar-visible {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  /* 内容区占满宽度 */
  .content-area {
    width: 100%;
  }
  
  .content-header {
    padding: 0 10px;
    height: 45px;
    min-height: 45px;
  }
  
  .content-title {
    font-size: 14px;
  }
  
  /* 案例列表网格调整 */
  .examples-grid {
    padding: 15px;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .example-preview {
    height: 120px;
  }
  
  /* 编辑器和查看器垂直堆叠 */
  .example-detail {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  
  .code-editor-container,
  .cesium-viewer-container {
    flex: none;
    width: 100%;
    height: 300px;
    min-height: 300px;
  }
  
  .tab-item {
    padding: 8px 15px;
    font-size: 13px;
  }
}

/* 小屏手机 (≤480px) */
@media (max-width: 480px) {
  .top-navbar {
    height: 50px;
    min-height: 50px;
  }
  
  .sidebar {
    top: 50px;
    width: 220px;
    min-width: 220px;
  }
  
  .logo {
    font-size: 14px;
  }
  
  .content-header {
    height: 40px;
    min-height: 40px;
    padding: 0 8px;
  }
  
  .content-title {
    font-size: 13px;
  }
  
  .content-actions {
    gap: 5px;
  }
  
  .examples-grid {
    padding: 10px;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .example-preview {
    height: 100px;
  }
  
  .example-name {
    font-size: 12px;
  }
  
  .example-detail {
    padding: 8px;
  }
  
  .code-editor-container,
  .cesium-viewer-container {
    height: 250px;
    min-height: 250px;
  }
  
  .tab-item {
    padding: 6px 10px;
    font-size: 12px;
  }
}

/* 确保滚动条样式 */
.sidebar::-webkit-scrollbar,
.examples-grid::-webkit-scrollbar,
.source-code-viewer::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.sidebar::-webkit-scrollbar-track,
.examples-grid::-webkit-scrollbar-track,
.source-code-viewer::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sidebar::-webkit-scrollbar-thumb,
.examples-grid::-webkit-scrollbar-thumb,
.source-code-viewer::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.examples-grid::-webkit-scrollbar-thumb:hover,
.source-code-viewer::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
