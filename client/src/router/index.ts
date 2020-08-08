import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import VocCreate from '../components/Voc/Create.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/vocabulary',
    name: "Vocabulary",
    component: () => import(/* webpackChunkName: "about" */ '../components/Voc/Main.vue')
  },
  {
    path: '/vocabulary/create',
    name: 'Create Voc',
    component: VocCreate
  },

]

const router = new VueRouter({
  routes
})

export default router
