<template>
  <div>
    <WordInfoModal v-bind:fromLang="fromLang" v-bind:word="state.currWord.from"></WordInfoModal>
    <i class="material-icons unselectable" style="position: absolute; font-size: 45px; color: lightgray"
       @click="$router.push('/vocabulary')">home</i>

    <h3 class="center">Flashcards</h3>
    <div class="divider"></div>
    <h4 class="center" style="margin-bottom: -6vh">{{ state.index + 1 }}/{{ words.length }}</h4>
    <div class="carousel" ref="carouselElement" style="margin-top: -10vh">
      <div class="carousel-item" v-for="(word, i) in words" :key="i" @click="cardClicked($event, i)">
        <div style="height: 400px" class="z-depth-2 red">

          <p class="center" style="font-size: 2.5rem; padding-top: 50px">{{ word.from }}</p>
          <div style="position: absolute; bottom: -100px; right: 5px">
            <i class="material-icons card-icon">add</i>
            <a href="#infoModal" class="modal-trigger" style="color: black;"
               @click="!state.flipped ? Object.assign(state.currWord, words[state.index]) : null;">
              <i class="material-icons card-icon">info_outline</i>
            </a>
            <i class="material-icons unselectable card-icon" @click="playAudio(word.toAudio)">volume_up</i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">


import WordInfoModal from "./WordInfoModal.vue";
import {computed, defineComponent, onMounted, reactive, ref} from "@vue/composition-api";
import {Word} from "@/gen-types";
import Carousel = M.Carousel;
import M from "materialize-css"

export interface State {
  currWord: Word
  index: number,
  flipped: boolean,
  firstClick: boolean
}

export default defineComponent({
  components: {
    WordInfoModal
  },
  props: {
    words: Array as () => Word[],
    fromLang: String
  },
  setup(props) {
    const carouselElement = ref(null);
    const carouselInstance = ref<Carousel>(null);

    const state = reactive<State>({
      currWord: {from: props.words[0].from, to: props.words[0].to, img: null, toAudio: null},
      index: 0,
      flipped: false,
      firstClick: true
    })

    const audio = new Audio();

    function playAudio(url: string) {
      audio.src = url;
      audio.play();
    }

    function flipCard() {
      Object.assign(state.currWord, props.words[state.index])
      props.words[state.index].from = state.currWord.to;
      state.flipped = true;
    }

    function unFlipCard() {
      props.words[state.index].from = state.currWord.from;
      state.flipped = false;
    }

    function cardClicked(e: Event, index: number) {
      const target: any = e.target
      if (target.classList.contains("card-icon") || state.index != index) return;

      if (state.flipped) unFlipCard();
      else flipCard()
    }

    function cycle() {
      if (!carouselInstance.value) return;
      if (state.flipped) unFlipCard();

      let carouselIndex = carouselInstance.value.center % props.words.length;
      if (carouselIndex < 0) carouselIndex += props.words.length
      state.index = carouselIndex;
    }

    onMounted(() => {
      carouselInstance.value = M.Carousel.init(carouselElement.value, {onCycleTo: cycle, numVisible: 3});

      document.addEventListener("keyup", function (e: KeyboardEvent) {
        if (e.key == "ArrowUp" || e.key == "ArrowDown") cardClicked(e, state.index);
        else if (e.key == "ArrowLeft") carouselInstance.value.prev();
        else if (e.key == "ArrowRight") carouselInstance.value.next();
      })
    })

    return {carouselElement, playAudio, state, cardClicked}
  },
});
</script>

<style scoped>

@media only screen and (max-width: 600px) {
  .carousel-item {
    width: 275px !important;
  }
}

@media only screen and (max-width: 992px) and (min-width: 600px) {
  .carousel-item {
    width: 400px !important;
  }
}

@media only screen and (min-width: 992px) {
  .carousel-item {
    width: 700px !important;
  }
}

.card-icon {
  margin-left: 5px;
  font-size: 35px;
}
</style>