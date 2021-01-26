import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import VocSelection from "@/components/voc/VocSelection.vue";
import Promo from "@/components/Promo.vue";

Vue.use(VueRouter)
const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Promo Page',
        component: Promo
    },
    {
        path: '/home',
        name: "Home",
        component: VocSelection
    },
    {
        path: '/home/create',
        name: 'Create vocabulary list',
        component: () => import(/* webpackChunkName: "create" */ /* webpackPrefetch: true */ '@/components/voc/create/Create.vue')
    },
    {
        path: '/home/exercises',
        name: 'Exercises Menu',
        component: () => import(/* webpackChunkName: "exercise" */ /* webpackPrefetch: true */ '@/components/voc/exercises/Exercises.vue')
    },
    {
        path: '/home/exercises/standard',
        name: 'Standard Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/Standard.vue')
    },
    {
        path: '/home/exercises/multiple',
        name: 'Multiple Choice Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/MultipleChoice.vue')
    },
    {
        path: '/home/exercises/flashcards',
        name: 'Flashcard Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/Flashcard.vue')
    },
    {
        path: '/home/exercises/list',
        name: 'View Vocabulary List',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/List.vue')
    },
    {
        path: '/home/exercises/stats',
        name: 'Exercise statistics',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/ExerciseStats.vue')
    },
    {
        path: '/home/exercises/spaceinvader',
        name: 'SpaceInvader Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/SpaceInvader.vue')
    },
    {
        path: '/home/exercises/guess-the-word',
        name: 'Guess The Word Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/GuessTheWord.vue')
    },
    {
        path: '/home/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '@/components/About.vue')
    },
    {
        path: '/home/donate',
        name: 'Donate',
        component: () => import(/* webpackChunkName: "donate" */ '@/components/Donate.vue')
    },
    {
        path: '/home/group',
        name: 'Groups',
        component: () => import(/* webpackChunkName: "group" */ '@/components/voc/groups/Group.vue')
    }
]

const router = new VueRouter({
    routes
})

export default router
