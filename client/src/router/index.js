import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home.vue';
import Vocabulary from "@/components/Vocabulary/Vocabulary.vue"

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: "Test",
            component: Home
        },
        {
            path: '/vocabulary',
            Name: "Test2",
            component: Vocabulary
        }
    ]
})