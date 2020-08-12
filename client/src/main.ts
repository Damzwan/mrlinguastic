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
  uri: 'http://localhost:4000/graphql',
})

Vue.directive("onClickaway", onClickaway)

Vue.use(VueApollo)
new Vue({
  router,
  setup() { provide(DefaultApolloClient, apolloClient) },
  render: h => h(App)
}).$mount('#app')
