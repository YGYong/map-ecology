<template>
  <div class="not-found-page">
    <div class="content">
      <div class="error-code">404</div>
      <div class="error-title">页面未找到</div>
      <div class="error-desc">
        抱歉，您访问的页面不存在或已被移除。<br>
        可能是输入的网址有误，或者该页面已经搬家了。
      </div>
      <div class="actions">
        <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
        <el-button size="large" @click="goBack">返回上一页</el-button>
      </div>
    </div>
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.content {
  text-align: center;
  z-index: 10;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  width: 90%;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(to right, #60a5fa, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
  font-family: monospace;
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #e2e8f0;
}

.error-desc {
  font-size: 16px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: #8b5cf6;
  bottom: -50px;
  right: -50px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: #ec4899;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.1;
}

@media (max-width: 640px) {
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .content {
    padding: 24px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions .el-button {
    width: 100%;
    margin-left: 0 !important;
  }
}
</style>
