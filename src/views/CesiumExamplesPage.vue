<template>
  <div class="cesium-examples-page">
    <!-- 顶部导航栏 -->
    <top-navbar />

    <!-- 主体内容区 -->
    <div class="main-container">
      <!-- 左侧分类导航 -->
      <aside class="sidebar">
        <div class="search-box">
          <el-input placeholder="请输入关键字搜索" size="small" />
        </div>
        
        <nav class="category-nav">
          <div
            v-for="category in categoriesData"
            :key="category.id"
            class="category-item"
          >
            <div 
              class="category-header" 
              @click="toggleCategory(category.id)"
              :class="{ active: selectedCategory === category.id }"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">({{ category.count }})</span>
              <span class="category-toggle">{{ selectedCategory === category.id ? '▼' : '▶' }}</span>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 右侧示例网格 -->
      <main class="content-area">
        <div class="content-header">
          <h2 class="content-title">
            <span class="title-icon">{{ currentCategoryIcon }}</span>
            {{ currentCategoryName }} ({{ filteredExamples.length }})
          </h2>
        </div>

        <div class="examples-grid">
          <div
            v-for="example in filteredExamples"
            :key="example.id"
            class="example-card"
            @click="goToExample(example.id)"
          >
            <div class="example-preview">
              <img 
                :src="example.preview" 
                :alt="example.name"
                loading="lazy"
              />
              <div class="example-overlay">
                <el-button type="primary" circle icon="el-icon-video-camera" size="large" />
              </div>
            </div>
            <div class="example-info">
              <el-descriptions size="small" :column="1" :border="false">
                <el-descriptions-item>{{ example.name }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { examples, categories } from '../utils/examplesData'
import TopNavbar from '../components/TopNavbar.vue'

const router = useRouter()

// 状态管理
const selectedCategory = ref(1) // 默认选中"基础"分类

// 分类数据
const categoriesData = categories

// 示例数据
const examplesData = examples

// 计算属性
const currentCategoryName = computed(() => {
  const category = categoriesData.find(cat => cat.id === selectedCategory.value)
  return category ? category.name : '所有示例'
})

const currentCategoryIcon = computed(() => {
  const category = categoriesData.find(cat => cat.id === selectedCategory.value)
  return category ? category.icon : '📂'
})

const filteredExamples = computed(() => {
  return examplesData.filter(ex => ex.category === selectedCategory.value)
})

// 方法
function toggleCategory(categoryId) {
  selectedCategory.value = categoryId
}

function goToExample(exampleId) {
  router.push(`/examples/${exampleId}`)
}
</script>

<style scoped>
/* 全局容器 */
.cesium-examples-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-color);
  color: var(--text-color);
}



/* 主体内容区 */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* 左侧分类导航 */
.sidebar {
  width: 260px;
  min-width: 260px;
  height: 100%;
  background-color: var(--card-bg);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.category-nav {
  padding: 8px 0;
}

.category-item {
  margin-bottom: 2px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  user-select: none;
  gap: 8px;
  position: relative;
  background-color: var(--card-bg);
  color: var(--text-color);
}

.category-header:hover {
  background-color: #f0f8ff;
}

.category-header.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
  border-left: 3px solid #1890ff;
}

.category-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
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

.category-toggle {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-color);
}

.content-header {
  height: 56px;
  min-height: 56px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 24px;
  background-color: var(--card-bg);
  flex-shrink: 0;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 18px;
}

/* 示例网格 */
.examples-grid {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  align-content: start;
}

.example-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--card-bg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.example-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #1890ff;
}

.example-preview {
  width: 100%;
  height: 180px;
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
  background-color: var(--card-bg);
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar,
.examples-grid::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar::-webkit-scrollbar-track,
.examples-grid::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.sidebar::-webkit-scrollbar-thumb,
.examples-grid::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.examples-grid::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar {
    width: 220px;
    min-width: 220px;
  }
  
  .examples-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .navbar-left {
    gap: 16px;
  }
  
  .main-nav {
    display: none;
  }
  
  .sidebar {
    width: 60px;
    min-width: 60px;
  }
  
  .category-name,
  .category-count {
    display: none;
  }
  
  .category-header {
    justify-content: center;
    padding: 12px 8px;
  }
  
  .examples-grid {
    padding: 16px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
}
</style>