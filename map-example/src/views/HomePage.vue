<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <top-navbar />

    <div class="scroll-container">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-glow"></div>
        <div class="hero-content">
          <div class="badge">Map Ecology v1.0</div>
          <h1 class="hero-title">
            让二三维地图开发<br />
            <span class="gradient-text">更简单，更高效</span>
          </h1>
          <p class="hero-subtitle">
            集成 Cesium, OpenLayers, Leaflet 与 Three.js 的综合开发生态，从理论到实战，助力构建新一代 Web GIS 应用。
          </p>
          <div class="hero-actions">
            <a href="http://c.ygyong.cn" target="_blank" class="btn btn-primary">
              <span class="btn-icon">�</span> 查看文档
            </a>
            <button @click="scrollToShowcase" class="btn btn-secondary">
              <span class="btn-icon">🎨</span> 探索案例
            </button>
          </div>
        </div>
      </section>

      <!-- 框架展示区域 -->
      <section id="showcase" class="showcase-section">
        <div class="section-header">
          <h2 class="section-title">核心技术栈</h2>
          <p class="section-desc">选择适合您业务场景的地图引擎，开启开发之旅</p>
        </div>

        <div class="showcase-grid">
          <!-- Cesium -->
          <div class="tech-card cesium">
            <div class="card-glass"></div>
            <div class="card-icon">🌍</div>
            <h3>Cesium.js</h3>
            <p>世界级 3D 地球引擎。支持海量 3D Tiles、倾斜摄影、BIM 模型加载，构建数字孪生底座。</p>
            <div class="card-footer">
              <span class="tag">3D Tiles</span>
              <span class="tag">Digital Twin</span>
            </div>
          </div>

          <!-- OpenLayers -->
          <div class="tech-card openlayers">
            <div class="card-glass"></div>
            <div class="card-icon">🗺️</div>
            <h3>OpenLayers</h3>
            <p>企业级二维地图引擎。支持 OGC 标准服务，提供强大的矢量渲染与空间分析能力。</p>
            <div class="card-footer">
              <span class="tag">OGC</span>
              <span class="tag">WebGL</span>
            </div>
          </div>

          <!-- Leaflet -->
          <div class="tech-card leaflet">
            <div class="card-glass"></div>
            <div class="card-icon">🍃</div>
            <h3>Leaflet</h3>
            <p>轻量级移动端优先。体积小巧，插件生态丰富，现代移动 Web GIS 的首选方案。</p>
            <div class="card-footer">
              <span class="tag">Lightweight</span>
              <span class="tag">Mobile</span>
            </div>
          </div>

          <!-- Three.js -->
          <div class="tech-card threejs">
            <div class="card-glass"></div>
            <div class="card-icon">🧊</div>
            <h3>Three.js</h3>
            <p>WebGL 图形渲染库。打造高保真虚拟仿真，支持自定义着色器与物理引擎。</p>
            <div class="card-footer">
              <span class="tag">WebGL</span>
              <span class="tag">Visualization</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系方式区域 -->
      <section class="connect-section">
        <div class="connect-container">
          <div class="connect-info">
            <h2 class="section-title">保持联系</h2>
            <p class="section-desc">如果您有任何问题、建议或商务合作意向，欢迎随时联系我。</p>
            <div class="contact-methods">
              <div class="method-item">
                <span class="method-icon">📧</span>
                <div class="method-text">
                  <label>邮箱</label>
                  <span>ygyong@foxmail.com</span>
                </div>
              </div>
              <div class="method-item">
                <span class="method-icon">💬</span>
                <div class="method-text">
                  <label>微信</label>
                  <span>YL71317</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="qr-grid">
            <div class="qr-item">
              <div class="qr-frame">
                <img src="/me/card.jpg" alt="个人微信" />
              </div>
              <span>个人微信</span>
            </div>
            <div class="qr-item">
              <div class="qr-frame">
                <img src="/me/gzh.jpg" alt="微信公众号" />
              </div>
              <span>微信公众号</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部 -->
      <footer class="main-footer">
        <div class="footer-content">
          <div class="footer-logo">Map Ecology</div>
          <p>© 2024-2025 Map Ecology. Built with ❤️ for GIS Developers.</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import TopNavbar from "../components/TopNavbar.vue";

const scrollToShowcase = () => {
  const el = document.getElementById('showcase');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped>
/* 基础变量 */
:root {
  --primary-color: #3b82f6;
  --bg-dark: #0f172a;
  --text-main: #1e293b;
  --text-light: #64748b;
}

.home-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  color: var(--text-main);
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* 英雄区域重构 */
.hero-section {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-dark);
  color: #fff;
  padding: 0 24px;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 70%);
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 900px;
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 100px;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 32px;
}

.hero-title {
  font-size: clamp(40px, 8vw, 72px);
  line-height: 1.1;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: clamp(16px, 2vw, 20px);
  color: #94a3b8;
  max-width: 650px;
  margin: 0 auto 48px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
  border: none;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 框架展示区域 */
.showcase-section {
  padding: 100px 24px;
  background: #f8fafc;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.section-desc {
  color: var(--text-light);
  font-size: 18px;
}

.showcase-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.tech-card {
  position: relative;
  padding: 40px;
  background: #fff;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.tech-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  border-color: var(--primary-color);
}

.card-icon {
  font-size: 40px;
  margin-bottom: 24px;
}

.tech-card h3 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
}

.tech-card p {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 24px;
}

.card-footer {
  display: flex;
  gap: 8px;
}

.tag {
  font-size: 12px;
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 100px;
  color: #475569;
}

/* 联系方式区域重构 */
.connect-section {
  padding: 100px 24px;
  background: #fff;
}

.connect-container {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.connect-info .section-title {
  text-align: left;
}

.contact-methods {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.method-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.method-text label {
  display: block;
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 4px;
}

.method-text span {
  font-size: 18px;
  font-weight: 600;
}

.qr-grid {
  display: flex;
  gap: 40px;
  justify-content: center;
}

.qr-item {
  text-align: center;
}

.qr-frame {
  width: 180px;
  height: 180px;
  padding: 12px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  margin-bottom: 16px;
  border: 1px solid #f1f5f9;
}

.qr-frame img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保证二维码不变形 */
  border-radius: 8px;
}

.qr-item span {
  font-weight: 600;
  color: var(--text-light);
}

/* 底部 */
.main-footer {
  padding: 48px 24px;
  background: var(--bg-dark);
  color: #94a3b8;
  text-align: center;
}

.footer-logo {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 16px;
}

/* 响应式适配 */
@media (max-width: 968px) {
  .connect-container {
    grid-template-columns: 1fr;
    gap: 60px;
    text-align: center;
  }
  
  .connect-info .section-title {
    text-align: center;
  }
  
  .contact-methods {
    align-items: center;
  }
  
  .qr-grid {
    gap: 24px;
  }
  
  .qr-frame {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .hero-actions {
    flex-direction: column;
  }
  
  .qr-grid {
    flex-direction: column;
    align-items: center;
  }
}
</style>
