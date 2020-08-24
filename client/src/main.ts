import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'
import { provide } from '@vue/composition-api'
import { DefaultApolloClient } from '@vue/apollo-composable'
import "./assets/global.css"

import 'materialize-css/dist/css/materialize.min.css'
import 'material-design-icons/iconfont/material-icons.css'
import { directive as onClickaway } from "vue-clickaway";

Vue.config.productionTip = false

const apolloClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql', //TODO update in production
})

//define the directives we use
Vue.directive("onClickaway", onClickaway) // directive that will detect when a click has occurred outside of a component

//directive to instantly focus on an input as soon at is created
Vue.directive('insta-focus', {
  inserted: function (el, binding, vnode) {
    if (el.id[0] == "0") return; //TODO hack so that we don't focus on the first element of an array xd
    Vue.nextTick(function() {
      el.focus()
    })
  }
})

Vue.use(VueApollo)
Vue.prototype.$apiURI = "/api";

new Vue({
  router,
  setup() { provide(DefaultApolloClient, apolloClient) },
  render: h => h(App)
}).$mount('#app')
