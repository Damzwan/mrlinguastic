<template>
  <div ref="modalElement" class="modal" id="exampleModal">
    <div class="modal-content">
      <h4 class="center">Example sentences for <b>{{ word.from }}</b></h4>
      <div class="divider"></div>
      <div v-for="(sentence, i) in word.sentences" :key="i">
        <div v-if="sentence.from !== ''">
          <p><b>Sentence:</b> {{ sentence.from }}</p>
          <p v-for="(toSentence, j) in sentence.to" :key="toSentence"><b>Translation {{ j + 1 }}:</b> {{ toSentence }}
          </p>
          <div class="divider black"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "@vue/composition-api";
import M from "materialize-css"
import Modal = M.Modal;
import {Word} from "@/gen-types";

export default defineComponent({
  props: {
    word: Object as () => Word
  },
  setup(props) {
    const modalElement = ref(null)
    const modal = ref<Modal>(null);

    onMounted(() => {
      modal.value = M.Modal.init(modalElement.value)
    })

    return {modalElement}
  },
});
</script>

<style scoped>

.black-divider {
  height: 1px;
  color: black;
  width: 100%;
  background-color: black;
  left: -50%;
}
</style>