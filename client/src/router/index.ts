import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import VocCreate from '../components/Voc/Create.vue'
import Exercises from '../components/Voc/Exercises/Exercises.vue'
import Standard from '../components/Voc/Exercises/Standard.vue'
import ExerciseStats from '../components/Voc/Exercises/ExerciseStats.vue'
import MultipleChoice from '../components/Voc/Exercises/MultipleChoice.vue'
import Flashcard from '../components/Voc/Exercises/Flashcard.vue'
import List from '../components/Voc/Exercises/List.vue'
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
        component: VocCreate
    },
    {
        path: '/exercises',
        name: 'Voc Exercises',
        component: Exercises
    },
    {
        path: '/exercises/standard',
        name: 'Standard Exercise',
        component: Standard
    },
    {
        path: '/exercises/multiple',
        name: 'Multiple Choice Exercise',
        component: MultipleChoice
    },
    {
        path: '/exercises/flashcards',
        name: 'Flashcard Exercise',
        component: Flashcard
    },
    {
        path: '/exercises/list',
        name: 'View Vocabulary List',
        component: List
    },
    {
        path: '/exercises/stats',
        name: 'Exercise statistics',
        component: ExerciseStats
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
]

const router = new VueRouter({
    routes
})

export default router
