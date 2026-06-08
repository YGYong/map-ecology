import { createRouter, createWebHashHistory } from 'vue-router'

const HomePage = () => import('@/views/HomePage.vue')
const ExampleDetailPage = () => import('@/views/ExampleDetailPage.vue')
const ErrorPanelDemo = () => import('@/components/ErrorPanelDemo.vue')
const BlankPage = () => import('@/views/BlankPage.vue')
const CesiumExamplesPage = () => import('@/views/CesiumExamplesPage.vue')
const LeafletExamplesPage = () => import('@/views/LeafletExamplesPage.vue')
const OpenLayersExamplesPage = () => import('@/views/OpenLayersExamplesPage.vue')
const OpenLayersDocsPage = () => import('@/views/OpenLayersDocsPage.vue')
const CesiumDocsPage = () => import('@/views/CesiumDocsPage.vue')
const NotFoundPage = () => import('@/views/NotFoundPage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/examples/:id',
    redirect: (to) => `/examples/cesium/${to.params.id}`
  },
  {
    path: '/examples/:engine/:id',
    name: 'ExampleDetail',
    component: ExampleDetailPage,
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
    component: OpenLayersExamplesPage
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
    component: LeafletExamplesPage
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
  },
  // 404 页面配置
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
