<template>
  <div>
    <WordInfoModal v-bind:fromLang="fromLang" v-bind:word="state.currWord.from"></WordInfoModal>
    <ExampleModal :word="state.currWord"></ExampleModal>

    <h3 class="center">Flashcards</h3>
    <div class="divider" style="background-color: black"></div>
    <h4 class="center" style="margin-bottom: -6vh">{{ state.index + 1 }}/{{ words.length }}</h4>

    <div class="carousel" ref="carouselElement" style="margin-top: -10vh">
      <FlashcardItem v-for="(word, i) in words" :key="i" v-bind:word="word" v-bind:global-index="state.index"
                     v-bind:index="i" v-on:show-translation="state.showTranslation=true"></FlashcardItem>
    </div>


    <div class="row" v-if="type === 'image'">
      <div class="col s12 m6 l4 offset-m3 offset-l4 input-field">
        <input type="text" disabled class="center" style="font-size: 35px; color: black"
               :value="state.showTranslation ? state.currWord.to : ''">
      </div>
    </div>

  </div>
</template>

<script lang="ts">


import {defineComponent, onMounted, onUnmounted, reactive, ref} from "@vue/composition-api";
import {Word} from "@/gen-types";
import M from "materialize-css"
import {getBlobUrl, isOfflineList} from "@/use/general";
import Carousel = M.Carousel;
import FlashcardItem from "./FlashcardItem.vue"

export interface State {
  index: number,
  currWord: Word,
  showTranslation: boolean
}

export default defineComponent({
  components: {
    WordInfoModal: () => import(/* webpackPrefetch: true */ '@/components/voc/exercises/WordInfoModal.vue'),
    ExampleModal: () => import(/* webpackPrefetch: true */ '@/components/voc/exercises/ExampleModal.vue'),
    FlashcardItem
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
      index: 0,
      currWord: props.words[0],
      showTranslation: false
    })

    function cycle() {
      if (!carouselInstance.value) return;
      let carouselIndex = carouselInstance.value.center % props.words.length;
      if (carouselIndex < 0) carouselIndex += props.words.length
      state.index = carouselIndex;
      state.currWord = props.words[carouselIndex];
      state.showTranslation = false;
    }

    function handleKeyup(e: any) {
      if (e.key == "ArrowLeft") carouselInstance.value.prev();
      else if (e.key == "ArrowRight") carouselInstance.value.next();
    }

    onMounted(() => {
      carouselInstance.value = M.Carousel.init(carouselElement.value, {onCycleTo: cycle, numVisible: 3, duration: 150});
      document.addEventListener("keyup", handleKeyup);
    })

    onUnmounted(() => {
      document.removeEventListener("keyup", handleKeyup);
      if (carouselInstance.value) carouselInstance.value.destroy();
    })

    return {carouselElement, state, type}
  },
});
</script>

<style scoped>
input:not([type]):disabled, input:not([type])[readonly="readonly"], input[type="text"]:not(.browser-default):disabled, input[type="text"]:not(.browser-default)[readonly="readonly"], input[type="password"]:not(.browser-default):disabled, input[type="password"]:not(.browser-default)[readonly="readonly"], input[type="email"]:not(.browser-default):disabled, input[type="email"]:not(.browser-default)[readonly="readonly"], input[type="url"]:not(.browser-default):disabled, input[type="url"]:not(.browser-default)[readonly="readonly"], input[type="time"]:not(.browser-default):disabled, input[type="time"]:not(.browser-default)[readonly="readonly"], input[type="date"]:not(.browser-default):disabled, input[type="date"]:not(.browser-default)[readonly="readonly"], input[type="datetime"]:not(.browser-default):disabled, input[type="datetime"]:not(.browser-default)[readonly="readonly"], input[type="datetime-local"]:not(.browser-default):disabled, input[type="datetime-local"]:not(.browser-default)[readonly="readonly"], input[type="tel"]:not(.browser-default):disabled, input[type="tel"]:not(.browser-default)[readonly="readonly"], input[type="number"]:not(.browser-default):disabled, input[type="number"]:not(.browser-default)[readonly="readonly"], input[type="search"]:not(.browser-default):disabled, input[type="search"]:not(.browser-default)[readonly="readonly"], textarea.materialize-textarea:disabled, textarea.materialize-textarea[readonly="readonly"] {
  border-bottom: 1px dotted rgba(0, 0, 0, 1);
  color: black;
}
</style>