<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <top-navbar />

    <!-- 主体内容区 -->
    <div class="scroll-container">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-background">
          <div class="glow glow-1"></div>
          <div class="glow glow-2"></div>
        </div>
        <div class="hero-content">
          <h1 class="hero-title">二三维地图开发 <span class="divider">&</span> 三维技术开发</h1>
          <p class="hero-subtitle">
            探索空间数据的无限可能 · 构建沉浸式三维世界
          </p>
          <div class="hero-decoration">
            <div class="line"></div>
            <span class="icon">🚀</span>
            <div class="line"></div>
          </div>
        </div>
      </section>

      <!-- 核心展示区域 -->
      <section class="showcase-section">
        <div class="showcase-container">
          
          <!-- 卡片1: OpenLayers -->
          <div class="showcase-card">
            <div class="card-icon-wrapper">
              <span class="card-emoji">🗺️</span>
            </div>
            <div class="card-content">
              <h3>OpenLayers</h3>
              <p class="description">
                企业级二维地图引擎。支持 WMS、WMTS 等标准 OGC 服务，提供强大的矢量切片渲染与复杂的几何分析能力，适用于高精度 GIS 业务系统。
              </p>
              <div class="tech-tags">
                <span class="tag">OGC Standards</span>
                <span class="tag">Vector Tiles</span>
                <span class="tag">Professional GIS</span>
              </div>
            </div>
          </div>

          <!-- 卡片2: Leaflet -->
          <div class="showcase-card">
            <div class="card-icon-wrapper">
              <span class="card-emoji">🍃</span>
            </div>
            <div class="card-content">
              <h3>Leaflet</h3>
              <p class="description">
                轻量级移动端优先的地图库。体积小巧，插件生态丰富，专注于核心地图交互，是构建现代移动 Web GIS 应用的首选方案。
              </p>
              <div class="tech-tags">
                <span class="tag">Mobile First</span>
                <span class="tag">Lightweight</span>
                <span class="tag">Plugins</span>
              </div>
            </div>
          </div>

          <!-- 卡片3: Cesium -->
          <div class="showcase-card featured">
            <div class="card-icon-wrapper">
              <span class="card-emoji">🌍</span>
            </div>
            <div class="card-content">
              <h3>Cesium</h3>
              <p class="description">
                世界级 3D 地球引擎。支持海量 3D Tiles 倾斜摄影、BIM 模型加载，实现宏观地球与微观场景的无缝切换，构建数字孪生底座。
              </p>
              <div class="tech-tags">
                <span class="tag">3D Tiles</span>
                <span class="tag">Digital Twin</span>
                <span class="tag">BIM/CAD</span>
              </div>
            </div>
          </div>

          <!-- 卡片4: Three.js -->
          <div class="showcase-card featured">
            <div class="card-icon-wrapper">
              <span class="card-emoji">🧊</span>
            </div>
            <div class="card-content">
              <h3>Three.js</h3>
              <p class="description">
                WebGL 三维图形渲染库。打造高保真的虚拟仿真场景，支持自定义着色器、物理引擎与粒子特效，突破浏览器图形渲染极限。
              </p>
              <div class="tech-tags">
                <span class="tag">WebGL</span>
                <span class="tag">Shaders</span>
                <span class="tag">Physics</span>
              </div>
            </div>
          </div>

          <!-- 卡片5: Spatial Analysis -->
          <div class="showcase-card">
            <div class="card-icon-wrapper">
              <span class="card-emoji">📐</span>
            </div>
            <div class="card-content">
              <h3>地理空间分析</h3>
              <p class="description">
                基于 Turf.js 等库实现的纯前端空间分析能力。支持缓冲区分析、叠加分析、空间测量与几何计算，赋予 Web 地图深度的业务逻辑。
              </p>
              <div class="tech-tags">
                <span class="tag">Turf.js</span>
                <span class="tag">Buffer</span>
                <span class="tag">Intersection</span>
              </div>
            </div>
          </div>

          <!-- 卡片6: Data Visualization -->
          <div class="showcase-card">
            <div class="card-icon-wrapper">
              <span class="card-emoji">📊</span>
            </div>
            <div class="card-content">
              <h3>时空数据可视化</h3>
              <p class="description">
                融合 ECharts 与 Mapbox 技术的时空大数据展示。通过热力图、飞线图、散点聚类等形式，直观呈现海量地理数据的时空分布规律。
              </p>
              <div class="tech-tags">
                <span class="tag">ECharts</span>
                <span class="tag">Heatmap</span>
                <span class="tag">Big Data</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- 底部标语 -->
      <footer class="footer-slogan">
        <p>开启您的地理空间与三维可视化之旅</p>
        <p class="contact-info">技术交流 / 商务合作请联系微信：YL71317</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import TopNavbar from "../components/TopNavbar.vue";
// 首页不再包含跳转逻辑，仅作为展示页
</script>

<style scoped>
/* 全局容器 */
.home-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f8f9fa;
  font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* 英雄区域 */
.hero-section {
  position: relative;
  height: 35vh;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  background: #0f172a;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}

.glow-1 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  top: -150px;
  left: -100px;
  animation: float 10s infinite alternate;
}

.glow-2 {
  width: 500px;
  height: 500px;
  background: #8b5cf6;
  bottom: -200px;
  right: -100px;
  animation: float 12s infinite alternate-reverse;
}

@keyframes float {
  0% { transform: translate(0, 0); }
  100% { transform: translate(30px, 30px); }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  padding: 0 24px;
}

.hero-title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  background: linear-gradient(to right, #fff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.divider {
  color: #3b82f6;
  -webkit-text-fill-color: #3b82f6;
  font-weight: 300;
  margin: 0 10px;
}

.hero-subtitle {
  font-size: 16px;
  font-weight: 400;
  color: #94a3b8;
  margin-bottom: 24px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0.5;
}

.line {
  height: 1px;
  width: 60px;
  background: #475569;
}

.icon {
  font-size: 20px;
}

/* 核心展示区域 */
.showcase-section {
  padding: 60px 40px;
  background: linear-gradient(to bottom, #f8f9fa, #eef2f6);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.showcase-container {
  width: 100%;
  max-width: 1600px; /* 增加最大宽度，利用宽屏空间 */
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.showcase-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.02);
}

.showcase-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.08);
  border-color: rgba(59, 130, 246, 0.1);
}

/* Featured card slightly emphasized */
.showcase-card.featured {
  background: linear-gradient(to bottom, #fff, #f8fafc);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.card-icon-wrapper {
  width: 100px;
  height: 100px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.showcase-card:hover .card-icon-wrapper {
  background: #eff6ff;
  transform: scale(1.1);
}

.card-emoji {
  font-size: 48px;
}

.card-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: #64748b;
  margin-bottom: 24px;
  flex: 1; /* 让描述部分占据剩余空间，保持底部对齐 */
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.tag {
  background: #f8fafc;
  color: #475569;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.showcase-card:hover .tag {
  background: #fff;
  border-color: #bfdbfe;
  color: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.1);
}

/* 底部 */
.footer-slogan {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
  background: #0f172a;
  border-top: 1px solid #1e293b;
}

.footer-slogan p {
  margin: 8px 0;
  font-size: 14px;
  letter-spacing: 1px;
}

.contact-info {
  color: #64748b;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .showcase-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }
  
  .showcase-container {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }
  
  .showcase-section {
    padding: 40px 0;
  }
}
</style>