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

        <el-menu :default-openeds="['1']" class="category-menu" :collapse-transition="false">
          <el-sub-menu v-for="category in categoriesData" :key="category.id" :index="category.id.toString()">
            <template #title>
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">({{ category.count }})</span>
            </template>
            <el-menu-item v-for="subcategory in category.subcategories" :key="subcategory.id"
              :index="subcategory.id.toString()" :class="{ active: selectedSubcategory === subcategory.id }"
              @click="selectSubcategory(subcategory, category)">
              <span class="subcategory-name">{{ subcategory.name }}</span>
              <span class="subcategory-count">({{ subcategory.count }})</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <!-- 右侧示例网格 -->
      <main class="content-area">
        <div class="content-header">
          <h2 class="content-title">
            <span class="title-icon">{{ currentCategoryIcon }}</span>
            {{ currentCategoryName }} / {{ currentSubcategoryName }}
          </h2>
        </div>

        <div class="examples-container" ref="examplesContainer">
          <!-- 按小专栏分组显示示例 -->
          <div v-for="category in categoriesData" :key="category.id" class="category-section">
            <div v-for="subcategory in category.subcategories" :key="subcategory.id" class="subcategory-section"
              :id="`subcategory-${subcategory.id}`">
              <h3 class="subcategory-title">
                <span class="subcategory-icon">{{ category.icon }}</span>
                {{ subcategory.name }} ({{ getExamplesBySubcategory(subcategory.id).length }})
              </h3>
              <div class="examples-grid">
                <div v-for="example in getExamplesBySubcategory(subcategory.id)" :key="example.id" class="example-card"
                  @click="goToExample(example.id)">
                  <div class="example-preview">
                    <img :src="getPreviewImage(example.preview)" :alt="example.name" loading="lazy" />
                    <!-- <div class="example-overlay">
                      <el-button type="primary" circle icon="el-icon-video-camera" size="large" />
                    </div> -->
                  </div>
                  <div class="example-info">
                    {{ example.name }}
                    <!-- <el-descriptions size="small" :column="1" :border="false">
                      <el-descriptions-item>{{ example.name }}</el-descriptions-item>
                    </el-descriptions> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { examples, categories } from '../utils/examplesData'
import TopNavbar from '../components/TopNavbar.vue'

const router = useRouter()

// 滚动位置保存
const examplesContainer = ref(null)
const SCROLL_POS_KEY = 'cesium_examples_scroll_pos'

// 生命周期
onMounted(() => {
  // 恢复滚动位置
  const savedPos = sessionStorage.getItem(SCROLL_POS_KEY)
  if (savedPos && examplesContainer.value) {
    // 使用 setTimeout 确保 DOM 渲染完成
    setTimeout(() => {
      examplesContainer.value.scrollTop = parseInt(savedPos)
    }, 0)
  }
})

// 导入所有预览图
const images = import.meta.glob('../assets/cesiumImg/*.{png,jpg,jpeg,svg}', { eager: true })

// 获取预览图 URL
function getPreviewImage(path) {
  if (!path) return ''

  // 处理 @ 别名，将其转换为相对于当前文件的路径
  // 当前文件在 src/views/，图片在 src/assets/
  // 所以 @/assets 对应 ../assets
  const lookupPath = path.replace('@/assets', '../assets')

  const mod = images[lookupPath]
  return mod ? mod.default : path
}

// 状态管理
const selectedCategory = ref(1) // 默认选中"快速开始"分类
const selectedSubcategory = ref(11) // 默认选中"快速开始示例"子分类

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

const currentSubcategoryName = computed(() => {
  let subcategoryName = '所有示例'
  categoriesData.forEach(category => {
    const subcategory = category.subcategories.find(sub => sub.id === selectedSubcategory.value)
    if (subcategory) {
      subcategoryName = subcategory.name
    }
  })
  return subcategoryName
})

// 方法
function getExamplesBySubcategory(subcategoryId) {
  return examplesData.filter(ex => ex.category === subcategoryId)
}

function selectSubcategory(subcategory, category) {
  selectedSubcategory.value = subcategory.id
  selectedCategory.value = category.id

  // 滚动定位到对应的小专栏
  setTimeout(() => {
    const element = document.getElementById(`subcategory-${subcategory.id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

function goToExample(exampleId) {
  if (examplesContainer.value) {
    sessionStorage.setItem(SCROLL_POS_KEY, examplesContainer.value.scrollTop.toString())
  }
  router.push(`/examples/cesium/${exampleId}`)
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

.category-menu {
  background-color: var(--card-bg);
  border-right: none;
  min-height: 100%;
  padding: 8px 0;
}

.category-menu .el-menu-item {
  height: 36px;
  line-height: 36px;
  margin: 0;
  padding: 0 20px 0 40px;
  font-size: 13px;
  color: var(--text-color);
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.category-menu .el-menu-item:hover {
  background-color: #f0f8ff;
  color: #1890ff;
}

.category-menu .el-menu-item.is-active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-left-color: #1890ff;
}

.category-menu .el-sub-menu__title {
  height: 40px;
  line-height: 40px;
  margin: 0;
  padding: 0 20px;
  font-size: 14px;
  color: var(--text-color);
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.category-menu .el-sub-menu__title:hover {
  background-color: #f0f8ff;
  color: #1890ff;
}

.category-menu .el-sub-menu__title .el-sub-menu__icon-arrow {
  font-size: 12px;
  color: #999;
}

.category-icon {
  font-size: 16px;
  margin-right: 8px;
  color: #666;
}

.category-name {
  flex: 1;
  font-weight: 500;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-count {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.subcategory-name {
  flex: 1;
  font-weight: 400;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subcategory-count {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
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

/* 示例容器 */
.examples-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.category-section {
  margin-bottom: 40px;
}

.subcategory-section {
  margin-bottom: 32px;
  padding-top: 8px;
}

.subcategory-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding-left: 12px;
  border-left: 4px solid #1890ff;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
}

.subcategory-icon {
  font-size: 16px;
  color: #1890ff;
}

/* 示例网格 */
.examples-grid {
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
