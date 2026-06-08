<template>
  <div class="example-detail-page">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <button class="back-button" @click="goBack">← 返回上一级</button>
          <h1 class="page-title">{{ currentExample?.name || '示例详情' }}</h1>
        </div>
      </div>
    </header>

    <!-- 主体内容区：左侧代码编辑器，右侧 Cesium 查看器 -->
    <div class="main-container">
      <!-- 左侧代码编辑器 -->
      <div 
        class="code-editor-panel"
        :style="{ width: `${codePanelWidth}%` }"
      >
        <div class="editor-header">
          <div class="editor-tabs">
            <div class="tab-item active">
              <span>📄</span>
              <span>代码编辑</span>
            </div>
          </div>
          <div class="editor-actions">
            <button class="action-btn" @click="resetCode" title="重置代码">
              <span>↺</span> 重置
            </button>
            <button class="action-btn primary" @click="runCode" :disabled="isRunning" title="运行代码 (Ctrl+S)">
              <span>▶</span> {{ isRunning ? '运行中...' : '运行' }}
            </button>
          </div>
        </div>
        <div class="editor-content-wrapper">
          <div v-if="isLoadingCode" class="loading-overlay">
            <div class="loader"></div>
            <span>正在加载示例代码...</span>
          </div>
          <code-editor v-else v-model="code" @run="runCode" :show-header="false" />
        </div>
      </div>

      <!-- 调整大小的分隔条 -->
      <div 
        class="resize-handle" 
        @mousedown="startResize"
      ></div>

      <!-- 右侧运行区 -->
      <div class="viewer-panel">
        <cesium-viewer v-if="engine === 'cesium'" ref="cesiumViewer" />
        <sandbox-host v-else ref="sandboxHost" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CodeEditor from '../components/CodeEditor.vue'
import CesiumViewer from '../components/CesiumViewer.vue'
import SandboxHost from '../components/SandboxHost.vue'
import ErrorPanel from '../components/ErrorPanel.vue'
import { getExampleById, loadExampleCode } from '../utils/examplesData'
import { getFrameworkExampleById } from '@/utils/frameworkExamples'
import { parseSFC } from '../utils/sfcParser'
import { CesiumCodeExecutor } from '@/utils/cesiumCodeExecutor'
import { LeafletCodeExecutor } from '@/utils/leafletCodeExecutor'
import { OpenLayersCodeExecutor } from '@/utils/openLayersCodeExecutor'
import { useErrorHandler } from '../composables/useErrorHandler'

const router = useRouter()
const route = useRoute()

const engine = computed(() => {
  const value = route.params.engine
  return value === 'leaflet' || value === 'openlayers' || value === 'cesium' ? value : 'cesium'
})

// 错误处理
const { addError, clearErrors, latestError } = useErrorHandler()

// 状态管理
const currentExample = ref(null)
const code = ref('')
const originalCode = ref('')
const isRunning = ref(false)
const isLoadingCode = ref(false)
const codePanelWidth = ref(45)
const isResizing = ref(false)

// Cesium Viewer 引用
const cesiumViewer = ref(null)
const sandboxHost = ref(null)

// 代码执行器实例
let codeExecutor = null

// 生命周期
onMounted(() => {
  loadExample()
  
  // 监听全局鼠标事件
  document.addEventListener('mousemove', handleGlobalMouseMove)
  document.addEventListener('mouseup', stopResize)
})

// 监听路由变化
watch(() => route.params.id, () => {
  loadExample()
})

// 方法
async function loadExample() {
  const exampleId = route.params.id
  const example = engine.value === 'cesium' ? getExampleById(parseInt(exampleId)) : getFrameworkExampleById(engine.value, exampleId)
  
  if (example) {
    currentExample.value = example
    isLoadingCode.value = true
    
    try {
      const exampleCode = await loadExampleCode(example.fileName)
      code.value = exampleCode
      originalCode.value = exampleCode
      isLoadingCode.value = false
      
      nextTick(async () => {
        await waitForViewer()
        runCode()
      })
    } catch (error) {
      console.error('加载示例失败:', error)
      isLoadingCode.value = false
      addError({
        type: 'load',
        message: `加载示例失败: ${error.message}`
      })
    }
  } else {
    router.push('/')
  }
}

function goBack() {
  router.back()
}

function startResize() {
  isResizing.value = true
}

function handleGlobalMouseMove(event) {
  if (!isResizing.value) return
  
  const mainContainer = document.querySelector('.main-container')
  if (mainContainer) {
    const rect = mainContainer.getBoundingClientRect()
    const newWidth = ((event.clientX - rect.left) / rect.width) * 100
    
    if (newWidth >= 20 && newWidth <= 80) {
      codePanelWidth.value = newWidth
    }
  }
}

function stopResize() {
  isResizing.value = false
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
  if (isRunning.value) return
  
  isRunning.value = true
  
  try {
    const parsed = parseSFC(code.value, { fileName: currentExample.value?.fileName || '' })
    
    if (parsed.errors && parsed.errors.length > 0) {
      const parseError = parsed.errors[0]
      addError({
        type: 'parse',
        message: parseError.message,
        line: parseError.line
      })
      return
    }
    
    let result = null
    if (engine.value === 'cesium') {
      if (!cesiumViewer.value || !cesiumViewer.value.getViewer) {
        addError({
          type: 'cesium',
          message: 'Cesium Viewer 未初始化'
        })
        return
      }
      
      const viewerInstance = cesiumViewer.value.getViewer()
      const hostElement = cesiumViewer.value.getHostElement ? cesiumViewer.value.getHostElement() : null
      
      if (!viewerInstance) {
        addError({
          type: 'cesium',
          message: 'Cesium Viewer 实例不可用'
        })
        return
      }

      if (!hostElement) {
        addError({
          type: 'cesium',
          message: 'Cesium 宿主容器不可用'
        })
        return
      }
      
      if (!codeExecutor || codeExecutor.__engine !== 'cesium') {
        codeExecutor = new CesiumCodeExecutor(viewerInstance, hostElement)
        codeExecutor.__engine = 'cesium'
      }
      
      if (cesiumViewer.value.clearScene) {
        cesiumViewer.value.clearScene()
      }
      
      result = await codeExecutor.execute(parsed)
    } else {
      if (!sandboxHost.value || !sandboxHost.value.getHostElement) {
        addError({
          type: engine.value,
          message: '运行容器未初始化'
        })
        return
      }
      
      const hostEl = sandboxHost.value.getHostElement()
      if (!hostEl) {
        addError({
          type: engine.value,
          message: '运行容器实例不可用'
        })
        return
      }
      
      if (!codeExecutor || codeExecutor.__engine !== engine.value) {
        if (engine.value === 'leaflet') {
          codeExecutor = new LeafletCodeExecutor(hostEl)
        } else {
          codeExecutor = new OpenLayersCodeExecutor(hostEl)
        }
        codeExecutor.__engine = engine.value
      }
      
      if (sandboxHost.value.clear) {
        sandboxHost.value.clear()
      }
      
      result = await codeExecutor.execute(parsed)
    }
    
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
    if (engine.value === 'cesium') {
      if (cesiumViewer.value && cesiumViewer.value.getViewer) {
        const viewerInstance = cesiumViewer.value.getViewer()
        if (viewerInstance) return true
      }
    } else {
      if (sandboxHost.value && sandboxHost.value.getHostElement) {
        const hostEl = sandboxHost.value.getHostElement()
        if (hostEl) return true
      }
    }
    await new Promise(resolve => setTimeout(resolve, checkInterval))
  }
  
  return false
}
</script>

<style scoped>
.example-detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #1e1e1e;
}

.top-navbar {
  background-color: #2d2d2d;
  color: #cccccc;
  height: 40px;
  min-height: 40px;
  border-bottom: 1px solid #1e1e1e;
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
  gap: 16px;
}

.back-button {
  background-color: transparent;
  border: none;
  color: #cccccc;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.page-title {
  font-size: 13px;
  font-weight: normal;
  margin: 0;
  color: #cccccc;
}

/* Removed .navbar-right styles as it is empty now */

.action-btn {
  background-color: transparent;
  border: none;
  color: #cccccc;
  padding: 4px 10px;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #3e3e42;
  color: white;
}

.action-btn.primary {
  background-color: #0e639c;
  color: white;
}

.action-btn.primary:hover {
  background-color: #1177bb;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #3a3d41;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.code-editor-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  border-right: 1px solid #3e3e42;
  position: relative;
}

.editor-header {
  background-color: #252526;
  border-bottom: 1px solid #3e3e42;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
}

.editor-tabs {
  display: flex;
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
  border-bottom: 2px solid #3b82f6;
}

.editor-content-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #969696;
  gap: 16px;
  z-index: 10;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.resize-handle {
  width: 4px;
  height: 100%;
  background-color: #3e3e42;
  cursor: col-resize;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
  user-select: none;
}

.resize-handle:hover {
  background-color: #3b82f6;
}

.viewer-panel {
  flex: 1;
  min-width: 0;
  height: 100%;
  background-color: #000;
  position: relative;
}
</style>
