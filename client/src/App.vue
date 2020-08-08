<template>
  <div id="app">
    <div id="nav">
      <Nav></Nav>
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Nav from "./components/Nav.vue";

export default Vue.extend({
  components: {
    Nav,
  },
});
</script>