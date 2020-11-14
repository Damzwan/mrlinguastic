import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import VocSelection from "@/components/voc/VocSelection.vue";

Vue.use(VueRouter)
const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: "Vocabulary",
        component: VocSelection
    },
    {
        path: '/create',
        name: 'Create Voclist',
        component: () => import(/* webpackChunkName: "create" */ /* webpackPrefetch: true */ '@/components/voc/create/Create.vue')
    },
    {
        path: '/exercises',
        name: 'Voc Exercises',
        component: () => import(/* webpackChunkName: "exercise" */ /* webpackPrefetch: true */ '@/components/voc/exercises/Exercises.vue')
    },
    {
        path: '/exercises/standard',
        name: 'Standard Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/Standard.vue')
    },
    {
        path: '/exercises/multiple',
        name: 'Multiple Choice Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/MultipleChoice.vue')
    },
    {
        path: '/exercises/flashcards',
        name: 'Flashcard Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/Flashcard.vue')
    },
    {
        path: '/exercises/list',
        name: 'View Vocabulary List',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/List.vue')
    },
    {
        path: '/exercises/stats',
        name: 'Exercise statistics',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/ExerciseStats.vue')
    },
    {
        path: '/exercises/spaceinvader',
        name: 'Typeracer Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/SpaceInvader.vue')
    },
    {
        path: '/exercises/guess-the-word',
        name: 'Guess The Word Exercise',
        component: () => import(/* webpackChunkName: "exercise" */ '@/components/voc/exercises/GuessTheWord.vue')
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
        component: () => import(/* webpackChunkName: "group" */ '@/components/voc/groups/Group.vue')
    }
]

const router = new VueRouter({
    routes
})

export default router
