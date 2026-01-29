<template>
  <div class="cesium-docs-page">
    <!-- 顶部导航栏 -->
    <top-navbar />

    <!-- 主体内容区 -->
    <div class="docs-container">
      <!-- <div class="docs-header">
        <h1 class="docs-title">
          <span class="title-icon">🌍</span>
          Cesium 文档
        </h1>
        <p class="docs-description">使用 iframe 嵌入的 Cesium 教程网站</p>
      </div> -->

      <!-- iframe 嵌入 Cesium 网站 -->
      <div class="iframe-container">
        <iframe
          :src="docsUrl"
          frameborder="0"
          width="100%"
          height="100%"
          class="docs-iframe"
          title="Cesium 文档"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import TopNavbar from '../components/TopNavbar.vue';

const docsUrl = 'http://c.ygyong.cn/';
</script>

<style scoped>
.cesium-docs-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.docs-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.docs-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
}

.docs-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-color);
}

.title-icon {
  font-size: 28px;
}

.docs-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.iframe-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.docs-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .docs-header {
    padding: 16px 20px;
  }

  .docs-title {
    font-size: 20px;
  }
}
</style>
