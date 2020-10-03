<template>
  <div>
    <div v-if="state.restored && list">
      <FlashcardCarousel v-bind:words="list.words" v-bind:from-lang="list.settings.langSettings.fromLang"></FlashcardCarousel>
    </div>

    <div style="margin-top: 100px" v-else>
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


import WordInfoModal from "./WordInfoModal.vue";
import {defineComponent, inject, onMounted, reactive, ref} from "@vue/composition-api";
import {Localdb} from "@/use/localdb";
import {Voclist, Word} from "@/gen-types";
import Carousel = M.Carousel;
import M from "materialize-css"
import FlashcardCarousel from "@/components/Voc/Exercises/FlashcardCarousel.vue";
import {isOfflineList} from "@/use/voc";

interface State {
  restored: boolean;
  index: number;
}

export default defineComponent({
  components: {
    WordInfoModal,
    FlashcardCarousel
  },
  setup() {
    const db = inject<Localdb>("db");
    const list = ref<Voclist>(null);

    const carouselElement = ref(null);
    const carouselInstance = ref<Carousel>(null);

    const state = reactive<State>({
      restored: false,
      index: 0
    })

    onMounted(() => {
      carouselInstance.value = M.Carousel.init(carouselElement.value);
    })

    function exerciseSetup(providedList: Voclist) {
      list.value = providedList;
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