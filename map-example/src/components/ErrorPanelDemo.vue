<template>
  <div class="demo-container">
    <h1>ErrorPanel Component Demo</h1>
    
    <div class="demo-controls">
      <h2>Test Different Error Types:</h2>
      <el-button @click="showSyntaxError">Show Syntax Error</el-button>
      <el-button @click="showRuntimeError">Show Runtime Error</el-button>
      <el-button @click="showCesiumError">Show Cesium Error</el-button>
      <el-button @click="showParseError">Show Parse Error</el-button>
      <el-button @click="showCompleteError">Show Complete Error (with stack)</el-button>
      <el-button type="danger" @click="clearError">Clear Error</el-button>
    </div>

    <div class="demo-info">
      <h3>Current Error:</h3>
      <pre v-if="currentError">{{ JSON.stringify(currentError, null, 2) }}</pre>
      <p v-else>No error currently displayed</p>
    </div>

    <!-- ErrorPanel Component -->
    <error-panel :error="currentError" @close="clearError" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ErrorPanel from './ErrorPanel.vue'

const currentError = ref(null)

function showSyntaxError() {
  currentError.value = {
    type: 'syntax',
    message: 'Unexpected token "}" at the end of function',
    line: 15
  }
}

function showRuntimeError() {
  currentError.value = {
    type: 'runtime',
    message: 'Cannot read property "entities" of undefined',
    line: 42
  }
}

function showCesiumError() {
  currentError.value = {
    type: 'cesium',
    message: 'Failed to load terrain data from server',
    line: 28
  }
}

function showParseError() {
  currentError.value = {
    type: 'parse',
    message: 'Invalid Vue SFC structure: missing closing template tag'
  }
}

function showCompleteError() {
  currentError.value = {
    type: 'runtime',
    message: 'TypeError: viewer.entities is undefined',
    line: 42,
    stack: `TypeError: viewer.entities is undefined
    at setupCesium (example.vue:42:15)
    at onMounted (example.vue:50:5)
    at callWithErrorHandling (runtime-core.esm-bundler.js:155:22)
    at callWithAsyncErrorHandling (runtime-core.esm-bundler.js:164:21)`
  }
}

function clearError() {
  currentError.value = null
}
</script>

<style scoped>
.demo-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #1890ff;
  margin-bottom: 30px;
}

.demo-controls {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.demo-controls h2 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #262626;
}

.demo-controls button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.demo-info {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.demo-info h3 {
  font-size: 14px;
  margin-bottom: 10px;
  color: #262626;
}

.demo-info pre {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.demo-info p {
  color: #8c8c8c;
  font-style: italic;
}
</style>
