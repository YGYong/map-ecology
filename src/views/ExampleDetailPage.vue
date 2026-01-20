<template>
  <div class="example-detail-page">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <el-button 
            class="back-button" 
            @click="goBack"
            :icon="ArrowLeft"
            circle
          />
          <h1 class="page-title">{{ currentExample?.name || '示例详情' }}</h1>
        </div>
        <div class="navbar-right">
          <el-button size="default" @click="resetCode">重置</el-button>
          <el-button 
            size="default" 
            type="primary" 
            @click="runCode"
            :disabled="isRunning"
            :loading="isRunning"
          >
            运行
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主体内容区：左侧代码编辑器，右侧 Cesium 查看器 -->
    <div class="main-container">
      <!-- 左侧代码编辑器 -->
      <div class="code-editor-panel">
        <div class="editor-tabs">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'script' }"
            @click="activeTab = 'script'"
          >
            <el-icon><Document /></el-icon>
            <span>JS 代码</span>
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'source' }"
            @click="activeTab = 'source'"
          >
            <el-icon><Tickets /></el-icon>
            <span>完整源码</span>
          </div>
        </div>
        <div class="editor-content">
          <code-editor v-model="code" @run="runCode" />
        </div>
      </div>

      <!-- 右侧 Cesium 查看器 -->
      <div class="cesium-viewer-panel">
        <cesium-viewer ref="cesiumViewer" />
      </div>
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
import { ArrowLeft, Document, Tickets } from '@element-plus/icons-vue'
import CodeEditor from '../components/CodeEditor.vue'
import CesiumViewer from '../components/CesiumViewer.vue'
import ErrorPanel from '../components/ErrorPanel.vue'
import { examples } from '../utils/examplesData'
import { parseSFC } from '../utils/sfcParser'
import { CodeExecutor } from '../utils/codeExecutor'
import { useErrorHandler } from '../composables/useErrorHandler'

const router = useRouter()
const route = useRoute()

// 错误处理
const { errors, addError, clearErrors, latestError } = useErrorHandler()

// 状态管理
const currentExample = ref(null)
const code = ref('')
const originalCode = ref('')
const activeTab = ref('script')
const isRunning = ref(false)

// Cesium Viewer 引用
const cesiumViewer = ref(null)

// 代码执行器实例
let codeExecutor = null

// 生命周期
onMounted(() => {
  loadExample()
})

// 监听路由变化
watch(() => route.params.id, () => {
  loadExample()
})

// 方法
function loadExample() {
  const exampleId = parseInt(route.params.id)
  const example = examples.find(ex => ex.id === exampleId)
  
  if (example) {
    currentExample.value = example
    code.value = example.code
    originalCode.value = example.code
    
    // 等待 DOM 更新后自动运行代码
    nextTick(async () => {
      await waitForViewer()
      runCode()
    })
  } else {
    // 示例不存在，返回首页
    router.push('/')
  }
}

function goBack() {
  router.push('/')
}

async function resetCode() {
  if (currentExample.value) {
    code.value = originalCode.value
    clearErrors()
    
    await nextTick()
    await waitForViewer()
    
    runCode()
  }
}

async function runCode() {
  if (isRunning.value) {
    return
  }
  
  isRunning.value = true
  
  try {
    // 解析 Vue SFC
    const parsed = parseSFC(code.value)
    
    // 检查解析错误
    if (parsed.errors && parsed.errors.length > 0) {
      const parseError = parsed.errors[0]
      addError({
        type: 'parse',
        message: parseError.message,
        line: parseError.line
      })
      return
    }
    
    // 获取 Viewer 实例
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
    
    // 创建代码执行器
    if (!codeExecutor) {
      codeExecutor = new CodeExecutor(viewerInstance)
    }
    
    // 清空场景
    if (cesiumViewer.value.clearScene) {
      cesiumViewer.value.clearScene()
    }
    
    // 执行代码
    const result = await codeExecutor.execute(parsed)
    
    // 处理执行结果
    if (result.success) {
      clearErrors()
    } else {
      addError({
        type: result.error.type,
        message: result.error.message,
        line: result.error.line,
        stack: result.error.stack
      })
    }
  } catch (error) {
    addError({
      type: 'runtime',
      message: error.message,
      stack: error.stack
    })
  } finally {
    isRunning.value = false
  }
}

async function waitForViewer(maxWaitTime = 5000, checkInterval = 100) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    if (cesiumViewer.value && cesiumViewer.value.getViewer) {
      const viewerInstance = cesiumViewer.value.getViewer()
      
      if (viewerInstance) {
        return true
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, checkInterval))
  }
  
  return false
}
</script>

<style scoped>
/* 全局容器 */
.example-detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #1e1e1e;
}

/* 顶部导航栏 */
.top-navbar {
  background-color: #252526;
  color: white;
  height: 50px;
  min-height: 50px;
  border-bottom: 1px solid #3e3e42;
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
  padding: 0 16px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  background-color: transparent;
  border-color: #3e3e42;
  color: #cccccc;
}

.back-button:hover {
  background-color: #2d2d30;
  border-color: #1890ff;
  color: #1890ff;
}

.page-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: #cccccc;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 主体内容区 */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* 左侧代码编辑器面板 */
.code-editor-panel {
  width: 50%;
  min-width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  border-right: 1px solid #3e3e42;
}

.editor-tabs {
  display: flex;
  background-color: #252526;
  border-bottom: 1px solid #3e3e42;
  flex-shrink: 0;
  height: 36px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  cursor: pointer;
  font-size: 13px;
  color: #969696;
  border-right: 1px solid #3e3e42;
  transition: all 0.2s ease;
  user-select: none;
}

.tab-item:hover {
  background-color: #2d2d30;
  color: #cccccc;
}

.tab-item.active {
  background-color: #1e1e1e;
  color: #ffffff;
  border-bottom: 2px solid #1890ff;
}

.editor-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* 右侧 Cesium 查看器面板 */
.cesium-viewer-panel {
  flex: 1;
  min-width: 0;
  height: 100%;
  background-color: #000;
  position: relative;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .code-editor-panel {
    width: 45%;
    min-width: 350px;
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .code-editor-panel {
    width: 100%;
    min-width: 0;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid #3e3e42;
  }
  
  .cesium-viewer-panel {
    width: 100%;
    height: 50%;
  }
}
</style>
