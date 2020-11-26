<template>
  <div>
    <ExerciseFinished v-on:continue="$router.push('stats')"></ExerciseFinished>
    <a href="#exerciseFinishedModal" class="modal-trigger" ref="finishBtn"></a>

    <div class="row" v-if="list">
      <WordInfoModal v-bind:word="state.currentWord.from" v-bind:from-lang="list.settings.langSettings.fromLang"></WordInfoModal>
      <div class="col offset-m2 m8 s12 offset-l4 l4">
        <h5 id="wordsLeft" style="text-align: center;">Words left: {{ list.words.length }}</h5>

        <div class="input-field">
          <div v-if="type === 'text'">
            <input disabled type="text" class="validate" style="text-align: center; font-size: 20px;"
                   v-model="state.currentWord.from">
            <img role="img"
                 :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.fromLang)}.svg`)"
                 class="flag-icon" alt="From Flag"/>
          </div>

          <div v-if="type === 'image'" class="dynamicDiv">
            <img :src="!isOfflineList() ? getBlobUrl(state.currentWord.img) : state.currentWord.img" alt="no img???" class="centered-img dynamicImg"
                 style="max-width: 80%;">
          </div>

        </div>

        <a class='modal-trigger btn' href="#infoModal" v-if="type === 'text'"><i class="material-icons right">info</i>Info</a>
      </div>

    </div>

    <Loader v-else></Loader>

    <div style="position: relative; width: 100%;" :class="{'vspace': type === 'image', 'vspace-large': type === 'text'}">
      <div class="row unselectable" v-for="(option, index) in state.options" :key="index" @click="checkWord(option.to)">
        <div class="col s11 l10 parallelogram" v-bind:style="{'background-color': optionColors[index]}">
          <p style="color: white; font-size: 3vh">{{ option.to }}</p>
        </div>
        <div class="col l2 hide-on-med-and-down">
          <i class="material-icons" style="font-size: 10vh; color: lightgray">{{arrows[index]}}</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onUnmounted, reactive, ref} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";
import {Voclist, Word} from "@/gen-types";
import {correctMessage, getBlobUrl, getCountry, isOfflineList, removeAllToasts, wrongMessage} from "@/use/general";
import ExerciseFinished from "@/components/voc/exercises/ExerciseFinished.vue";
import WordInfoModal from "@/components/voc/exercises/WordInfoModal.vue";
import Loader from "@/components/Loader.vue"

//used to make use of typescript typing
interface State {
  restored: boolean;
  currentWord: Word;
  options: Word[];
}

export default defineComponent({
  components: {
    ExerciseFinished,
    WordInfoModal,
    Loader
  },
  setup() {

    const list = ref<Voclist>(null);
    const categorizedFailedAttempts: { [word: string]: string[] } = {};

    const finishBtn = ref<HTMLLinkElement>(null);

    let wordsCopy: Word[];
    let mistakes = 0;
    let startTime: Date;

    const optionColors = ["#ffc107", "#8b0000", "#006400", "#00008B"];
    const arrows = ["arrow_upward", "arrow_back", "arrow_forward", "arrow_downward"]

    const type = localStorage.getItem("exerciseType");
    const body: HTMLElement = ref(null);

    const state = reactive<State>({
      restored: false,
      currentWord: null,
      options: []
    })

    const db = inject<Localdb>("db");

    function end() {
      finishBtn.value.click();
      localStorage.setItem("failedAttempts", JSON.stringify(categorizedFailedAttempts));
      localStorage.setItem("duration", (Math.ceil((new Date().getTime() - startTime.getTime()) / 60000)).toString())
      localStorage.setItem("wordAmount", wordsCopy.length.toString())
      localStorage.setItem("mistakes", mistakes.toString())
    }

    function setNextWord() {
      state.currentWord = list.value.words[Math.floor(Math.random() * list.value.words.length)];
    }

    function getRandomWord() {
      return wordsCopy[Math.floor(Math.random() * wordsCopy.length)];
    }

    function shuffle(array) {
      let currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }

    function fillOptions() {
      const words: Word[] = []
      words.push(state.currentWord);
      for (let i = 0; i < 3; i++) {
        let word = getRandomWord()
        while (words.includes(word)) word = getRandomWord();
        words.push(word)
      }
      state.options = shuffle(words);
    }

    function exerciseSetup(providedList: Voclist) {
      list.value = providedList;
      if (type === "image") list.value.words = list.value.words.filter(word => word.img);
      wordsCopy = list.value.words.map(word => word);
      setNextWord();
      fillOptions();
      state.restored = true;
    }

    function restoreWords() {
      if (isOfflineList()) db.getItem<Voclist>(localStorage.getItem("_id"), "downloadedVoclists").then(nlist => exerciseSetup(nlist))
      else db.getItem<Voclist>(localStorage.getItem("_id"), "voclists").then(nlist => exerciseSetup(nlist))
    }

    if (localStorage.getItem("_id")) restoreWords();


    function checkWord(attempt: string) {
      if (!startTime) startTime = new Date();

      removeAllToasts();
      if (attempt === state.currentWord.to) {
        correctMessage("Correct! 🤓")
        list.value.words.splice(list.value.words.indexOf(state.currentWord), 1);
        if (list.value.words.length === 0) {
          end();
          return
        }
      } else {
        wrongMessage("😂😂 Wrong! 😂😂")
        window.navigator.vibrate(200);

        const key = state.currentWord.from + "-" + state.currentWord.to;
        const failures = categorizedFailedAttempts[key] ? categorizedFailedAttempts[key] : [];
        failures.push(attempt);
        categorizedFailedAttempts[key] = failures;
        mistakes++;
      }

      setNextWord();
      fillOptions();
    }

    function handleKeyup(e: any){
      if (state.options.length == 0) return;
      if (e.key == "ArrowUp") checkWord(state.options[0].to)
      else if (e.key == "ArrowLeft") checkWord(state.options[1].to)
      else if (e.key == "ArrowRight") checkWord(state.options[2].to)
      else if (e.key == "ArrowDown") checkWord(state.options[3].to)
    }

    document.addEventListener("keyup", handleKeyup)

    onUnmounted(() => {
      document.removeEventListener("keyup", handleKeyup);
    })

    return {list, state, getCountry, checkWord, finishBtn, optionColors, arrows, type, getBlobUrl, isOfflineList}

  },
});
</script>

<style scoped>
.parallelogram {
  clip-path: polygon(0 0, 100% 0%, 96% 100%, 0% 100%);
}

@media only screen and (max-width: 600px) {
  .dynamicDiv {
    height: 200px;
  }

  .dynamicImg {
    max-height: 200px;
  }
}

@media only screen and (min-width: 601px) {
  .dynamicDiv {
    height: 250px;
  }

  .dynamicImg {
    max-height: 250px;
  }
}
</style>