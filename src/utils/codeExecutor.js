/**
 * CodeExecutor - Safely executes user code in an isolated sandbox environment
 * 
 * This class creates an iframe sandbox to execute user-provided Vue SFC code
 * with controlled access to the Cesium API and viewer instance.
 * 
 * Performance optimizations (Requirement 9.2):
 * - Reuses iframe when possible to avoid recreation overhead
 * - Caches context preparation
 * - Minimizes DOM operations
 * 
 * Requirements: 2.4, 2.5, 9.2
 */
export class CodeExecutor {
  /**
   * Create a new CodeExecutor instance
   * 
   * @param {Cesium.Viewer} viewerInstance - The Cesium Viewer instance to expose to user code
   */
  constructor(viewerInstance) {
    this.viewer = viewerInstance
    this.iframe = null
    this.iframeReady = false // Track if iframe is initialized
    this.executionCount = 0 // Track number of executions for performance monitoring
  }

  /**
   * Execute parsed SFC code in a sandbox iframe
   * 
   * Requirement 9.2: Optimize code execution performance
   * - Reuses iframe to avoid recreation overhead
   * - Minimizes context preparation
   * - Tracks execution time for performance monitoring
   * 
   * @param {Object} parsedSFC - Parsed SFC object from sfcParser
   * @param {string|null} parsedSFC.scriptSetup - Script setup content
   * @param {string|null} parsedSFC.script - Script content
   * @returns {Promise<ExecutionResult>} Result of code execution
   * 
   * @typedef {Object} ExecutionResult
   * @property {boolean} success - Whether execution succeeded
   * @property {Object} [error] - Error details if execution failed
   * @property {string} error.type - Error type: 'syntax' | 'runtime' | 'cesium'
   * @property {string} error.message - Error message
   * @property {number} [error.line] - Line number where error occurred
   * @property {string} [error.stack] - Stack trace
   * @property {number} [executionTime] - Execution time in milliseconds (dev mode only)
   */
  async execute(parsedSFC) {
    // Performance monitoring (dev mode only)
    const startTime = import.meta.env.DEV ? performance.now() : 0
    
    try {
      // Ensure iframe is ready (reuse if possible for performance)
      if (!this.iframe || !this.iframeReady) {
        this._initializeIframe()
      }
      
      // Get the code to execute (prefer scriptSetup over script)
      const codeToExecute = parsedSFC.scriptSetup || parsedSFC.script
      
      if (!codeToExecute) {
        return {
          success: true // No code to execute is not an error
        }
      }

      // Prepare context (optimized to reuse iframe globals)
      this._prepareContext()
      
      // Build the execution wrapper
      const executeCode = this._buildExecutionWrapper(codeToExecute)

      // Execute code in iframe
      const result = this.iframe.contentWindow.eval(executeCode)
      
      // Track execution count
      this.executionCount++
      
      // Add performance metrics in dev mode
      if (import.meta.env.DEV) {
        const executionTime = performance.now() - startTime
        result.executionTime = executionTime
        
        // Log warning if execution is slow (> 100ms for simple examples)
        if (executionTime > 100) {
          console.warn(`[CodeExecutor] Slow execution detected: ${executionTime.toFixed(2)}ms`)
        }
      }
      
      return result
    } catch (error) {
      // Catch syntax errors and other execution errors
      const errorResult = {
        success: false,
        error: {
          type: 'syntax',
          message: error.message,
          line: this._extractLineNumber(error),
          stack: error.stack
        }
      }
      
      // Add performance metrics in dev mode
      if (import.meta.env.DEV) {
        errorResult.executionTime = performance.now() - startTime
      }
      
      return errorResult
    }
  }

  /**
   * Initialize the sandbox iframe
   * Requirement 9.2: Reuse iframe to avoid recreation overhead
   * 
   * @private
   */
  _initializeIframe() {
    // Clean up existing iframe if any
    if (this.iframe) {
      this.cleanup()
    }

    // Create sandbox iframe
    this.iframe = document.createElement('iframe')
    this.iframe.sandbox = 'allow-scripts allow-same-origin'
    this.iframe.style.display = 'none'
    document.body.appendChild(this.iframe)
    
    this.iframeReady = true
  }

  /**
   * Prepare the execution context with Cesium API and Vue helpers
   * 
   * Requirement 9.2: Optimized to reuse iframe globals instead of recreating
   * 
   * @private
   */
  _prepareContext() {
    // Inject globals into iframe window (reuse existing iframe)
    const iframeWindow = this.iframe.contentWindow
    
    // Only inject if not already present (performance optimization)
    if (!iframeWindow.Cesium) {
      iframeWindow.Cesium = window.Cesium
    }
    
    // Always update viewer reference (it might change)
    iframeWindow.viewer = this.viewer
    
    // Inject Vue Composition API helpers (only if not present)
    if (!iframeWindow.ref) {
      iframeWindow.ref = (value) => ({ value })
      iframeWindow.reactive = (obj) => obj
      iframeWindow.computed = (getter) => ({ value: getter() })
      iframeWindow.watch = () => {}
      iframeWindow.watchEffect = () => {}
      
      // Inject lifecycle hooks (simplified for sandbox)
      iframeWindow.onMounted = (callback) => {
        // Execute immediately in sandbox context
        if (typeof callback === 'function') {
          callback()
        }
      }
      iframeWindow.onUnmounted = () => {}
      iframeWindow.onBeforeUnmount = () => {}
      
      // Create a cesiumContainer ref for user code
      iframeWindow.cesiumContainer = { value: null }
    }
  }

  /**
   * Build the execution wrapper code
   * 
   * @private
   * @param {string} userCode - User's script code
   * @returns {string} Wrapped code ready for execution
   */
  _buildExecutionWrapper(userCode) {
    // Wrap user code in a try-catch to capture runtime errors
    return `
      (function() {
        try {
          // User code executes here with access to injected globals
          ${userCode}
          
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: {
              type: 'runtime',
              message: error.message,
              stack: error.stack,
              line: error.lineNumber || error.line
            }
          };
        }
      })()
    `
  }

  /**
   * Extract line number from error object or stack trace
   * 
   * @private
   * @param {Error} error - Error object
   * @returns {number|undefined} Line number if found
   */
  _extractLineNumber(error) {
    // Try to get line number from error object
    if (error.lineNumber) {
      return error.lineNumber
    }
    if (error.line) {
      return error.line
    }
    
    // Try to extract from stack trace
    if (error.stack) {
      const match = error.stack.match(/:(\d+):(\d+)/)
      if (match) {
        return parseInt(match[1])
      }
    }
    
    return undefined
  }

  /**
   * Clean up the sandbox iframe
   * Removes the iframe from the DOM and releases references
   * 
   * Note: This is now only called when the executor is destroyed,
   * not between executions (Requirement 9.2: reuse iframe for performance)
   */
  cleanup() {
    if (this.iframe && this.iframe.parentNode) {
      document.body.removeChild(this.iframe)
      this.iframe = null
      this.iframeReady = false
    }
  }
  
  /**
   * Get execution statistics (dev mode only)
   * 
   * @returns {Object} Execution statistics
   */
  getStats() {
    return {
      executionCount: this.executionCount,
      iframeReady: this.iframeReady
    }
  }
}
