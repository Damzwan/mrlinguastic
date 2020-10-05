import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import HelloWorld from "@/components/HelloWorld.vue";
import VocCreate from '../components/Voc/Create.vue'
import Exercises from '../components/Voc/Exercises/Exercises.vue'
import Standard from '../components/Voc/Exercises/Standard.vue'
import ExerciseStats from '../components/Voc/Exercises/ExerciseStats.vue'
import MultipleChoice from '../components/Voc/Exercises/MultipleChoice.vue'
import Flashcard from '../components/Voc/Exercises/Flashcard.vue'
import List from '../components/Voc/Exercises/List.vue'

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
        path: '/vocabulary/exercises/standard',
        name: 'Standard Exercise',
        component: Standard
    },
    {
        path: '/vocabulary/exercises/multiple',
        name: 'Multiple Choice Exercise',
        component: MultipleChoice
    },
    {
        path: '/vocabulary/exercises/flashcards',
        name: 'Flashcards',
        component: Flashcard
    },
    {
        path: '/vocabulary/exercises/list',
        name: 'View List',
        component: List
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
