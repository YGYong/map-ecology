<template>
  <div class="left-sidebar">
    <div class="sidebar-header">
      <h3 class="logo">Cesium 示例</h3>
    </div>
    <div class="sidebar-content">
      <div class="category-section" v-for="category in categories" :key="category.id">
        <div class="category-header" @click="toggleCategory(category.id)">
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-title">{{ category.name }}</span>
          <span class="category-count">({{ category.examples.length }})</span>
          <span class="category-icon">{{ category.expanded ? '▼' : '▶' }}</span>
        </div>
        <div class="category-items" v-if="category.expanded">
          <div 
            v-for="example in category.examples" 
            :key="example.id"
            class="example-item"
            :class="{ active: selectedExampleId === example.id }"
            @click="selectExample(example, category)"
          >
            <span class="example-title">{{ example.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeftSidebar',
  props: {
    selectedExampleId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      categories: [
        {
          id: 'quickstart',
          name: '快速开始',
          icon: '⚡',
          expanded: true,
          examples: [
            { id: 1, title: '快速开始(5)' }
          ]
        },
        {
          id: 'scene',
          name: '三维场景',
          icon: '🌍',
          expanded: true,
          examples: [
            { id: 2, title: '三维场景(48)' },
            { id: 3, title: '场景序列化(10)' },
            { id: 4, title: '场景基础控制(5)' },
            { id: 5, title: '球场景管理(7)' },
            { id: 6, title: '相机视角控制(13)' },
            { id: 7, title: '场景切换对比(5)' },
            { id: 8, title: '其他(4)' }
          ]
        },
        {
          id: 'terrain',
          name: '三维地形',
          icon: '⛰️',
          expanded: false,
          examples: [
            { id: 9, title: '三维地形(12)' }
          ]
        },
        {
          id: 'imagery',
          name: '瓦片图层',
          icon: '🗺️',
          expanded: false,
          examples: [
            { id: 10, title: '瓦片图层(34)' }
          ]
        },
        {
          id: 'vector',
          name: '矢量图层',
          icon: '📊',
          expanded: false,
          examples: [
            { id: 11, title: '矢量图层(33)' }
          ]
        },
        {
          id: '3dtiles',
          name: '3DTiles三维模型',
          icon: '🏗️',
          expanded: false,
          examples: [
            { id: 12, title: '3DTiles三维模型(40)' }
          ]
        },
        {
          id: 'graphic',
          name: '矢量对象',
          icon: '🎯',
          expanded: false,
          examples: [
            { id: 13, title: '矢量对象(205)' }
          ]
        },
        {
          id: 'tools',
          name: '工具控件',
          icon: '🛠️',
          expanded: false,
          examples: [
            { id: 14, title: '工具控件(31)' }
          ]
        },
        {
          id: 'effect',
          name: '环境特效',
          icon: '✨',
          expanded: false,
          examples: [
            { id: 15, title: '环境特效(16)' }
          ]
        },
        {
          id: 'analysis',
          name: '管理分析',
          icon: '📈',
          expanded: false,
          examples: [
            { id: 16, title: '管理分析(27)' }
          ]
        }
      ]
    }
  },
  methods: {
    toggleCategory(categoryId) {
      const category = this.categories.find(c => c.id === categoryId)
      if (category) {
        category.expanded = !category.expanded
      }
    },
    selectExample(example, category) {
      this.$emit('select', example, category)
    }
  }
}
</script>

<style scoped>
.left-sidebar {
  width: 240px;
  height: 100vh;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow-y: auto;
}

.sidebar-header {
  padding: 16px;
  background-color: #1890ff;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.sidebar-content {
  flex: 1;
  padding: 8px 0;
}

.category-section {
  margin-bottom: 2px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  user-select: none;
  gap: 8px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.category-header:hover {
  background-color: #f0f8ff;
}

.category-icon {
  font-size: 16px;
  flex-shrink: 0;
  color: #666;
}

.category-title {
  flex: 1;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-count {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  margin-right: 8px;
}

.category-items {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.example-item {
  padding: 8px 16px 8px 40px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  border-bottom: 1px solid #f9f9f9;
}

.example-item:hover {
  background-color: #f9f9f9;
  color: #1890ff;
}

.example-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-left-color: #1890ff;
}

.example-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

/* 滚动条样式 */
.left-sidebar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.left-sidebar::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.left-sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.left-sidebar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .left-sidebar {
    width: 200px;
  }
  
  .category-header {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .example-item {
    padding: 6px 12px 6px 32px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .left-sidebar {
    width: 60px;
  }
  
  .category-title,
  .category-count {
    display: none;
  }
  
  .category-header {
    justify-content: center;
    padding: 12px 8px;
  }
  
  .example-item {
    padding: 8px 4px;
    text-align: center;
    border-left: none;
  }
  
  .example-title {
    font-size: 10px;
  }
}
</style>