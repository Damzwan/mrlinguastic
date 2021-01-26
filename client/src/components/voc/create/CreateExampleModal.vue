<template>
  <div class="modal fullscreen-modal" ref="modalElement" id="exampleModal"  :style="{backgroundImage: 'url(' + require('../../../assets/triangle2.svg') + ')'}">
    <div class="modal-content" v-if="selectedWord">
      <i class="material-icons right unselectable close-btn modal-close">close</i>
      <h4 class="center">Example sentences</h4>
      <p class="flow-text center">Create a sentence with <b>{{ selectedWord.from }}</b> in the first text box
        and create sentences with <b>{{ selectedWord.to }}</b> in the boxes below</p>
      <div class="divider" style="margin-bottom: 20px"></div>
      <ExampleDiv v-for="(sentence, index) in selectedWord.sentences" :key="index"
                  v-model="selectedWord.sentences[index]" v-on:removeSentence="removeSentence"
                  v-bind:fromWord="selectedWord.from" v-bind:toWord="selectedWord.to"></ExampleDiv>
      <div class="row">
        <div class="col s12 valign-wrapper">
          <i class="material-icons centered-img unselectable" style="font-size: 50px; color: black"
             @click="addSentence">add</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, ref,} from "@vue/composition-api";
import {Sentence, Word} from "@/gen-types";
import M from "materialize-css"
import ExampleDiv from "@/components/voc/create/ExampleDiv.vue"
import Modal = M.Modal;
import {setShouldCloseWordDiv} from "@/use/state";

export default defineComponent({
  props: {
    selectedWord: Object() as () => Word,
  },
  components: {
    ExampleDiv
  },
  setup(props) {

    const modalElement = ref<HTMLElement>(null)
    const modal = ref<Modal>(null);

    function addSentence() {
      props.selectedWord.sentences.push({from: "", to: [""]})
    }

    //called when the users click on the remove button of an exampleItem component
    function removeSentence(sentenceToRemove: Sentence) {
      props.selectedWord.sentences = props.selectedWord.sentences.filter(sentence => sentence != sentenceToRemove)
    }

    function enableCloseDiv(){
      setShouldCloseWordDiv(true);
    }

    onMounted(() => {
      modal.value = M.Modal.init(modalElement.value, {onCloseEnd: enableCloseDiv})
    })

    onUnmounted(() => {
      modal.value.destroy();
    })

    return {addSentence, removeSentence, modalElement}
  }
});
</script>

<style scoped>

.divider {
  background-color: black;
}

</style>