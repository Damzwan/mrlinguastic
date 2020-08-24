<template>
  <div id="app">
    <Nav></Nav>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Nav from "./components/Nav.vue";
import {provideDb} from "@/use/localdb";

export default Vue.extend({
  components: {
    Nav,
  },
  setup() {
    provideDb();
  }
});
</script>