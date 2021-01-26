<template>
  <div>
    <div class="row" v-if="state.restored">
      <div class="col offset-m1 10 s12 offset-l1 l10">
        <h5 id="wordsLeft" style="text-align: center;">Words left: {{ currEntries.length }}</h5>

        <div class="input-field">
          <textarea disabled type="text " class="materialize-textarea" style="text-align: center;"
                    ref="userInput" :value="state.currEntry.definition"></textarea>
        </div>
      </div>
    </div>

    <Loader v-else></Loader>

    <div>
      <div class="row unselectable" v-for="(option, index) in state.options" :key="index" @click="checkWord(option)">
        <div class="col s11 l10 parallelogram" v-bind:style="{'background-color': optionColors[index]}">
          <p style="color: white; font-size: 3vh">{{ option }}</p>
        </div>
        <div class="col l2 hide-on-med-and-down">
          <i class="material-icons" style="font-size: 10vh; color: lightgray">{{ arrows[index] }}</i>
        </div>
      </div>
    </div>

    <div class="modal" ref="modalElem">
      <div class="modal-content">

        <div class="modal-btns">
          <i class="material-icons unselectable" style="font-size: 50px" @click="$router.push('/home')">home</i>
          <i class="material-icons unselectable" style="font-size: 50px" @click="playAgain">autorenew</i>
        </div>

        <h4 class="center">Finished</h4>
        <div v-if="mistakes.length > 0">
          <div class="divider"></div>
          <h4 class="center" style="margin-top: 20px">Mistakes</h4>
          <table class="centered striped">
            <thead>
            <tr>
              <th>Word</th>
              <th>Definition</th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="(entry, i) in mistakes" :key="i">
              <td>{{ entry.word }}</td>
              <td>{{ entry.definition }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, onUnmounted, onUpdated, reactive, ref} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";
import {Voclist} from "@/gen-types";
import {correctMessage, getCountry, isOfflineList, removeAllToasts, wrongMessage} from "@/use/general";
import Loader from "@/components/Loader.vue"
import {InfoOption} from "@/components/voc/exercises/WordInfoModal.vue";
import M from "materialize-css"
import Modal = M.Modal;

interface Entry {
  word: string;
  definition: string;
}

interface State {
  restored: boolean;
  options: string[];
  currEntry: Entry
}

export default defineComponent({
  components: {
    Loader
  },
  setup() {

    const list = ref<Voclist>(null);

    const currEntries = ref<Entry[]>(null);
    const entries = ref<Entry[]>(null)
    const mistakes = ref<Entry[]>([]);

    const optionColors = ["#ffc107", "#8b0000", "#006400", "#00008B"];
    const arrows = ["arrow_upward", "arrow_back", "arrow_forward", "arrow_downward"]

    const db = inject<Localdb>("db");
    const userInput = ref<HTMLTextAreaElement>(null);

    const modalElem = ref<HTMLElement>(null);
    const modal = ref<Modal>(null);

    const state = reactive<State>({
      restored: false,
      options: [],
      currEntry: null
    })

    function deepCopyEntries() {
      currEntries.value = entries.value.map(entry => entry)
    }

    function getRandomWord() {
      return list.value.words[Math.floor(Math.random() * list.value.words.length)].to;
    }

    function setNextEntry() {
      state.currEntry = currEntries.value[Math.floor(Math.random() * currEntries.value.length)];
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
      const words: string[] = []
      words.push(state.currEntry.word);
      for (let i = 0; i < 3; i++) {
        let word = getRandomWord()
        while (words.includes(word)) word = getRandomWord();
        words.push(word)
      }
      state.options = shuffle(words);
    }

    async function fillEntries() {
      entries.value = await Promise.all(list.value.words.map(async word => {
        const wordInfo: InfoOption[] = await new Promise(resolve => {
          const url = `https://api.dictionaryapi.dev/api/v2/entries/${list.value.settings.langSettings.toLang}/${word.to}`;
          fetch(url).then(data => data.json().then(res => resolve(res)))
        })

        return {
          word: word.to,
          definition: wordInfo && wordInfo.length > 0 && wordInfo[0].meanings && wordInfo[0].meanings[0].definitions.length > 0 ? wordInfo[0].meanings[0].definitions[0].definition : null
        }
      }))
      entries.value = entries.value.filter(item => item.definition);
    }

    function end() {
      modal.value.open();
    }

    async function restoreWords() {
      let nList: Voclist;
      if (isOfflineList()) nList = await db.getItem<Voclist>(localStorage.getItem("_id"), "downloadedVoclists");
      else nList = await db.getItem<Voclist>(localStorage.getItem("_id"), "voclists");
      list.value = nList;
      await fillEntries();

      if (entries.value.length < 4) {
        end();
        return;
      }

      deepCopyEntries()
      setNextEntry();
      fillOptions();
      state.restored = true;
    }

    async function playAgain() {
      if (entries.value.length == 0) return;
      deepCopyEntries()
      modal.value.close();
    }

    if (localStorage.getItem("_id")) restoreWords();


    function checkWord(attempt: string) {
      removeAllToasts();
      if (attempt === state.currEntry.word) {
        correctMessage("Correct! 🤓")
        currEntries.value.splice(currEntries.value.indexOf(state.currEntry), 1);
        if (currEntries.value.length === 0) {
          end();
          return
        }
      } else {
        wrongMessage("😂😂 Wrong! 😂😂")
        if (!mistakes.value.includes(state.currEntry)) mistakes.value.push(state.currEntry);
      }

      setNextEntry();
      fillOptions();
    }

    function handleKeyup(e: any) {
      if (state.options.length == 0) return;
      if (e.key == "ArrowUp") checkWord(state.options[0])
      else if (e.key == "ArrowLeft") checkWord(state.options[1])
      else if (e.key == "ArrowRight") checkWord(state.options[2])
      else if (e.key == "ArrowDown") checkWord(state.options[3])
    }

    onUpdated(() => {
      M.textareaAutoResize(document.querySelector("textarea"));

    })

    document.addEventListener("keyup", handleKeyup)

    onUnmounted(() => {
      document.removeEventListener("keyup", handleKeyup);
      modal.value.destroy();
    })

    onMounted(() => {
      modal.value = M.Modal.init(modalElem.value);
    })

    return {
      list,
      getCountry,
      checkWord,
      optionColors,
      arrows,
      isOfflineList,
      currEntries,
      state,
      userInput,
      mistakes,
      playAgain,
      modalElem,
      entries
    }

  },
});
</script>

<style scoped>
.parallelogram {
  clip-path: polygon(0 0, 100% 0%, 96% 100%, 0% 100%);
}
</style>