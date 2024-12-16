import { createRouter, createWebHistory } from 'vue-router'
import DashboardLanding from '@/components/HelloWorld.vue'
import UploadReport from '@/components/UploadReport.vue'
import RequestDetail from '@/components/RequestDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardLanding
  },
  {
    path: '/upload-report',
    name: 'UploadReport',
    component: UploadReport
  },
  {
    path: '/requests/:id',
    name: 'RequestDetail',
    component: RequestDetail,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router