<template>
  <div v-if="error" class="error-panel">
    <div class="error-header">
      <div class="error-type-badge" :class="`error-type-${error.type}`">
        <el-icon class="error-icon">
          <WarningFilled v-if="error.type === 'syntax'" />
          <CircleCloseFilled v-if="error.type === 'runtime'" />
          <WarnTriangleFilled v-if="error.type === 'cesium'" />
          <InfoFilled v-if="error.type === 'parse'" />
        </el-icon>
        <span class="error-type-text">{{ getErrorTypeLabel(error.type) }}</span>
      </div>
      <el-button 
        size="small" 
        type="info" 
        :icon="Close" 
        circle 
        @click="onClose"
        class="close-button"
      />
    </div>
    
    <div class="error-content">
      <div class="error-message">
        <strong>错误信息：</strong>
        <p>{{ error.message }}</p>
      </div>
      
      <div v-if="error.line" class="error-line">
        <strong>错误行号：</strong>
        <span class="line-number">第 {{ error.line }} 行</span>
      </div>
      
      <div v-if="error.stack" class="error-stack">
        <strong>堆栈跟踪：</strong>
        <pre class="stack-trace">{{ error.stack }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  WarningFilled, 
  CircleCloseFilled, 
  WarnTriangleFilled, 
  InfoFilled,
  Close 
} from '@element-plus/icons-vue'

/**
 * ErrorPanel 组件
 * 
 * 职责：
 * - 显示错误信息的 UI 面板
 * - 根据错误类型显示不同的图标和样式
 * - 显示错误消息、行号和堆栈跟踪
 * - 提供关闭按钮
 * 
 * Requirements: 4.1, 4.2
 */

/**
 * Props 定义
 * @property {Object} error - 错误信息对象
 * @property {string} error.type - 错误类型：'syntax' | 'runtime' | 'cesium' | 'parse'
 * @property {string} error.message - 错误消息
 * @property {number} [error.line] - 错误行号（可选）
 * @property {string} [error.stack] - 错误堆栈跟踪（可选）
 */
defineProps({
  error: {
    type: Object,
    default: null
  }
})

/**
 * Emits 定义
 * @event close - 当用户点击关闭按钮时触发
 */
const emit = defineEmits(['close'])

/**
 * 关闭错误面板
 * 
 * Requirement 4.1: 提供关闭错误面板的功能
 */
function onClose() {
  emit('close')
}

/**
 * 获取错误类型的中文标签
 * 
 * Requirement 4.2: 显示错误类型
 * Requirement 4.5: 区分不同类型的错误
 * 
 * @param {string} type - 错误类型
 * @returns {string} 错误类型的中文标签
 */
function getErrorTypeLabel(type) {
  const labels = {
    syntax: '语法错误',
    runtime: '运行时错误',
    cesium: 'Cesium 错误',
    parse: '解析错误'
  }
  return labels[type] || '未知错误'
}
</script>

<style scoped>
.error-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 500px;
  max-width: 90vw;
  max-height: 400px;
  background-color: #fff;
  border: 1px solid #f5222d;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff1f0;
  border-bottom: 1px solid #ffccc7;
}

.error-type-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.error-icon {
  font-size: 18px;
}

/* 不同错误类型的颜色 */
.error-type-syntax {
  color: #faad14;
}

.error-type-runtime {
  color: #f5222d;
}

.error-type-cesium {
  color: #fa8c16;
}

.error-type-parse {
  color: #1890ff;
}

.close-button {
  flex-shrink: 0;
}

.error-content {
  padding: 16px;
  overflow-y: auto;
  max-height: 320px;
}

.error-message {
  margin-bottom: 12px;
}

.error-message strong {
  display: block;
  margin-bottom: 6px;
  color: #262626;
  font-size: 13px;
}

.error-message p {
  margin: 0;
  color: #595959;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.error-line {
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: #fafafa;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

.error-line strong {
  color: #262626;
  font-size: 13px;
  margin-right: 8px;
}

.line-number {
  color: #1890ff;
  font-weight: 600;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.error-stack {
  margin-top: 12px;
}

.error-stack strong {
  display: block;
  margin-bottom: 8px;
  color: #262626;
  font-size: 13px;
}

.stack-trace {
  margin: 0;
  padding: 12px;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .error-panel {
    bottom: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }
}
</style>
