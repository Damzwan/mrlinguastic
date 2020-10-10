import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import Main from "@/components/Voc/Main.vue";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: "Vocabulary",
        component: Main
    },
    {
        path: '/create',
        name: 'Create Voclist',
        component: () => import(/* webpackChunkName: "create" */ '@/components/Voc/Create.vue')
    },
    {
        path: '/exercises',
        name: 'Voc Exercises',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/Voc/Exercises/Exercises.vue')
    },
    {
        path: '/exercises/standard',
        name: 'Standard Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/Voc/Exercises/Standard.vue')
    },
    {
        path: '/exercises/multiple',
        name: 'Multiple Choice Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/Voc/Exercises/MultipleChoice.vue')
    },
    {
        path: '/exercises/flashcards',
        name: 'Flashcard Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/Voc/Exercises/Flashcard.vue')
    },
    {
        path: '/exercises/list',
        name: 'View Vocabulary List',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/Voc/Exercises/List.vue')
    },
    {
        path: '/exercises/stats',
        name: 'Exercise statistics',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/Voc/Exercises/ExerciseStats.vue')
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/components/About.vue')
    },
    {
        path: '/donate',
        name: 'Donate',
        component: () => import(/* webpackChunkName: "donate" */ '@/components/Donate.vue')
    },
    {
        path: '/group',
        name: 'View Groups',
        component: () => import(/* webpackChunkName: "group" */ '@/components/Voc/Group.vue')
    }
]

const router = new VueRouter({
    routes
})

export default router
