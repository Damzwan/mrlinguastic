import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import HelloWorld from "@/components/HelloWorld.vue";
import VocCreate from '../components/Voc/Create.vue'
import Exercises from '../components/Voc/Exercises/Exercises.vue'
import TextStandard from '../components/Voc/Exercises/TextStandard.vue'
import ExerciseStats from '../components/Voc/Exercises/ExerciseStats.vue'
import TextMultiple from '../components/Voc/Exercises/TextMultiple.vue'


Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        component: HelloWorld
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
    {
        path: '/vocabulary/exercises',
        name: 'Voc Exercises',
        component: Exercises
    },
    {
        path: '/vocabulary/exercises/text-standard',
        name: 'Standard Text Exercise',
        component: TextStandard
    },
    {
        path: '/vocabulary/exercises/text-multiple',
        name: 'Standard Text Multiple Choice',
        component: TextMultiple
    },
    {
        path: '/vocabulary/exercises/stats',
        name: 'Exercise stats',
        component: ExerciseStats
    },
]

const router = new VueRouter({
    routes
})

export default router
