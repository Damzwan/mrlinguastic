<template>
  <div>
    <div v-for="monster in spawnedMonsters" :key="monster.from">
      <SpaceInvaderMonster v-bind:word="monster.from" v-on:damage="handleDamage"
                           v-bind:speed="getSpeed()"></SpaceInvaderMonster>
    </div>

    <div class="typeracer-input-box">
      <input type="text" placeholder="Enter the translation of words over here" ref="userInput"
             v-on:keyup.enter="checkAnswer" style="margin-left: 10px">
    </div>

    <div style="position: fixed; right: 10px">
      <i class="material-icons unselectable" style="font-size: 50px; color: red" v-for="i in currLives"
         :key="i">favorite</i>
    </div>

    <div class="modal" ref="difficultyModalElem">
      <div class="modal-content">
        <h4 class="center">🎮 SpaceInvaders 🎮</h4>
        <h5 class="center">Type the translation of the words before they reach the lower part of the screen!</h5>
        <h6 class="center">Please select your <b>difficulty</b> and the amount of <b>lives</b> you would like to have
        </h6>
        <div class="divider"></div>

        <p class="flow-text">Amount of Lives: {{ lives }}</p>
        <p class="range-field">
          <input type="range" min="1" max="10" v-model="lives"/>
        </p>

        <p class="flow-text">Difficulty:</p>
        <p>
          <label>
            <input @click="setDifficulty(0)" name="group1" type="radio" checked/>
            <span>Easy</span>
          </label>
        </p>
        <p>
          <label>
            <input @click="setDifficulty(1)" name="group1" type="radio"/>
            <span>Medium</span>
          </label>
        </p>
        <p>
          <label>
            <input @click="setDifficulty(2)" class="with-gap" name="group1" type="radio"/>
            <span>Hard</span>
          </label>
        </p>

      </div>
      <div class="modal-footer">
        <a class="modal-close btn">Play!</a>
      </div>
    </div>

    <div class="modal" ref="modalElem">
      <div class="modal-content">

        <div class="modal-btns">
          <i class="material-icons unselectable" style="font-size: 50px" @click="$router.push('/')">home</i>
          <i class="material-icons unselectable" style="font-size: 50px" @click="playAgain">autorenew</i>
        </div>

        <h5 class="center">{{ isVictory ? "😎 Victory 😎" : "😭 Defeat 😭" }}</h5>
        <div v-if="mistakes.length > 0">
          <div class="divider"></div>
          <h4 class="center" style="margin-top: 20px">Mistakes</h4>
          <table class="centered striped">
            <thead>
            <tr>
              <th>From</th>
              <th>To</th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="(word, i) in mistakes" :key="i" @mouseover="currWord = word">
              <td>{{ word.from }}</td>
              <td>{{ word.to }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, onUnmounted, ref} from "@vue/composition-api";
import {cleanWord, isOfflineList} from "@/use/general";
import {Voclist, Word} from "@/gen-types";
import {Localdb} from "@/use/localdb";
import SpaceInvaderMonster from "@/components/voc/exercises/SpaceInvaderMonster.vue";
import M from "materialize-css"
import Modal = M.Modal;

interface State {
  restored: boolean
}

export default defineComponent({
  components: {
    SpaceInvaderMonster
  },
  setup() {

    const db = inject<Localdb>("db");
    const list = ref<Voclist>(null);
    const userInput = ref<HTMLInputElement>(null);
    const spawnedMonsters = ref<Word[]>([])

    let wordAmount;
    const mistakes = ref<Word[]>([]);

    let minIntervalTime;
    let maxIntervalTime;
    const intervalTime = ref(6000);

    const lives = ref("3");
    const currLives = ref(3);
    const difficulty = ref(0);

    const modal = ref<Modal>(null);
    const modalElem = ref<HTMLElement>(null);
    const difficultyModalElem = ref<HTMLElement>(null);
    const difficultyModal = ref<Modal>(null);

    const isVictory = ref(false);

    function getRandomWord(): Word | null {
      if (list.value.words.length == 0) return null;
      const randomIndex = Math.floor(Math.random() * list.value.words.length);
      const word = list.value.words[randomIndex];
      list.value.words.splice(randomIndex, 1);
      return word;
    }

    function addMonster() {
      const randomWord = getRandomWord();
      if (randomWord) spawnedMonsters.value.push(randomWord)
    }


    async function restoreWords() {
      let nList: Voclist;
      if (isOfflineList()) nList = await db.getItem<Voclist>(localStorage.getItem("_id"), "downloadedVoclists");
      else nList = await db.getItem<Voclist>(localStorage.getItem("_id"), "voclists");
      list.value = nList;
    }

    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

    function spawnMonsters() {
      addMonster()
      if (list.value.words.length > 0) setTimeout(addMonster, getRandomArbitrary(0, intervalTime.value / 2))


      intervalTime.value = (1 - list.value.words.length / wordAmount) * minIntervalTime
          + (list.value.words.length / wordAmount) * maxIntervalTime
      if (list.value.words.length - 1 > 0) setTimeout(spawnMonsters, intervalTime.value)
    }

    function setSpawnInterval() {
      if (difficulty.value == 0) {
        minIntervalTime = 3000;
        maxIntervalTime = 5500;
      } else if (difficulty.value == 1) {
        minIntervalTime = 2000;
        maxIntervalTime = 4000;
      } else if (difficulty.value == 2) {
        minIntervalTime = 500;
        maxIntervalTime = 2500;
      }
    }

    function exerciseSetup() {
      setSpawnInterval();
      wordAmount = list.value.words.length;
      currLives.value = parseInt(lives.value);
      userInput.value.focus();
      spawnMonsters()
    }

    function handleVictory() {
      spawnedMonsters.value = [];
      isVictory.value = true;
      modal.value.open();
    }

    function handleDefeat() {
      list.value.words = [];
      spawnedMonsters.value = [];
      isVictory.value = false;
      modal.value.open();
    }

    function indexOf(word: string, to: boolean) {
      let index = -1;
      for (let i = 0; i < spawnedMonsters.value.length; i++)
        if (to && spawnedMonsters.value[i].to == word) index = i;
        else if (spawnedMonsters.value[i].from == word) index = i;
      return index;
    }

    function checkAnswer() {
      const i = indexOf(cleanWord(userInput.value.value), true)
      if (i != -1) {
        spawnedMonsters.value.splice(i, 1);
        if (spawnedMonsters.value.length == 0 && list.value.words.length == 0) handleVictory();
      }
      userInput.value.value = "";
    }

    function handleDamage(word: string) {
      const i = indexOf(word, false);
      mistakes.value.push(spawnedMonsters.value[i]);
      spawnedMonsters.value.splice(i, 1);
      currLives.value--;
      window.navigator.vibrate(600);
      if (currLives.value == 0) handleDefeat();
      else if (spawnedMonsters.value.length == 0 && list.value.words.length == 0) handleVictory();
    }

    async function playAgain() {
      modal.value.close()
      mistakes.value = [];
      await restoreWords();
      difficultyModal.value.open();
    }

    onMounted(() => {
      modal.value = M.Modal.init(modalElem.value);
      difficultyModal.value = M.Modal.init(difficultyModalElem.value, {onCloseEnd: exerciseSetup});
      difficultyModal.value.open();
    })

    onUnmounted(() => {
      modal.value.destroy();
      difficultyModal.value.destroy();
    })

    function setDifficulty(level: number) {
      difficulty.value = level;
    }

    function getSpeed() {
      if (difficulty.value == 0) return 0.1;
      else if (difficulty.value == 1) return 0.15
      else if (difficulty.value == 2) return 0.2;
    }

    restoreWords();


    return {
      userInput,
      spawnedMonsters,
      checkAnswer,
      handleDamage,
      currLives,
      lives,
      modalElem,
      playAgain,
      isVictory,
      mistakes,
      difficultyModalElem,
      exerciseSetup,
      setDifficulty,
      difficulty,
      getSpeed
    }

  },
});
</script>

<style scoped>
.typeracer-input-box {
  position: fixed;
  bottom: 0;
  z-index: 997;
  width: 100%;
  background-color: AliceBlue;

}

.modal-btns {
  position: fixed;
  left: 20px;
}

::placeholder {
  color: black;
}
</style>