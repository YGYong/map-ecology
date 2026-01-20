import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ExampleDetailPage from '@/views/ExampleDetailPage.vue'
import ErrorPanelDemo from '@/components/ErrorPanelDemo.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router