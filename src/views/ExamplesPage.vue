<template>
  <main-layout>
    <div class="examples-page">
      <div v-if="!selectedExample" class="content-area overflow-auto">
        <examples-list @select="selectExample" />
      </div>
      <div v-else class="content-area flex-container overflow-hidden">
        <div class="code-side p-4 overflow-auto">
          <h2 class="text-2xl font-bold mb-4">{{ selectedExample.title }}</h2>
          <p class="text-gray-600 mb-6">{{ selectedExample.description }}</p>
          <code-editor 
            v-model="code" 
            @run="runCode" 
          />
        </div>
        <div class="viewer-side border-l border-gray-200">
          <cesium-viewer ref="cesiumViewer" />
        </div>
      </div>
    </div>
  </main-layout>
</template>

<script>
import MainLayout from '@/components/MainLayout.vue'
import ExamplesList from '@/components/ExamplesList.vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CesiumViewer from '@/components/CesiumViewer.vue'

export default {
  name: 'ExamplesPage',
  components: {
    MainLayout,
    ExamplesList,
    CodeEditor,
    CesiumViewer
  },
  data() {
    return {
      selectedExample: null,
      code: ''
    }
  },
  methods: {
    selectExample(example) {
      this.selectedExample = example;
      this.code = example.code;
    },
    runCode(code) {
      if (this.$refs.cesiumViewer) {
        this.$refs.cesiumViewer.runCode(code);
      }
    }
  }
}
</script>

<style scoped>
.examples-page {
  height: calc(100vh - 136px);
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  overflow: hidden;
}

.overflow-auto {
  overflow: auto;
}

.flex-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.code-side {
  padding: 16px;
  overflow: auto;
  height: 100%;
}

.viewer-side {
  border-left: 1px solid #e0e0e0;
  height: 100%;
}

h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

p {
  color: #666;
  margin-bottom: 24px;
}

/* 响应式布局 */
@media (min-width: 768px) {
  .flex-container {
    flex-direction: row;
  }
  
  .code-side {
    width: 50%;
  }
  
  .viewer-side {
    width: 50%;
  }
}
</style>