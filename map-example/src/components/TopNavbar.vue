<template>
  <header class="top-navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <div class="logo" @click="goToHome">
          <span class="logo-icon">🌍</span>
          <span class="logo-text">YGYong</span>
        </div>

        <nav class="custom-nav">
          <ul class="nav-list">
            <li class="nav-item" :class="{ active: activeMenu === 'home' }" @click="goToHome">
              <span class="nav-link">首页</span>
            </li>

            <li class="nav-item" :class="{ active: activeMenu === 'leaflet' }" @click="goToRoute('/leaflet/examples')">
              <span class="nav-link">Leaflet</span>
            </li>

            <li class="nav-item" :class="{ active: activeMenu === 'openlayers' }"
              @click="goToRoute('/openlayers/examples')">
              <span class="nav-link">OpenLayers</span>
            </li>

            <li class="nav-item" :class="{ active: activeMenu === 'cesium' }" @click="goToRoute('/cesium/examples')">
              <span class="nav-link">Cesium</span>
            </li>

            <li class="nav-item" :class="{ active: activeMenu === 'three' }" @click="goToRoute('/three/examples')">
              <span class="nav-link">Three</span>
            </li>

            <li class="nav-item">
              <a class="nav-link nav-external" :href="docsUrl" target="_blank" rel="noopener noreferrer">
                文档
                <svg class="external-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor"
                    d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z" />
                </svg>
              </a>
            </li>

            <li class="nav-item has-dropdown" :class="{ active: activeMenu === 'community' }">
              <span class="nav-link">社区 <span class="arrow">▼</span></span>
              <ul class="dropdown-menu dropdown-menu-left">
                <li class="dropdown-item" v-for="item in socialLinks" :key="item.name">
                  <a class="dropdown-link" :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.text
                    }}</a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>

      <div class="navbar-right">
        <a class="icon-btn github-link" href="https://github.com/YGYong/map-ecology" target="_blank" title="GitHub">
          <svg height="24" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="24" data-view-component="true"
            class="octicon octicon-mark-github">
            <path fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z">
            </path>
          </svg>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
// 状态管理
const activeMenu = ref("home");
const docsUrl = import.meta.env.VITE_DOCS_URL || "http://c.ygyong.cn";

// 社区链接
const socialLinks = [
  {
    text: "Cesium API",
    link: "https://cesium.com/learn/cesiumjs/ref-doc/",
  },
  {
    text: "Cesium Demo",
    link: "https://sandcastle.cesium.com/",
  },
  {
    text: "cesium中文网",
    link: "http://cesium.xin/",
  },
  {
    text: "Openlayers 官网",
    link: "https://openlayers.org/",
  },
  {
    text: "Leaflet 官网",
    link: "https://leafletjs.cn/",
  },
  {
    text: "3D模型",
    link: "https://sketchfab.com/feed",
  },
  {
    text: "GeoJson数据",
    link: "https://geojson.cn/data/atlas/china",
  },
  {
    text: "GeoJson数据（含区县）",
    link: "https://datav.aliyun.com/portal/school/atlas/area_selector",
  },
  {
    text: "GeoJSON边界数据",
    link: "https://geojson.hxkj.vip/",
  },
  {
    text: "Cesium-Examples",
    link: "https://github.com/jiawanlong/Cesium-Examples",
  },
  {
    text: "Three Cesium Examples",
    link: "https://z2586300277.github.io/three-cesium-examples/#/example",
  },
  {
    text: "vue for cesium",
    link: "https://zouyaoji.top/vue-cesium/#/zh-CN",
  },
  {
    text: "地图坐标拾取",
    link: "https://api.map.baidu.com/lbsapi/getpoint/index.html",
  },
  {
    text: "turf.js",
    link: "https://turfjs.fenxianglu.cn/docs/api/along",
  },
  {
    text: "MyUI Map",
    link: "https://myui.vtj.pro/my/ui/map/",
  },
];

// 生命周期
onMounted(() => {
  // 根据当前路由设置激活菜单项
  updateActiveMenu();
});

watch(
  () => route.path,
  () => {
    updateActiveMenu();
  },
);

// 方法
function updateActiveMenu() {
  const path = route.path || window.location.pathname;

  if (path === "/") {
    activeMenu.value = "home";
  } else if (path.startsWith("/examples/")) {
    const parts = path.split("/").filter(Boolean);
    const engine = parts[1];
    if (
      engine === "leaflet" ||
      engine === "openlayers" ||
      engine === "cesium" ||
      engine === "three"
    ) {
      activeMenu.value = engine;
    }
  } else if (path.includes("/openlayers/")) {
    activeMenu.value = "openlayers";
  } else if (path.includes("/leaflet/")) {
    activeMenu.value = "leaflet";
  } else if (path.includes("/cesium/")) {
    activeMenu.value = "cesium";
  } else if (path.includes("/three/")) {
    activeMenu.value = "three";
  } else if (path.includes("/community")) {
    activeMenu.value = "community";
  }
}

function goToHome() {
  router.push("/");
  activeMenu.value = "home";
}

function goToRoute(path) {
  router.push(path);
}
</script>

<style scoped>
.top-navbar {
  height: 60px;
  min-height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  flex-shrink: 0;
  z-index: 100;
  position: relative;
}

.navbar-container {
  /* max-width: 1400px; */
  height: 100%;
  /* margin: 0 auto; */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 48px;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  color: #1a1a1a;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 32px;
}

.logo-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-text {
  font-size: 20px;
  line-height: 1.2;
}

.logo-sub {
  font-size: 12px;
  color: #666;
  font-weight: 400;
  line-height: 1.2;
}

/* Custom Navigation Styles */
.custom-nav {
  height: 100%;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  gap: 8px;
}

.nav-item {
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  padding: 0 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 2px solid transparent;
}

.nav-link {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-external {
  text-decoration: none;
}

.external-icon {
  width: 16px;
  height: 16px;
  opacity: 0.65;
}

.nav-item:hover .nav-link,
.nav-item.active .nav-link {
  color: #1890ff;
}

.nav-item.active {
  border-bottom-color: #1890ff;
}

.arrow {
  font-size: 10px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.5;
}

.nav-item:hover .arrow {
  transform: rotate(180deg);
  opacity: 1;
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: white;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 4px 0;
  list-style: none;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
}

.nav-item.has-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-menu-left {
  left: 0;
  transform: translateX(0) translateY(10px);
}

.nav-item.has-dropdown:hover .dropdown-menu-left {
  transform: translateX(0) translateY(0);
}

.dropdown-header {
  padding: 8px 20px 4px;
  font-size: 12px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 4px 0;
}

.dropdown-item {
  padding: 8px 20px;
  font-size: 14px;
  color: #333;
  transition:
    background-color 0.2s,
    color 0.2s;
  white-space: nowrap;
  text-align: left;
}

.dropdown-link {
  color: inherit;
  text-decoration: none;
  display: block;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
  color: #1890ff;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  cursor: pointer;
}

.icon-btn:hover {
  background-color: #f0f0f0;
  color: #000;
}

/* Responsive */
@media (max-width: 768px) {
  .custom-nav {
    display: none;
  }
}
</style>
