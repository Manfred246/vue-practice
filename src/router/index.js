import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdvancedView from '../views/AdvancedView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/advanced',
    name: 'advanced',
    component: AdvancedView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router