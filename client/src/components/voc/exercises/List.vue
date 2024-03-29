<template>
  <div>
    <div v-if="list">
      <WordInfoModal v-bind:fromLang="list.settings.langSettings.fromLang" v-bind:word="currWord.from"></WordInfoModal>
      <ExampleModal v-bind:word="currWord"></ExampleModal>

      <table class="centered striped">
        <thead>
        <tr>
          <th style="font-size: 1.5rem">{{getLang(list.settings.langSettings.fromLang)}}</th>
          <th style="font-size: 1.5rem">{{getLang(list.settings.langSettings.toLang)}}</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="(word, i) in list.words" :key="i" @mouseover="currWord = word">
          <td style="font-size: 1.5rem">{{ word.from }}</td>
          <td style="font-size: 1.5rem">{{ word.to }}</td>
          <td style="width: 180px" v-if="!hasSmallScreen()">
            <a href="#exampleModal" class="modal-trigger" style="color: black"><i class="material-icons icon">format_list_numbered</i></a>
            <a href="#infoModal" class="modal-trigger" style="color: black"><i class="material-icons icon left-margin">info_outline</i></a>
            <i class="material-icons icon left-margin unselectable" @click="playAudio()">volume_up</i>
          </td>
          <td v-else style="width: 60px">
            <a class='dropdown-trigger btn-floating' v-bind:data-target="`mobileDrop${i}`"><i
                class='material-icons center'>more_vert</i></a>

            <ul :id="`mobileDrop${i}`" class='dropdown-content' style="min-width: 60px">
              <li><a href="#!" @click="playAudio()"><i class="material-icons">volume_up</i></a></li>
              <li><a href="#infoModal" class="modal-trigger"><i class="material-icons">info_outline</i></a></li>
              <li><a href="#exampleModal" class="modal-trigger"><i class="material-icons">format_list_numbered</i></a>
              </li>
            </ul>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">


import {defineComponent, inject, onUnmounted, onUpdated, ref} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";
import {Voclist, Word} from "@/gen-types";
import {getLang, isOfflineList} from "@/use/general";
import M from "materialize-css"
import Dropdown = M.Dropdown;

export default defineComponent({
  components: {
    WordInfoModal: () => import(/* webpackPrefetch: true */ '@/components/voc/exercises/WordInfoModal.vue'),
    ExampleModal: () => import(/* webpackPrefetch: true */ '@/components/voc/exercises/ExampleModal.vue')
  },
  setup() {
    const db = inject<Localdb>("db");
    const list = ref<Voclist>(null);
    const currWord = ref<Word>(null);
    const audio = new Audio();

    const dropdowns = ref<Dropdown[]>(null);

    function exerciseSetup(providedList: Voclist) {
      list.value = providedList;
      currWord.value = list.value.words[0];
    }

    function restoreWords() {
      if (isOfflineList()) db.getItem<Voclist>(localStorage.getItem("_id"), "downloadedVoclists").then(nlist => exerciseSetup(nlist))
      else db.getItem<Voclist>(localStorage.getItem("_id"), "voclists").then(nlist => exerciseSetup(nlist))
    }

    function playAudio() {
      audio.src = currWord.value.toAudio;
      audio.play()
    }

    function hasSmallScreen() {
      return window.screen.width <= 600
    }

    if (localStorage.getItem("_id")) restoreWords();

    onUpdated(() => {
      dropdowns.value = M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'));
    })

    onUnmounted(() => {
      dropdowns.value.forEach(dropdown => dropdown.destroy())
    })

    return {list, currWord, playAudio, hasSmallScreen, getLang}
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