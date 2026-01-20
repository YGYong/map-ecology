import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'

// 导入 Cesium
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// 配置 Cesium
window.Cesium = Cesium

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')