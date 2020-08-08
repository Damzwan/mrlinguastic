<template>
  <div>
    <ConfigModal></ConfigModal>
    <!-- <a href="#configuration" class="waves-effect waves-light btn modal-trigger">Yes</a> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";
import ConfigModal from "./ConfigModal.vue";

export default defineComponent({
  components: {
    ConfigModal,
  },
  setup() {
    console.log("fuck");
  },
});
</script>

<style scoped>
</style>