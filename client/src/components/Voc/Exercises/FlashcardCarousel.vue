<template>
  <div>
    <WordInfoModal v-bind:fromLang="fromLang" v-bind:word="state.currWord.from"></WordInfoModal>
    <i class="material-icons unselectable" style="position: absolute; font-size: 45px; color: lightgray"
       @click="$router.push('/vocabulary')">home</i>

    <h3 class="center">Flashcards</h3>
    <div class="divider"></div>
    <h4 class="center" style="margin-bottom: -6vh">{{ state.index + 1 }}/{{ words.length }}</h4>

    <div class="carousel" ref="carouselElement" style="margin-top: -10vh">
      <div class="carousel-item" :class="{'text-card': type === 'text', 'img-card': type === 'image'}"
           v-for="(word, i) in words" :key="i" @click="cardClicked($event, i)">
        <div style="height: 400px" class="z-depth-2 red" v-if="type === 'text'">
          <p class="center" style="font-size: 2.5rem; padding-top: 50px">{{ word.from }}</p>
          <div style="position: absolute; bottom: -100px; right: 5px">
            <i class="material-icons card-icon">add</i>
            <a href="#infoModal" class="modal-trigger" style="color: black;">
              <i class="material-icons card-icon">info_outline</i>
            </a>
            <i class="material-icons unselectable card-icon" @click="playAudio(word.toAudio)">volume_up</i>
          </div>
        </div>

        <div v-if="type === 'image'" @click="cardClicked($event, i)">
          <img :src="getBlobUrl(word.img)" alt="no image :(((" width="100%">
        </div>
      </div>
    </div>

    <div class="row" v-if="type === 'image'">
      <div class="col s12 m6 l4 offset-m3 offset-l4 input-field">
        <input type="text" disabled class="center" style="font-size: 20px; color: black" ref="toInput"
               :value="state.clickedOnCard ? state.currWord.to : ''">
      </div>
    </div>

  </div>
</template>

<script lang="ts">


import WordInfoModal from "./WordInfoModal.vue";
import {computed, defineComponent, onMounted, onUnmounted, reactive, ref} from "@vue/composition-api";
import {Word} from "@/gen-types";
import Carousel = M.Carousel;
import M from "materialize-css"
import {getBlobUrl} from "@/use/blobStorage";

export interface State {
  currWord: Word
  index: number,
  flipped: boolean,
  clickedOnCard: boolean
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

    const type = localStorage.getItem("exerciseType");

    const state = reactive<State>({
      currWord: {from: props.words[0].from, to: props.words[0].to, img: null, toAudio: null},
      index: 0,
      flipped: false,
      clickedOnCard: false
    })

    const audio = new Audio();

    function playAudio(url: string) {
      audio.src = url;
      audio.play();
    }

    function flipCard() {
      props.words[state.index].from = state.currWord.to;
      state.flipped = true;
    }

    function unFlipCard() {
      props.words[state.index].from = state.currWord.from;
      state.flipped = false;
    }

    function cardClicked(e: Event, index: number) {
      state.clickedOnCard = true
      const target: any = e.target
      if (target.classList.contains("card-icon") || state.index != index || type === "image") return;

      if (state.flipped) unFlipCard();
      else flipCard()
    }

    function cycle() {
      state.clickedOnCard = false;
      if (!carouselInstance.value) return;
      if (state.flipped) unFlipCard();

      let carouselIndex = carouselInstance.value.center % props.words.length;
      if (carouselIndex < 0) carouselIndex += props.words.length
      state.index = carouselIndex;
      Object.assign(state.currWord, props.words[state.index])
    }

    function handleKeyup(e: any) {
      if (e.key == "ArrowUp" || e.key == "ArrowDown") cardClicked(e, state.index);
      else if (e.key == "ArrowLeft") carouselInstance.value.prev();
      else if (e.key == "ArrowRight") carouselInstance.value.next();
    }

    onMounted(() => {
      carouselInstance.value = M.Carousel.init(carouselElement.value, {onCycleTo: cycle, numVisible: 3});
      document.addEventListener("keyup", handleKeyup);
    })

    onUnmounted(() => {
      document.removeEventListener("keyup", handleKeyup);
    })

    return {carouselElement, playAudio, state, cardClicked, type, getBlobUrl}
  },
});
</script>

<style scoped>

@media only screen and (max-width: 600px) {
  .text-card {
    width: 275px !important;
  }

  .img-card {
    width: 275px !important;
  }
}

@media only screen and (max-width: 992px) and (min-width: 600px) {
  .text-card {
    width: 400px !important;
  }

  .img-card {
    width: 400px !important;
  }
}

@media only screen and (min-width: 992px) {
  .text-card {
    width: 700px !important;
  }

  .img-card {
    width: 400px !important;
  }
}

.card-icon {
  margin-left: 5px;
  font-size: 35px;
}
</style>