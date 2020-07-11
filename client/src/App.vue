<template>
  <div id="app">
    <Nav></Nav>
    <router-view></router-view>
  </div>
</template>

<script>
import Nav from "./components/Nav";
// import io from "socket.io-client";
// var socket = io.connect("http://localhost:3000");
// console.log(socket)

export default {
  name: "App",
  components: {
    Nav
  }
};
</script>

<style>
</style>
