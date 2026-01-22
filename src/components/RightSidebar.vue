<template>
  <div class="right-sidebar">
    <div class="sidebar-header">
      <div class="header-tabs">
        <el-tabs v-model="activeTab" @tab-click="switchTab">
          <el-tab-pane 
            v-for="tab in tabs" 
            :key="tab.id"
            :label="tab.name"
            :name="tab.id"
          >
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="toggleSidebar">
          {{ isCollapsed ? '展开' : '收起' }}
        </el-button>
      </div>
    </div>
    <div class="sidebar-content" v-show="!isCollapsed">
      <div v-if="activeTab === 'examples'">
        <div class="examples-section">
          <el-card shadow="hover" :body-style="{ padding: '16px' }">
            <template #header>
              <div class="card-header">
                <span>{{ currentCategory?.name || '示例' }}</span>
              </div>
            </template>
            <div class="examples-grid">
              <el-card 
                v-for="example in currentExamples" 
                :key="example.id"
                class="example-card"
                :class="{ active: selectedExampleId === example.id }"
                @click="selectExample(example)"
                shadow="hover"
                :body-style="{ padding: 0, cursor: 'pointer' }"
              >
                <div class="example-preview">
                  <img 
                    :src="getExamplePreview(example)" 
                    :alt="example.title"
                    loading="lazy"
                  >
                  <div class="example-overlay">
                    <el-button type="primary" circle icon="el-icon-video-camera" size="large" />
                  </div>
                </div>
                <div class="example-info">
                  <el-descriptions size="small" :column="1" :border="false">
                    <el-descriptions-item>{{ example.title }}</el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-card>
            </div>
          </el-card>
        </div>
      </div>
      <div v-else-if="activeTab === 'code'">
        <el-card shadow="hover" :body-style="{ padding: '0' }">
          <template #header>
            <div class="card-header">
              <span class="language-label">JavaScript</span>
              <div class="editor-actions">
                <el-button size="small" @click="runCode">运行</el-button>
                <el-button size="small" @click="resetCode">重置</el-button>
              </div>
            </div>
          </template>
          <div class="editor-content">
            <el-input
              v-model="codeContent"
              type="textarea"
              :rows="10"
              placeholder="在此输入代码..."
              :style="{ fontFamily: 'Courier New, Courier, monospace', fontSize: '13px' }"
            />
          </div>
        </el-card>
      </div>
      <div v-else-if="activeTab === 'props'">
        <el-card shadow="hover" :body-style="{ padding: '16px' }">
          <template #header>
            <div class="card-header">
              <span>属性设置</span>
            </div>
          </template>
          <el-form :model="props" label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="props.title" placeholder="输入标题" size="small" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="props.description"
                type="textarea"
                :rows="3"
                placeholder="输入描述"
                size="small"
              />
            </el-form-item>
            <el-form-item label="可见性">
              <el-checkbox v-model="props.visible">显示</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProps">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <div v-else-if="activeTab === 'info'">
        <el-card shadow="hover" :body-style="{ padding: '16px' }">
          <template #header>
            <div class="card-header">
              <span>示例信息</span>
            </div>
          </template>
          <el-descriptions :column="1" :border="true" size="small">
            <el-descriptions-item label="ID">{{ currentExample?.id || '无' }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ currentExample?.title || '无' }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ currentCategory?.name || '无' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ new Date().toLocaleString() }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RightSidebar',
  props: {
    currentExample: {
      type: Object,
      default: null
    },
    currentCategory: {
      type: Object,
      default: null
    },
    selectedExampleId: {
      type: [String, Number],
      default: null
    },
    code: {
      type: String,
      default: ''
    },
    activeTab: {
      type: String,
      default: 'examples'
    }
  },
  data() {
    return {
      isCollapsed: false,
      tabs: [
        { id: 'examples', name: '示例' },
        { id: 'code', name: '代码' },
        { id: 'props', name: '属性' },
        { id: 'info', name: '信息' }
      ],
      codeContent: `// 初始化 Cesium 查看器
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  imageryProvider: new Cesium.UrlTemplateImageryProvider({
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    credit: '© OpenStreetMap contributors'
  })
});

// 设置初始视角
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0
  }
});`,
      props: {
        title: '',
        description: '',
        visible: true
      },
      // 模拟示例数据
      examplePreviews: {
        1: 'https://via.placeholder.com/300x200?text=快速开始',
        2: 'https://via.placeholder.com/300x200?text=三维场景',
        3: 'https://via.placeholder.com/300x200?text=场景序列化',
        4: 'https://via.placeholder.com/300x200?text=场景基础控制',
        5: 'https://via.placeholder.com/300x200?text=球场景管理',
        6: 'https://via.placeholder.com/300x200?text=相机视角控制',
        7: 'https://via.placeholder.com/300x200?text=场景切换对比',
        8: 'https://via.placeholder.com/300x200?text=其他',
        9: 'https://via.placeholder.com/300x200?text=三维地形',
        10: 'https://via.placeholder.com/300x200?text=瓦片图层',
        11: 'https://via.placeholder.com/300x200?text=矢量图层',
        12: 'https://via.placeholder.com/300x200?text=3DTiles三维模型',
        13: 'https://via.placeholder.com/300x200?text=矢量对象',
        14: 'https://via.placeholder.com/300x200?text=工具控件',
        15: 'https://via.placeholder.com/300x200?text=环境特效',
        16: 'https://via.placeholder.com/300x200?text=管理分析'
      }
    }
  },
  computed: {
    currentExamples() {
      return this.currentCategory?.examples || [];
    }
  },
  watch: {
    currentExample: {
      handler(newExample) {
        if (newExample) {
          this.props.title = newExample.title || '';
          this.props.description = newExample.description || '';
        }
      },
      immediate: true
    },
    code: {
      handler(newCode) {
        if (newCode) {
          this.codeContent = newCode;
        }
      },
      immediate: true
    },
    activeTab: {
      handler(newTab) {
        this.$emit('switchTab', newTab);
      }
    }
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      this.$emit('toggle', this.isCollapsed);
    },
    switchTab(tab) {
      this.$emit('switchTab', tab.props.name);
    },
    selectExample(example) {
      this.$emit('selectExample', example);
    },
    runCode() {
      this.$emit('runCode', this.codeContent);
    },
    resetCode() {
      this.codeContent = `// 初始化 Cesium 查看器
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  imageryProvider: new Cesium.UrlTemplateImageryProvider({
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    credit: '© OpenStreetMap contributors'
  })
});

// 设置初始视角
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0
  }
});`;
    },
    saveProps() {
      this.$emit('updateProps', this.props);
    },
    getExamplePreview(example) {
      return this.examplePreviews[example.id] || 'https://via.placeholder.com/300x200?text=示例';
    }
  }
}
</script>

<style scoped>
.right-sidebar {
  width: 320px;
  height: 100vh;
  background-color: #f5f5f5;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-tabs {
  flex: 1;
  margin-right: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.sidebar-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.example-card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.example-card:hover {
  transform: translateY(-2px);
}

.example-card.active {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.example-preview {
  width: 100%;
  height: 100px;
  overflow: hidden;
  position: relative;
  background-color: #f0f0f0;
}

.example-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.example-card:hover .example-preview img {
  transform: scale(1.05);
}

.example-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.example-card:hover .example-overlay {
  opacity: 1;
}

.example-info {
  padding: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.language-label {
  font-size: 12px;
  color: #999;
  font-family: monospace;
}

.editor-actions {
  display: flex;
  gap: 4px;
}

.editor-content {
  flex: 1;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .right-sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .right-sidebar {
    width: 100%;
    transform: translateX(100%);
  }
  
  .right-sidebar.open {
    transform: translateX(0);
  }
}
</style>