import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

import ApolloClient from 'apollo-boost'
import VueCompositionAPI, {provide} from '@vue/composition-api'
import {DefaultApolloClient} from '@vue/apollo-composable'
import "./global.css"

import 'materialize-css/dist/css/materialize.min.css'
import 'material-design-icons/iconfont/material-icons.css'
import {directive as onClickaway} from "vue-clickaway";
import {InMemoryCache} from 'apollo-cache-inmemory'

Vue.config.productionTip = false

const serverUri = 'https://775d6757849c.ngrok.io'; //TODO update in production

const apolloClient = new ApolloClient({
    uri: serverUri + '/graphql',
    cache: new InMemoryCache({
        addTypename: false
    })
})

//define the directives we use
Vue.directive("onClickaway", onClickaway) // directive that will detect when a click has occurred outside of a component

//directive to instantly focus on an input as soon at is created
Vue.directive('insta-focus', {
    inserted: function (el) {
        if (el.id[0] == "0") return; //TODO hack so that we don't focus on the first element of an array xd
        Vue.nextTick(function () {
            el.focus()
        })
    }
})

Vue.use(VueCompositionAPI);

new Vue({
    router,
    setup() {
        provide("serverUri", serverUri);
        provide(DefaultApolloClient, apolloClient)
    },
    render: h => h(App)
}).$mount('#app')
