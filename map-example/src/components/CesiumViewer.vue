<template>
  <div ref="cesiumRoot" class="cesium-viewer">
    <div id="cesiumContainer" ref="cesiumContainer" class="w-full h-full"></div>
    <div ref="sandboxHost" class="cesium-sandbox-host"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as Cesium from 'cesium'
import { useViewerManager } from '@/composables/useViewerManager'
import { CesiumCodeExecutor } from '@/utils/cesiumCodeExecutor'
import { parseSFC } from '@/utils/sfcParser'

/**
 * CesiumViewer Component
 * 
 * Responsibilities:
 * - Initialize and manage Cesium Viewer instance
 * - Execute user code safely using CesiumCodeExecutor
 * - Clear scene before running new code
 * - Handle errors during code execution
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

// Props
const props = defineProps({
  // Optional: Allow parent to pass error handler
  onError: {
    type: Function,
    default: null
  }
})

// Template refs
const cesiumRoot = ref(null)
const cesiumContainer = ref(null)
const sandboxHost = ref(null)

// Use ViewerManager composable for lifecycle management
const { viewer, initViewer, clearScene, resetCamera, destroyViewer } = useViewerManager()

// CodeExecutor instance (will be created after viewer is initialized)
let codeExecutor = null

// Expose Cesium to global scope for sandbox access
window.Cesium = Cesium

// Initialize viewer on mount
onMounted(() => {
  if (cesiumContainer.value) {
    initViewer(cesiumContainer.value)
    
    // Create CesiumCodeExecutor with the viewer instance and root element
    if (viewer.value) {
      codeExecutor = new CesiumCodeExecutor(viewer.value, cesiumRoot.value)
    }
  }
})

/**
 * Execute user code
 * 
 * Requirements:
 * - 5.2: Clear scene before running new code
 * - 2.4: Execute code in isolated sandbox
 * - 4.1: Capture and report errors
 * 
 * @param {string} code - Vue SFC code to execute
 * @returns {Promise<Object>} Execution result
 */
async function runCode(code) {
  try {
    // Requirement 5.2: Clear previous entities and data sources before running new code
    clearScene()
    
    // Parse the Vue SFC code
    const parsedSFC = parseSFC(code)
    
    // Check for parsing errors
    if (parsedSFC.errors && parsedSFC.errors.length > 0) {
      const parseError = {
        success: false,
        error: {
          type: 'parse',
          message: parsedSFC.errors[0].message,
          line: parsedSFC.errors[0].line
        }
      }
      
      // Report error to parent if handler provided
      if (props.onError) {
        props.onError(parseError.error)
      }
      
      return parseError
    }
    
    // Execute the parsed code using CesiumCodeExecutor
    if (!codeExecutor) {
      // Recreate executor if needed
      if (viewer.value) {
        codeExecutor = new CesiumCodeExecutor(viewer.value, cesiumRoot.value)
      } else {
        const error = {
          success: false,
          error: {
            type: 'cesium',
            message: 'Cesium Viewer not initialized'
          }
        }
        
        if (props.onError) {
          props.onError(error.error)
        }
        
        return error
      }
    }
    
    // Requirement 2.4: Execute code in sandbox
    const result = await codeExecutor.execute(parsedSFC)
    
    // Report error to parent if execution failed
    if (!result.success && result.error && props.onError) {
      props.onError(result.error)
    }
    
    return result
  } catch (error) {
    // Catch any unexpected errors
    const errorResult = {
      success: false,
      error: {
        type: 'runtime',
        message: error.message,
        stack: error.stack
      }
    }
    
    if (props.onError) {
      props.onError(errorResult.error)
    }
    
    return errorResult
  }
}

/**
 * Clear the scene and reset camera
 * Useful for resetting the viewer to initial state
 */
function reset() {
  clearScene()
  resetCamera()
}

/**
 * Get the viewer instance
 * Useful for parent components that need direct access
 */
function getViewer() {
  return viewer.value
}

function getHostElement() {
  return sandboxHost.value
}

// Expose methods to parent component
defineExpose({
  runCode,
  reset,
  clearScene,
  resetCamera,
  getViewer,
  getHostElement
})
</script>

<style scoped>
.cesium-viewer {
  width: 100%;
  height: 100%;
  position: relative;
}

#cesiumContainer {
  width: 100%;
  height: 100%;
}

.cesium-sandbox-host {
  position: absolute;
  inset: 0;
}
</style>
