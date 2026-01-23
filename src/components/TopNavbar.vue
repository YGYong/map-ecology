<template>
  <header class="top-navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <div class="logo">
          <span class="logo-icon">🌍</span>
          <span class="logo-text">YGYong</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="main-nav"
          mode="horizontal"
          :ellipsis="false"
        >
          <el-menu-item index="home" @click="goToHome">
            <span class="nav-link">首页</span>
          </el-menu-item>
          <el-sub-menu index="openlayers">
            <template #title>
              <span class="nav-link">OpenLayers</span>
            </template>
            <el-menu-item
              index="openlayers-examples"
              @click="goToRoute('/openlayers/examples')"
            >
              <span class="dropdown-link">案例</span>
            </el-menu-item>
            <el-menu-item
              index="openlayers-docs"
              @click="goToRoute('/openlayers/docs')"
            >
              <span class="dropdown-link">文档</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="leaflet">
            <template #title>
              <span class="nav-link">Leaflet</span>
            </template>
            <el-menu-item
              index="leaflet-examples"
              @click="goToRoute('/leaflet/examples')"
            >
              <span class="dropdown-link">案例</span>
            </el-menu-item>
            <el-menu-item
              index="leaflet-docs"
              @click="goToRoute('/leaflet/docs')"
            >
              <span class="dropdown-link">文档</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="cesium">
            <template #title>
              <span class="nav-link">Cesium</span>
            </template>
            <el-menu-item
              index="cesium-examples"
              @click="goToRoute('/cesium/examples')"
            >
              <span class="dropdown-link">案例</span>
            </el-menu-item>
            <el-menu-item
              index="cesium-docs"
              @click="goToRoute('/cesium/docs')"
            >
              <span class="dropdown-link">文档</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="three">
            <template #title>
              <span class="nav-link">Three.js</span>
            </template>
            <el-menu-item
              index="three-examples"
              @click="goToRoute('/three/examples')"
            >
              <span class="dropdown-link">案例</span>
            </el-menu-item>
            <el-menu-item index="three-docs" @click="goToRoute('/three/docs')">
              <span class="dropdown-link">文档</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item index="community" @click="goToRoute('/community')">
            <span class="nav-link">社区</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="navbar-right">
        <!-- <el-button type="primary" size="small">新增案例</el-button>
        <el-button size="small" @click="toggleFullScreen">全屏浏览</el-button> -->
        <el-button size="small" circle>
          <i class="el-icon-link" @click="goToGithub">11</i>
        </el-button>
        <!-- <el-switch
          v-model="isDarkMode"
          active-text="深色"
          inactive-text="浅色"
          @change="toggleTheme"
        /> -->
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
// 状态管理
const activeMenu = ref("home");
const isDarkMode = ref(false);

// 生命周期
onMounted(() => {
  // 检查本地存储中的主题设置
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    isDarkMode.value = true;
    document.documentElement.classList.add("dark-theme");
  }
  
  // 根据当前路由设置激活菜单项
  updateActiveMenu();
});

// 方法
function updateActiveMenu() {
  const path = window.location.pathname;
  
  if (path === '/') {
    activeMenu.value = 'home';
  } else if (path.includes('/openlayers/')) {
    activeMenu.value = 'openlayers';
  } else if (path.includes('/leaflet/')) {
    activeMenu.value = 'leaflet';
  } else if (path.includes('/cesium/')) {
    activeMenu.value = 'cesium';
  } else if (path.includes('/three/')) {
    activeMenu.value = 'three';
  } else if (path.includes('/community')) {
    activeMenu.value = 'community';
  }
}
// 方法
function goToHome() {
  router.push("/");
}

function goToRoute(path) {
  // 所有路由都使用正常跳转
  router.push(path);
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(
        `Error attempting to enable full-screen mode: ${err.message}`,
      );
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function goToGithub() {
  window.open("https://github.com", "_blank");
}

function toggleTheme() {
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark-theme");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark-theme");
    localStorage.setItem("theme", "light");
  }
}
</script>

<style scoped>
.top-navbar {
  height: 60px;
  min-height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  flex-shrink: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1400px;
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
}

.logo-icon {
  font-size: 24px;
}

.main-nav {
  flex: 1;
}

.nav-link {
  color: rgba(0, 0, 0, 0.65);
  text-decoration: none;
  font-size: 14px;
  white-space: nowrap;
}

.nav-link:hover {
  color: #1890ff;
}

.dropdown-link {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  width: 100%;
  display: block;
  padding: 0 20px;
}

.dropdown-link:hover {
  color: #1890ff;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
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
