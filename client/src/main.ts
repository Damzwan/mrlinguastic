import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'
import {provide} from '@vue/composition-api'
import {DefaultApolloClient} from '@vue/apollo-composable'
import "./assets/global.css"

import 'materialize-css/dist/css/materialize.min.css'
import 'material-design-icons/iconfont/material-icons.css'
import {directive as onClickaway} from "vue-clickaway";
import {InMemoryCache} from 'apollo-cache-inmemory'

import {provideDb, retrieveDb} from "@/use/localdb";
import {AuthModule} from "@/use/authModule";

Vue.config.productionTip = false

const apolloClient = new ApolloClient({
    uri: 'http://localhost:4000/graphql', //TODO update in production
    cache: new InMemoryCache({
        addTypename: false
    })
})

//define the directives we use
Vue.directive("onClickaway", onClickaway) // directive that will detect when a click has occurred outside of a component

//directive to instantly focus on an input as soon at is created
Vue.directive('insta-focus', {
    inserted: function (el, binding, vnode) {
        if (el.id[0] == "0") return; //TODO hack so that we don't focus on the first element of an array xd
        Vue.nextTick(function () {
            el.focus()
        })
    }
})

Vue.use(VueApollo)
Vue.prototype.$apiURI = "/api";

// Vue.use(msal, msalConfig);

new Vue({
    router,
    setup(props, context) {
        provideDb() //TODO give it a normal name instead of creating a symbol
        provide("auth", new AuthModule());
        provide(DefaultApolloClient, apolloClient)
    },
    render: h => h(App)
}).$mount('#app')
