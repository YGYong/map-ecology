<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <div class="logo">
            <span class="logo-icon">🌍</span>
            <span class="logo-text">Mars3D平台</span>
          </div>
          <nav class="main-nav">
            <a href="#" class="nav-item">首页</a>
            <a href="#" class="nav-item active">功能</a>
            <a href="#" class="nav-item">项目</a>
            <a href="#" class="nav-item">纸代码</a>
            <a href="#" class="nav-item">开发</a>
            <a href="#" class="nav-item">民宿</a>
          </nav>
        </div>
        <div class="navbar-right">
          <button class="nav-btn">新增案例</button>
          <button class="nav-btn">全屏浏览</button>
        </div>
      </div>
    </header>

    <!-- 主体内容区 -->
    <div class="main-container">
      <!-- 左侧分类导航 -->
      <aside class="sidebar">
        <div class="search-box">
          <input type="text" placeholder="请输入关键字搜索" class="search-input" />
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
              <span class="category-icon">📁</span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">({{ category.count }})</span>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 右侧示例网格 -->
      <main class="content-area">
        <div class="content-header">
          <h2 class="content-title">
            <span class="title-icon">📂</span>
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
                <div class="play-icon">▶</div>
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
import { examples, categories } from '../utils/examplesData'

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
.home-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f0f2f5;
}

/* 顶部导航栏 */
.top-navbar {
  background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  height: 56px;
  min-height: 56px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  padding: 0 24px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.logo-icon {
  font-size: 24px;
}

.main-nav {
  display: flex;
  gap: 4px;
}

.nav-item {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 500;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
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
  background-color: white;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
}

.category-header:hover {
  background-color: #f3f4f6;
}

.category-header.active {
  background-color: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
  border-left: 3px solid #3b82f6;
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
  color: #9ca3af;
  flex-shrink: 0;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f9fafb;
}

.content-header {
  height: 56px;
  min-height: 56px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background-color: white;
  flex-shrink: 0;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  align-content: start;
}

.example-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.example-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #3b82f6;
}

.example-preview {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #1f2937;
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

.play-icon {
  font-size: 48px;
  color: white;
}

.example-info {
  padding: 16px;
}

.example-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar,
.examples-grid::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar::-webkit-scrollbar-track,
.examples-grid::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.sidebar::-webkit-scrollbar-thumb,
.examples-grid::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.examples-grid::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
