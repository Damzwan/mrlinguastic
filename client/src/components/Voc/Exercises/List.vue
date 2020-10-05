<template>
  <div>
    <div v-if="list">
      <WordInfoModal v-bind:fromLang="list.settings.langSettings.fromLang" v-bind:word="currWord.from"></WordInfoModal>
      <ExampleModal v-bind:word="currWord"></ExampleModal>

      <table class="centered striped">
        <thead>
        <tr>
          <th>From</th>
          <th>To</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="(word, i) in list.words" :key="i" @mouseover="currWord = word">
          <td>{{ word.from }}</td>
          <td>{{ word.to }}</td>
          <td style="width: 180px" v-if="!hasSmallScreen()">
            <a href="#exampleModal" class="modal-trigger" style="color: black"><i class="material-icons icon">format_list_numbered</i></a>
            <a href="#infoModal" class="modal-trigger" style="color: black"><i class="material-icons icon left-margin">info_outline</i></a>
            <i class="material-icons icon left-margin unselectable" @click="playAudio()">volume_up</i>
          </td>
          <td v-else style="width: 60px">
            <a class='dropdown-trigger btn-floating' v-bind:data-target="`mobileDrop${i}`"><i class='material-icons center'>more_vert</i></a>

            <ul :id="`mobileDrop${i}`" class='dropdown-content' style="min-width: 60px">
              <li><a href="#!" @click="playAudio()"><i class="material-icons">volume_up</i></a></li>
              <li><a href="#infoModal" class="modal-trigger"><i class="material-icons">info_outline</i></a></li>
              <li><a href="#exampleModal" class="modal-trigger"><i class="material-icons">format_list_numbered</i></a></li>
            </ul>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">


import WordInfoModal from "./WordInfoModal.vue";
import {defineComponent, inject, onMounted, onUpdated, reactive, ref} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";
import {Voclist, Word} from "@/gen-types";
import {isOfflineList} from "@/use/voc";
import ExampleModal from "@/components/Voc/Exercises/ExampleModal.vue";
import M from "materialize-css"

export default defineComponent({
  components: {
    WordInfoModal,
    ExampleModal
  },
  setup() {
    const db = inject<Localdb>("db");
    const list = ref<Voclist>(null);
    const currWord = ref<Word>(null);
    const audio = new Audio();

    function exerciseSetup(providedList: Voclist) {
      list.value = providedList;
      currWord.value = list.value.words[0];
    }

    function restoreWords() {
      if (isOfflineList()) db.getItem<Voclist>(localStorage.getItem("_id"), "downloadedVoclists").then(nlist => exerciseSetup(nlist))
      else db.getItem<Voclist>(localStorage.getItem("_id"), "voclists").then(nlist => exerciseSetup(nlist))
    }

    function playAudio(){
      audio.src = currWord.value.toAudio;
      audio.play()
    }

    function hasSmallScreen(){
      return window.screen.width <= 600
    }

    if (localStorage.getItem("_id")) restoreWords();

    onUpdated(() => {
      M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'));
    })

    return {list, currWord, playAudio, hasSmallScreen}
  },
});
</script>

<style scoped>
.icon {
  font-size: 35px;
}

.left-margin {
  margin-left: 20px;
}
</style>