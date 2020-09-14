<template>
  <div ref="modalElement" class="modal" id="exerciseFinishedModal">
    <div class="modal-content">
      <h4 class="center">🎉 Finished 🎉</h4>
    </div>
    <div class="modal-footer">
      <a class="waves-effect waves-green btn" @click="$emit('continue')">See stats</a>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, ref} from "@vue/composition-api";
import M from "materialize-css"
import Modal = M.Modal;

export default defineComponent({
  setup() {
    const modalElement = ref(null) //The HTML element of the imgModal
    const modal = ref<Modal>(null);

    onMounted(() => {
      modal.value = M.Modal.init(modalElement.value, {inDuration: 500})
    })

    return {modalElement}
  },
});
</script>

<style scoped>
</style>