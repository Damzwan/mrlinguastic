<template>
  <div>
    <div v-if="state.restored && list">
      <FlashcardCarousel v-bind:words="list.words" v-bind:from-lang="list.settings.langSettings.fromLang"></FlashcardCarousel>
    </div>

    <Loader v-else></Loader>

  </div>
</template>

<script lang="ts">


import WordInfoModal from "./WordInfoModal.vue";
import {defineComponent, inject, onMounted, onUnmounted, reactive, ref} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";
import {Voclist} from "@/gen-types";
import M from "materialize-css"
import FlashcardCarousel from "@/components/voc/exercises/FlashcardCarousel.vue";
import {isOfflineList} from "@/use/general";
import Carousel = M.Carousel;
import Loader from "@/components/Loader.vue"

interface State {
  restored: boolean;
  index: number;
}

export default defineComponent({
  components: {
    WordInfoModal,
    FlashcardCarousel,
    Loader
  },
  setup() {
    const db = inject<Localdb>("db");
    const list = ref<Voclist>(null);

    const carouselElement = ref(null);
    const carouselInstance = ref<Carousel>(null);
    const type = localStorage.getItem("exerciseType");

    const state = reactive<State>({
      restored: false,
      index: 0
    })

    onMounted(() => {
      carouselInstance.value = M.Carousel.init(carouselElement.value);
    })

    onUnmounted(() => {
      if (carouselInstance.value) carouselInstance.value.destroy();
    })

    function exerciseSetup(providedList: Voclist) {
      list.value = providedList;
      if (type === "image") list.value.words = list.value.words.filter(word => word.img);
      state.restored = true;
    }

    function restoreWords() {
      if (isOfflineList()) db.getItem<Voclist>(localStorage.getItem("_id"), "downloadedVoclists").then(nlist => exerciseSetup(nlist))
      else db.getItem<Voclist>(localStorage.getItem("_id"), "voclists").then(nlist => exerciseSetup(nlist))
    }

    if (localStorage.getItem("_id")) restoreWords();

    return {state, carouselElement, list}
  },
});
</script>

<style scoped>
.carousel-item{
  width: 300px !important;
}
</style>