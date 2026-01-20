<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <h1 class="logo">Cesium 专栏</h1>
          <nav class="main-nav">
            <ul class="nav-list">
              <li><a href="#" class="nav-item active">Cesium Examples</a></li>
              <li><a href="#" class="nav-item">Three Examples</a></li>
              <li><a href="#" class="nav-item">WebGL</a></li>
              <li><a href="#" class="nav-item">WebGPU</a></li>
              <li><a href="#" class="nav-item">Cesium 官网</a></li>
            </ul>
          </nav>
        </div>
        <div class="navbar-right">
          <div class="nav-tools">
            <span class="tool-item">版权</span>
            <span class="tool-item">贡献</span>
            <span class="tool-item">源码</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主体内容区 -->
    <div class="main-container">
      <!-- 左侧分类导航 -->
      <aside class="sidebar">
        <nav class="category-nav">
          <ul class="category-list">
            <li
              v-for="category in categoriesData"
              :key="category.id"
              class="category-item"
            >
              <div 
                class="category-header" 
                @click="toggleCategory(category.id)"
                :class="{ active: selectedCategory === category.id }"
              >
                <span class="category-index">{{ category.id }}、{{ category.name }}</span>
                <span class="category-count">({{ category.count }})</span>
                <el-icon
                  class="toggle-icon"
                  :class="{ expanded: expandedCategories.includes(category.id) }"
                >
                  <ArrowRight />
                </el-icon>
              </div>
              <ul
                v-if="expandedCategories.includes(category.id)"
                class="subcategory-list"
              >
                <li
                  v-for="subcategory in category.subcategories"
                  :key="subcategory.id"
                  class="subcategory-item"
                  @click="selectSubcategory(subcategory.id)"
                  :class="{ active: selectedSubcategory === subcategory.id }"
                >
                  {{ subcategory.name }}
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- 右侧示例网格 -->
      <main class="content-area">
        <div class="content-header">
          <h2 class="content-title">{{ currentCategoryName }}</h2>
          <div class="example-count">共 {{ filteredExamples.length }} 个示例</div>
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
                <el-icon class="play-icon"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="example-info">
              <h3 class="example-name">{{ example.name }}</h3>
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
import { ArrowRight, VideoPlay } from '@element-plus/icons-vue'
import { examples, categories } from '../utils/examplesData'

const router = useRouter()

// 状态管理
const expandedCategories = ref([1]) // 默认展开"基础"分类
const selectedCategory = ref(1) // 默认选中"基础"分类
const selectedSubcategory = ref(null)

// 分类数据
const categoriesData = categories

// 示例数据
const examplesData = examples

// 计算属性
const currentCategoryName = computed(() => {
  if (selectedSubcategory.value !== null) {
    // 查找子分类名称
    for (const category of categoriesData) {
      const subcategory = category.subcategories.find(
        sub => sub.id === selectedSubcategory.value
      )
      if (subcategory) {
        return subcategory.name
      }
    }
  }
  
  const category = categoriesData.find(cat => cat.id === selectedCategory.value)
  return category ? category.name : '所有示例'
})

const filteredExamples = computed(() => {
  if (selectedSubcategory.value !== null) {
    // 根据子分类 ID 过滤示例
    return examplesData.filter(ex => ex.id === selectedSubcategory.value)
  }
  
  // 根据分类过滤示例
  return examplesData.filter(ex => ex.category === selectedCategory.value)
})

// 方法
function toggleCategory(categoryId) {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
  
  // 选中该分类
  selectedCategory.value = categoryId
  selectedSubcategory.value = null
}

function selectSubcategory(subcategoryId) {
  selectedSubcategory.value = subcategoryId
}

function goToExample(exampleId) {
  router.push(`/examples/${exampleId}`)
}
</script>

<style scoped>
/* 全局容器 */
.home-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 顶部导航栏 */
.top-navbar {
  background-color: #002140;
  color: white;
  height: 60px;
  min-height: 60px;
  border-bottom: 1px solid #1890ff;
  flex-shrink: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  margin: 0;
  white-space: nowrap;
}

.main-nav {
  flex: 1;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 5px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-item:hover,
.nav-item.active {
  background-color: #1890ff;
  color: white;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.nav-tools {
  display: flex;
  align-items: center;
  gap: 20px;
}

.tool-item {
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.tool-item:hover {
  color: #1890ff;
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
  width: 220px;
  min-width: 220px;
  height: 100%;
  background-color: #f5f5f5;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
}

.category-nav {
  padding: 10px 0;
}

.category-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-item {
  margin-bottom: 5px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  user-select: none;
}

.category-header:hover {
  background-color: #e6f7ff;
}

.category-header.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}

.category-index {
  flex: 1;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-count {
  font-size: 12px;
  color: #666;
  margin-right: 10px;
  flex-shrink: 0;
}

.toggle-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.toggle-icon.expanded {
  transform: rotate(90deg);
}

.subcategory-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background-color: white;
}

.subcategory-item {
  padding: 10px 30px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subcategory-item:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.subcategory-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
}

.content-header {
  height: 60px;
  min-height: 60px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  background-color: #fafafa;
  flex-shrink: 0;
}

.content-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.example-count {
  font-size: 14px;
  color: #666;
}

/* 示例网格 */
.examples-grid {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  align-content: start;
}

.example-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.example-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
  border-color: #1890ff;
}

.example-preview {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #000;
  position: relative;
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
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.example-card:hover .example-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 48px;
  color: white;
}

.example-info {
  padding: 16px;
  background-color: #fafafa;
}

.example-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar,
.examples-grid::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.sidebar::-webkit-scrollbar-track,
.examples-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sidebar::-webkit-scrollbar-thumb,
.examples-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.examples-grid::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .examples-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .navbar-left {
    gap: 15px;
  }
  
  .main-nav {
    display: none;
  }
  
  .navbar-right {
    display: none;
  }
  
  .sidebar {
    width: 180px;
    min-width: 180px;
  }
  
  .examples-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 16px;
  }
  
  .example-preview {
    height: 150px;
  }
}
</style>
