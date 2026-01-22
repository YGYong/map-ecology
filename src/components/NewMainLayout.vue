<template>
  <div class="main-layout">
    <LeftSidebar 
      :selectedExampleId="selectedExample?.id"
      @select="handleExampleSelect"
    />
    <div class="main-content" :style="{ marginLeft: '240px', marginRight: rightSidebarWidth }">
      <div class="content-header">
        <h1 class="page-title">{{ selectedExample?.title || 'Cesium 示例' }}</h1>
        <div class="header-actions">
          <button class="action-btn primary" @click="toggleRightSidebar">
            {{ showRightSidebar ? '隐藏右侧面板' : '显示右侧面板' }}
          </button>
        </div>
      </div>
      <div class="content-body">
        <div id="cesiumContainer" class="cesium-container"></div>
      </div>
    </div>
    <RightSidebar 
      v-if="showRightSidebar"
      :currentExample="selectedExample"
      :activeTab="activeTab"
      @runCode="handleRunCode"
      @updateProps="handleUpdateProps"
      @toggle="handleRightSidebarToggle"
    />
  </div>
</template>

<script>
import LeftSidebar from './LeftSidebar.vue'
import RightSidebar from './RightSidebar.vue'

export default {
  name: 'NewMainLayout',
  components: {
    LeftSidebar,
    RightSidebar
  },
  data() {
    return {
      selectedExample: null,
      showRightSidebar: true,
      activeTab: 'code',
      rightSidebarCollapsed: false
    }
  },
  computed: {
    rightSidebarWidth() {
      return this.showRightSidebar ? (this.rightSidebarCollapsed ? '60px' : '320px') : '0px'
    }
  },
  methods: {
    handleExampleSelect(example) {
      this.selectedExample = example
      // 这里可以添加加载示例的逻辑
      console.log('Selected example:', example)
    },
    handleRunCode(code) {
      // 这里可以添加运行代码的逻辑
      console.log('Run code:', code)
    },
    handleUpdateProps(props) {
      // 这里可以添加更新属性的逻辑
      console.log('Update props:', props)
    },
    toggleRightSidebar() {
      this.showRightSidebar = !this.showRightSidebar
    },
    handleRightSidebarToggle(collapsed) {
      this.rightSidebarCollapsed = collapsed
    }
  },
  mounted() {
    // 初始化 Cesium 查看器
    if (typeof Cesium !== 'undefined') {
      this.viewer = new Cesium.Viewer('cesiumContainer', {
        terrain: Cesium.Terrain.fromWorldTerrain(),
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          credit: '© OpenStreetMap contributors'
        })
      })

      // 设置初始视角
      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0
        }
      })
    }
  },
  beforeUnmount() {
    // 销毁 Cesium 查看器
    if (this.viewer) {
      this.viewer.destroy()
    }
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  background-color: #fff;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #666;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.action-btn.primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.action-btn.primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.content-body {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.cesium-container {
  width: 100%;
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    margin-left: 200px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 60px;
    margin-right: 0;
  }
}
</style>