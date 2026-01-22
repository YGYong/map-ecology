<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <top-navbar />

    <!-- 主体内容区 -->
    <div class="hero-container">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">二三维地图开发指南</h1>
            <h2 class="hero-subtitle">从入门到精通</h2>
            <p class="hero-description">
              深入二三维地图开发 | 核心技术原理剖析 | 最佳实践分享
            </p>
            <el-button
              type="primary"
              size="large"
              class="hero-btn"
              @click="exploreExamples"
            >
              快速进入
            </el-button>
          </div>
          <div class="hero-icon">
            <el-icon class="map-icon"><i class="el-icon-location"></i></el-icon>
          </div>
        </div>
      </section>

      <!-- 核心内容区域 -->
      <section class="core-section">
        <div class="core-grid">
          <el-card class="core-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>基础概念</h3>
              </div>
            </template>
            <p class="card-content">
              学习二三维地图开发的基本概念，如地图服务、图层、坐标系统、相机控制等核心知识点。
            </p>
            <el-button type="primary" size="small" class="card-btn">
              了解更多
            </el-button>
          </el-card>

          <el-card class="core-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>实践指南</h3>
              </div>
            </template>
            <p class="card-content">
              通过实际案例，逐步掌握各地图库的使用技巧，打通各种地图开发场景的技术难点。
            </p>
            <el-button type="primary" size="small" class="card-btn">
              查看案例
            </el-button>
          </el-card>

          <el-card class="core-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>持续学习</h3>
              </div>
            </template>
            <p class="card-content">
              不断学习前沿技术，掌握地图开发的最新趋势和最佳实践，提升开发技能水平。
            </p>
            <el-button type="primary" size="small" class="card-btn">
              学习资源
            </el-button>
          </el-card>
        </div>
      </section>

      <!-- 热门技术区域 -->
      <section class="tech-section">
        <h2 class="section-title">热门地图技术</h2>
        <div class="tech-grid">
          <el-card
            class="tech-card"
            shadow="hover"
            @click="goToTech('openlayers')"
          >
            <div class="tech-icon">
              <i class="el-icon-picture-outline"></i>
            </div>
            <h3 class="tech-name">OpenLayers</h3>
            <p class="tech-desc">
              开源的JavaScript库，用于在网页上显示地图数据
            </p>
          </el-card>

          <el-card
            class="tech-card"
            shadow="hover"
            @click="goToTech('leaflet')"
          >
            <div class="tech-icon">
              <i class="el-icon-location-outline"></i>
            </div>
            <h3 class="tech-name">Leaflet</h3>
            <p class="tech-desc">
              轻量级的开源JavaScript库，用于移动友好的交互式地图
            </p>
          </el-card>

          <el-card class="tech-card" shadow="hover" @click="goToTech('cesium')">
            <div class="tech-icon">
              <i class="el-icon-video-camera"></i>
            </div>
            <h3 class="tech-name">Cesium</h3>
            <p class="tech-desc">用于创建世界级3D地球和地图的JavaScript库</p>
          </el-card>

          <el-card class="tech-card" shadow="hover" @click="goToTech('three')">
            <div class="tech-icon">
              <i class="el-icon-s-platform"></i>
            </div>
            <h3 class="tech-name">Three.js</h3>
            <p class="tech-desc">
              JavaScript 3D库，用于在网页上创建和显示3D图形
            </p>
          </el-card>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import TopNavbar from "../components/TopNavbar.vue";

const router = useRouter();

// 方法
function exploreExamples() {
  // 跳转到示例页面或展开示例列表
  router.push("/cesium/examples");
}

function goToTech(tech) {
  // 跳转到对应技术的页面
  router.push(`/${tech}/examples`);
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
  background-color: #f5f5f5;
}

/* 主题切换样式 */
:root {
  --bg-color: #f5f5f5;
  --text-color: #333;
  --card-bg: #fff;
  --border-color: #e8e8e8;
}

.dark-theme {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --card-bg: #2d2d2d;
  --border-color: #404040;
}

.home-page {
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
  background-color: white;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
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
  background-color: #fafafa;
}

.content-header {
  height: 56px;
  min-height: 56px;
  border-bottom: 1px solid #e8e8e8;
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
  color: #333;
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
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
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
  background-color: #f0f0f0;
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.example-info {
  padding: 16px;
  background-color: white;
}

.example-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: #333;
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

/* 英雄区域样式 */
.hero-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.hero-section {
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 48px;
}

.hero-text {
  flex: 1;
  text-align: left;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(90deg, #63b3ed, #90cdf4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.hero-description {
  font-size: 16px;
  margin: 0 0 32px 0;
  opacity: 0.9;
}

.hero-btn {
  padding: 12px 32px;
  font-size: 16px;
  border-radius: 8px;
}

.hero-icon {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-icon {
  font-size: 120px;
  opacity: 0.8;
}

/* 核心内容区域样式 */
.core-section {
  padding: 60px 0;
  background-color: var(--bg-color);
}

.core-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.core-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
}

.core-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.card-content {
  padding: 20px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 20px;
}

.card-btn {
  margin: 0 16px 16px 16px;
}

/* 热门技术区域样式 */
.tech-section {
  padding: 60px 0;
  background-color: var(--bg-color);
}

.section-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 40px 0;
  color: var(--text-color);
}

.tech-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.tech-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  cursor: pointer;
  text-align: center;
  padding: 32px 24px;
}

.tech-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #1890ff;
}

.tech-icon {
  font-size: 48px;
  margin: 0 0 16px 0;
  color: #1890ff;
}

.tech-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-color);
}

.tech-desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-text {
    text-align: center;
  }

  .core-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .tech-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 20px;
  }

  .hero-section {
    padding: 60px 0;
  }

  .core-section,
  .tech-section {
    padding: 40px 0;
  }

  .core-grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }
}
</style>
