<template>
  <div>
    <ExerciseFinished v-on:continue="$router.push('stats')"></ExerciseFinished>
    <a href="#exerciseFinishedModal" class="modal-trigger" ref="finishBtn"></a>

    <div class="row" v-if="list">
      <WordInfoModal v-bind:word="state.currentWord.from"
                     v-bind:from-lang="list.settings.langSettings.fromLang"></WordInfoModal>

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
          <div v-if="type === 'audio'">
            <i class="material-icons centered-img unselectable center" style="font-size: 100px" @click="playAudio">volume_up</i>
          </div>
        </div>

        <div class="input-field">
          <input placeholder="Translation..." type="text" class="validate"
                 style="text-align: center; font-size: 20px;" ref="to" v-model="state.to" v-on:keyup.enter="checkWord">
          <img role="img"
               :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.toLang)}.svg`)"
               class="flag-icon" alt="From Flag"/>
        </div>

        <button class="waves-effect waves-light btn" style="margin-right: 10px" @click="checkWord">check</button>
        <button class='waves-effect waves-light btn' style="margin-right: 10px" @click="getHint">Hint</button>
        <a class='modal-trigger btn' href="#infoModal" v-if="type === 'text'"><i class="material-icons right">info</i>Info</a>
      </div>

      <div class="col s12" style="margin-top: 20px; padding: 0">
        <div style="border: 1px solid;display: flex;">
          <table class="centered">
            <thead>
            <tr>
              <th>Word</th>
              <th>Attempt</th>
              <th>Translation</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(failedAttempt, index) in failedAttempts.slice().reverse()" :key="index">
              <td>{{ failedAttempt.from }}</td>
              <td>{{ failedAttempt.attempt }}</td>
              <td v-if="failedAttempt.from !== state.currentWord.from">{{ failedAttempt.to }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
    <div v-else style="margin-top: 100px">
      <div class="preloader-wrapper big active centered-img">
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
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, reactive, ref} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";
import {Voclist, Word} from "@/gen-types";
import {getCountry} from "@/use/general";
import {cleanWord, isOfflineList} from "@/use/general";
import {correctMessage, wrongMessage} from "@/use/general";
import ExerciseFinished from "@/components/voc/exercises/ExerciseFinished.vue";
import WordInfoModal from "@/components/voc/exercises/WordInfoModal.vue";
import {getBlobUrl} from "@/use/general";

//used to make use of typescript typing
interface State {
  to: string; //word that is typed by the users in the second input
  restored: boolean;
  currentWord: Word;
}

export interface FailedAttempt {
  from: string;
  attempt: string;
  to: string;
}

export default defineComponent({
  components: {
    ExerciseFinished,
    WordInfoModal
  },
  setup() {

    const type = localStorage.getItem("exerciseType");
    const list = ref<Voclist>(null);
    const failedAttempts = ref<FailedAttempt[]>([]);
    const categorizedFailedAttempts: { [word: string]: string[] } = {};

    const to = ref<HTMLInputElement>(null);
    const finishBtn = ref<HTMLLinkElement>(null);

    const audio = new Audio();

    let wordAmount;
    let mistakes = 0;
    let startTime: Date;

    //let totalsHintsUsed = 0;
    let hintCounter = 1;

    const state = reactive<State>({
      to: "",
      restored: false,
      currentWord: null
    })

    const db = inject<Localdb>("db");

    function end() {
      finishBtn.value.click();
      localStorage.setItem("failedAttempts", JSON.stringify(categorizedFailedAttempts));
      localStorage.setItem("duration", (Math.ceil((new Date().getTime() - startTime.getTime()) / 60000)).toString())
      localStorage.setItem("wordAmount", wordAmount.toString())
      localStorage.setItem("mistakes", mistakes.toString())
    }

    function setNextWord() {
      state.currentWord = list.value.words[Math.floor(Math.random() * list.value.words.length)];
    }

    function exerciseSetup(providedList: Voclist) {
      list.value = providedList
      if (type === "image") list.value.words = list.value.words.filter(word => word.img);
      wordAmount = list.value.words.length;
      setNextWord();
      audio.src = state.currentWord.toAudio;
      state.restored = true;
    }

    function restoreWords() {
      if (isOfflineList()) db.getItem<Voclist>(localStorage.getItem("_id"), "downloadedVoclists").then(nlist => exerciseSetup(nlist))
      else db.getItem<Voclist>(localStorage.getItem("_id"), "voclists").then(nlist => exerciseSetup(nlist))
    }

    if (localStorage.getItem("_id")) restoreWords();

    function getHint() {
      state.to = state.currentWord.to.substring(0, Math.ceil(hintCounter * state.currentWord.to.length / 3));
      if (hintCounter < 3) {
        hintCounter++;
        //totalsHintsUsed++;
      }
    }

    function handleCorrectAnswer() {
      to.value.classList.remove("invalid");
      to.value.classList.add("valid");
      correctMessage("Correct! 🤓")

      hintCounter = 1;
      list.value.words.splice(list.value.words.indexOf(state.currentWord), 1);
    }

    function handleWrongAnswer(attempt: string) {
      to.value.classList.remove("valid");
      to.value.classList.add("invalid");
      wrongMessage("😂😂 Wrong! 😂😂")

      failedAttempts.value.push({from: state.currentWord.from, attempt: attempt, to: state.currentWord.to});

      const key = state.currentWord.from + "-" + state.currentWord.to;
      const failures = categorizedFailedAttempts[key] ? categorizedFailedAttempts[key] : [];
      failures.push(attempt);
      categorizedFailedAttempts[key] = failures;
      mistakes++;

    }

    function checkWord() {
      if (!startTime) startTime = new Date();
      const attempt = cleanWord(state.to);

      if (attempt === state.currentWord.to) handleCorrectAnswer()
      else handleWrongAnswer(attempt);

      if (list.value.words.length === 0) {
        end();
        return;
      }

      state.to = "";
      setNextWord();

      if (type === "audio") {
        audio.src = state.currentWord.toAudio;
        audio.play();
      }
    }

    function playAudio() {
      audio.play();
    }

    return {list, state, to, getCountry, checkWord, getHint, failedAttempts, finishBtn, type, getBlobUrl, playAudio, isOfflineList}

  },
});
</script>

<style scoped>
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