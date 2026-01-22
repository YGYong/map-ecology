<template>
  <div class="left-sidebar">
    <div class="sidebar-header">
      <h3 class="logo">Cesium 示例</h3>
    </div>
    <div class="sidebar-content">
      <el-menu
        :default-openeds="['1']"
        class="sidebar-menu"
        :collapse-transition="false"
      >
        <el-sub-menu
          v-for="category in categories"
          :key="category.id"
          :index="category.id.toString()"
        >
          <template #title>
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-title">{{ category.name }}</span>
            <span class="category-count">({{ category.count }})</span>
          </template>
          <el-sub-menu
            v-for="subcategory in category.subcategories"
            :key="subcategory.id"
            :index="subcategory.id.toString()"
          >
            <template #title>
              <span class="subcategory-title">{{ subcategory.name }}</span>
              <span class="subcategory-count">({{ subcategory.count }})</span>
            </template>
            <el-menu-item
              v-for="example in getExamplesByCategory(subcategory.id)"
              :key="example.id"
              :index="example.id.toString()"
              :class="{ active: selectedExampleId === example.id }"
              @click="selectExample(example, subcategory, category)"
            >
              <span class="example-title">{{ example.name }}</span>
            </el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
      </el-menu>
    </div>
  </div>
</template>

<script>
import { categories, examples } from '../utils/examplesData.js'

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
      categories
    }
  },
  methods: {
    getExamplesByCategory(categoryId) {
      return examples.filter(ex => ex.category === categoryId)
    },
    selectExample(example, subcategory, category) {
      this.$emit('select', example, subcategory, category)
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
  padding: 0;
}

.sidebar-menu {
  background-color: #f5f5f5;
  border-right: none;
  min-height: 100%;
}

.sidebar-menu .el-menu-item {
  height: 36px;
  line-height: 36px;
  margin: 0;
  padding: 0 20px 0 40px;
  font-size: 13px;
  color: #666;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #f0f8ff;
  color: #1890ff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-left-color: #1890ff;
}

.sidebar-menu .el-sub-menu__title {
  height: 40px;
  line-height: 40px;
  margin: 0;
  padding: 0 20px;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.sidebar-menu .el-sub-menu__title:hover {
  background-color: #f0f8ff;
  color: #1890ff;
}

.sidebar-menu .el-sub-menu__title .el-sub-menu__icon-arrow {
  font-size: 12px;
  color: #999;
}

.sidebar-menu .el-sub-menu .el-sub-menu__title {
  padding-left: 30px;
  background-color: #fafafa;
  font-size: 13px;
  color: #666;
}

.sidebar-menu .el-sub-menu .el-sub-menu__title:hover {
  background-color: #f0f8ff;
  color: #1890ff;
}

.category-icon {
  font-size: 16px;
  margin-right: 8px;
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
  margin-left: 8px;
}

.subcategory-title {
  flex: 1;
  font-weight: 400;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subcategory-count {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
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
  
  .sidebar-menu .el-menu-item {
    padding: 0 16px 0 32px;
    font-size: 12px;
  }
  
  .sidebar-menu .el-sub-menu__title {
    padding: 0 16px;
    font-size: 13px;
  }
  
  .sidebar-menu .el-sub-menu .el-sub-menu__title {
    padding-left: 24px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .left-sidebar {
    width: 60px;
  }
  
  .category-title,
  .category-count,
  .subcategory-title,
  .subcategory-count,
  .example-title {
    display: none;
  }
  
  .sidebar-menu .el-sub-menu__title {
    justify-content: center;
    padding: 0 8px;
  }
  
  .sidebar-menu .el-menu-item {
    padding: 0 4px;
    text-align: center;
    border-left: none;
  }
  
  .category-icon {
    margin-right: 0;
  }
}
</style>