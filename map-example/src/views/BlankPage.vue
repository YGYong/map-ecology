<template>
  <div class="blank-page">
    <!-- 顶部导航栏 -->
    <top-navbar />

    <!-- 主体内容区 -->
    <div class="content-container">
      <div class="content">
        <el-empty description="页面开发中..." />
      </div>
    </div>
  </div>
</template>

<script setup>
import TopNavbar from '../components/TopNavbar.vue'
</script>

<style scoped>
.blank-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
}



/* 主体内容区 */
.content-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.content {
  text-align: center;
  color: var(--text-color);
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .navbar-left {
    gap: 16px;
  }
  
  .main-nav {
    flex: none;
  }
}

@media (max-width: 768px) {
  .navbar-left {
    gap: 16px;
  }
  
  .main-nav {
    display: none;
  }
}
</style>