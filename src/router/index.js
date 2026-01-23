import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ExampleDetailPage from '@/views/ExampleDetailPage.vue'
import ErrorPanelDemo from '@/components/ErrorPanelDemo.vue'
import BlankPage from '@/views/BlankPage.vue'
import CesiumExamplesPage from '@/views/CesiumExamplesPage.vue'
import OpenLayersDocsPage from '@/views/OpenLayersDocsPage.vue'
import CesiumDocsPage from '@/views/CesiumDocsPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/examples/:id',
    name: 'ExampleDetail',
    component: ExampleDetailPage
  },
  {
    path: '/demo/error-panel',
    name: 'ErrorPanelDemo',
    component: ErrorPanelDemo
  },
  // Cesium 路由
  {
    path: '/cesium/examples',
    name: 'CesiumExamples',
    component: CesiumExamplesPage
  },
  {
    path: '/cesium/docs',
    name: 'CesiumDocs',
    component: CesiumDocsPage
  },
  // OpenLayers 路由
  {
    path: '/openlayers/examples',
    name: 'OpenLayersExamples',
    component: BlankPage
  },
  {
    path: '/openlayers/docs',
    name: 'OpenLayersDocs',
    component: OpenLayersDocsPage
  },
  // Leaflet 路由
  {
    path: '/leaflet/examples',
    name: 'LeafletExamples',
    component: BlankPage
  },
  {
    path: '/leaflet/docs',
    name: 'LeafletDocs',
    component: BlankPage
  },
  // Three.js 路由
  {
    path: '/three/examples',
    name: 'ThreeExamples',
    component: BlankPage
  },
  {
    path: '/three/docs',
    name: 'ThreeDocs',
    component: BlankPage
  },
  // 社区路由
  {
    path: '/community',
    name: 'Community',
    component: BlankPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router