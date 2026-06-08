import { ref, computed } from 'vue'

/**
 * ErrorInfo 接口定义
 * @typedef {Object} ErrorInfo
 * @property {'syntax' | 'runtime' | 'cesium' | 'parse'} type - 错误类型
 * @property {string} message - 错误消息
 * @property {number} [line] - 错误行号（可选）
 * @property {string} [stack] - 错误堆栈跟踪（可选）
 * @property {number} timestamp - 错误时间戳
 */

/**
 * 错误处理 Composable
 * 
 * 职责：
 * - 统一处理和存储各类错误（语法错误、运行时错误、Cesium 错误、解析错误）
 * - 提供错误添加、清除和格式化功能
 * - 支持错误历史记录和最新错误查询
 * 
 * Requirements: 4.1, 4.2, 4.4, 4.5
 * 
 * @returns {Object} ErrorHandler 对象
 */
export function useErrorHandler() {
  // 错误列表，存储所有错误信息
  const errors = ref([])

  /**
   * 添加错误到错误列表
   * 
   * Requirement 4.1: 捕获运行时错误并显示
   * Requirement 4.2: 包含错误类型、消息、行号和堆栈跟踪
   * Requirement 4.5: 区分不同类型的错误
   * 
   * @param {ErrorInfo} error - 错误信息对象（不包含 timestamp）
   */
  function addError(error) {
    errors.value.push({
      ...error,
      timestamp: Date.now()
    })
  }

  /**
   * 清除所有错误
   * 
   * Requirement 4.4: 代码执行成功时清除之前的错误消息
   */
  function clearErrors() {
    errors.value = []
  }

  /**
   * 获取最新的错误
   * 
   * @returns {ErrorInfo | null} 最新的错误信息，如果没有错误则返回 null
   */
  const latestError = computed(() => {
    return errors.value.length > 0 
      ? errors.value[errors.value.length - 1] 
      : null
  })

  /**
   * 格式化错误消息为可读字符串
   * 
   * Requirement 4.2: 显示错误类型、消息和行号
   * 
   * @param {ErrorInfo} error - 错误信息对象
   * @returns {string} 格式化后的错误消息
   */
  function formatErrorMessage(error) {
    let message = `[${error.type.toUpperCase()}] ${error.message}`
    if (error.line) {
      message += ` (Line ${error.line})`
    }
    return message
  }

  return {
    errors,
    addError,
    clearErrors,
    latestError,
    formatErrorMessage
  }
}
