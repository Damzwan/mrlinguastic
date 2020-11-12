<template>
  <div ref="modalElement" class="modal" id="infoModal">
    <div class="modal-content">
      <h4 class="center"><b>{{ word }}</b></h4>
      <div class="divider"></div>

      <div v-if="wordInfo">
        <div v-for="(option, i) in wordInfo" :key="i">
          <div v-for="(meaning, j) in option.meanings" :key="j">
            <p><b>type: </b> {{ meaning.partOfSpeech }}</p>
            <div v-for="(definition, k) in meaning.definitions" :key="k">
              <p><b>definition {{ k + 1 }} : </b> {{ definition.definition }}</p>
              <p v-if="definition.example"><b>example: </b> {{ definition.example }}</p>
              <p v-if="definition.synonyms"><b>synonyms:</b> {{ definition.synonyms.toString() }}</p>
            </div>
            <div class="black-divider"></div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="preloader-wrapper fat active centered-img" style="margin-top: 20px">
          <div class="spinner-layer spinner-blue-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div>
            <div class="gap-patch">
              <div class="circle"></div>
            </div>
            <div class="circle-clipper right">
              <div class="circle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, ref} from "@vue/composition-api";
import M from "materialize-css"
import Modal = M.Modal;
import {wrongMessage} from "@/use/general";

export interface InfoOption {
  word: string;
  phonetics: string[];
  meanings: Meaning[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

export interface Definition {
  definition: string;
  example: string;
  synonyms: string[];
}

export default defineComponent({
  props: {
    word: String,
    fromLang: String
  },
  setup(props) {
    const modalElement = ref(null) //The HTML element of the imgModal
    const modal = ref<Modal>(null);

    const wordInfo = ref<InfoOption[]>(null);

    async function findWordInfo() {
      if (!navigator.onLine){
        modal.value.close();
        wrongMessage("must be online to find word information");
        return;
      }

      wordInfo.value = null;
      const url = `https://api.dictionaryapi.dev/api/v2/entries/${props.fromLang}/${props.word}`;

      wordInfo.value = await new Promise(resolve => {
        fetch(url).then(data => data.json().then(res => resolve(res)))
      })

    }

    onMounted(() => {
      modal.value = M.Modal.init(modalElement.value, {onOpenStart: findWordInfo})
    })

    return {modalElement, wordInfo}
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