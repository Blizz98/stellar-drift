import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',           name: 'bridge',     component: () => import('@/views/BridgeView.vue') },
  { path: '/expedition', name: 'expedition', component: () => import('@/views/ExpeditionView.vue') },
  { path: '/habits',     name: 'habits',     component: () => import('@/views/HabitsView.vue') },
  { path: '/captain',    name: 'captain',    component: () => import('@/views/CaptainView.vue') },
  { path: '/log',        name: 'log',        component: () => import('@/views/LogView.vue') },
  { path: '/launch',     name: 'launch',     component: () => import('@/views/LaunchView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
