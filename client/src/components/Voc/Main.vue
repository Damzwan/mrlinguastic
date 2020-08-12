<template>
  <div>
    <div>
      <div class="section">
        <h5 class="center-align hide-on-large-only">🐉 Choose or create a voc list 🐉</h5>
        <h4 class="center-align hide-on-med-and-down">🐉 Choose or create a voc list 🐉</h4>
      </div>

      <div class="fixed-action-btn">
        <router-link to="/vocabulary/create" class="btn-floating btn-large red">
          <i class="large material-icons" style="font-size: 35px;">add</i>
        </router-link>
      </div>

      <!-- use VFOR and a list of voc lists -->
      <div class="row">
        <div class="col l4 m6 s12">
          <Card title="Italian Sample Card" wordAmount="5000" fromLang="belgium" toLang="italy"></Card>
        </div>

        <div class="col l4 m6 s12">
          <Card title="French Card" wordAmount="2000" fromLang="belgium" toLang="france"></Card>
        </div>

        <div class="col l4 m6 s12">
          <Card title="Greek Card" wordAmount="1000" fromLang="greece" toLang="france"></Card>
        </div>

        <div class="col l4 m6 s12">
          <Card title="Greek Card" wordAmount="1000" fromLang="greece" toLang="france"></Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import Card from "./Card.vue";

export default defineComponent({
  components: {
    Card,
  },
  //   setup() {},
});
</script>

<style scoped>
</style>