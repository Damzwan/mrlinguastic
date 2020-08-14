<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <div>
    <ConfigModal v-on:saveLangSettings="saveLangSettings"></ConfigModal>

    <div v-if="state.langSettings.length === 4">
      <div class="row">
        <div class="input-field col s12" v-bind:id="state.langSettings[0]">
          <input v-bind:placeholder="getExampleWord(state.langSettings[0])" type="text" class="validate"
                 v-model="state.from"
                 v-on:keyup.enter="translateInput" ref="fromInput"/>
          <img role="img" :src="require(`@/assets/country-flags/${getCountry(state.langSettings[0])}.svg`)"
               class="flag-icon"
               alt="From Flag"/>
        </div>
        <div class="input-field col s12">
          <input v-bind:placeholder="getExampleWord(state.langSettings[2])" type="text" class="validate"
                 v-model="state.to" id="to"
                 v-on:keyup.enter="insertEntry" ref="toInput"/>
          <img role="img" :src="require(`@/assets/country-flags/${getCountry(state.langSettings[2])}.svg`)"
               class="flag-icon" alt="From Flag"/>
        </div>
        <div class="divider col s12"></div>
      </div>
      <div class="reverse-order" style="margin-bottom: 10%">
        <WordItem div v-for="(word, index) in state.words" :key="index" v-model="state.words[index]"
                  v-on:openImgModal="openImgModal" v-on:removeWord="removeWord"></WordItem>
      </div>
    </div>
    <div v-else>
      <a href="#configuration" class="modal-trigger">please configure the language before creating your list</a>
    </div>


    <div class="modal bottom-sheet" ref="imgModalElement">
      <div class="modal-content" v-if="state.selectedWord && !state.selectedWord.imgUrl">
        <h5 class="center">🖼 Select an image 🖼</h5>
        <div class="row section" v-show="state.imagesLoaded">
          <div class="col s4 m2 l1" v-for="(imgUrl, index) in state.imagesToLoad" :key="index">
            <img :src="imgUrl" :alt="index" @load="onImgLoad" class="circle hoverable centered-img"
                 style="width: 100px;height: 100px; margin-top: 20px" @click="setUrl(imgUrl)">
          </div>
        </div>
        <div v-show="!state.imagesLoaded" class="preloader-wrapper big active"
             :class="{'centered-img': !state.imagesLoaded}">
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
      <div v-else-if="state.selectedWord" style="overflow: hidden">
        <h5 class="center">🖼 Selected image 🖼</h5>
        <div class="row section valign-wrapper">
          <div class="col s8 m6 offset-m3">
            <img :src="state.selectedWord.imgUrl" alt="selected image" class="responsive-img centered-img">
          </div>
          <div class="col s4 m3 valign-wrapper unselectable" @click="swapImg">
            <i class="material-icons unselectable tooltipped centered-img" data-tooltip="Switch Image"
               style="font-size: 100px; color: gray">swap_vert</i>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive, onMounted, computed,

} from "@vue/composition-api";
import M from "materialize-css";
import ConfigModal from "./ConfigModal.vue";
import WordItem from "./WordItem.vue";
import {cleanWord, useImageSearch, useTranslate} from "@/use/voc";
import {getCountry, getExampleWord} from "@/use/languageToCountry";
import Modal = M.Modal;
import {Word} from "@/gen-types";

interface CreateContent {
  words: Word[];
  langSettings: string[];
  from: string;
  to: string;
  imagesToLoad: string[];
  imagesLoaded: boolean;
  selectedWord: Word;
}

export default defineComponent({
  components: {
    WordItem,
    ConfigModal,
  },
  setup() {
    const imgModalElement = ref(null)
    const imgModalInstance = ref<Modal>(null);

    const fromInput = ref<HTMLInputElement>(null);
    const toInput = ref<HTMLInputElement>(null);
    // const selectedFrom = ref<string>(null);
    const allImgUrls = reactive({});

    const state = reactive<CreateContent>({
      words: [],
      langSettings: [],
      from: "",
      to: "",
      imagesToLoad: [],
      imagesLoaded: false,
      selectedWord: null,
    })

    //all image urls for a given word, used to retrieve the images when a word is assed --> faster load times when retrieving the images
    // const allImgUrls = reactive(new Map<string, readonly string[]>());

    const {translatedWord, executeTranslate} = useTranslate();
    const {imgUrls, executeImageSearch} = useImageSearch();

    function saveLangSettings(settings: string[]) {
      state.langSettings = settings;
    }

    async function translateInput() {
      await executeTranslate({word: state.from, fromLang: state.langSettings[0], toLang: state.langSettings[2]})
      state.from = cleanWord(state.from);
      state.to = cleanWord(translatedWord.value.translateWord);
      toInput.value.focus();
    }

    function fillImgModal() {
      state.imagesToLoad = [];
      state.imagesLoaded = false;
      for (const url of allImgUrls[state.selectedWord.from]) state.imagesToLoad.push(url);
    }

    async function insertEntry() {
      const word = {
        from: cleanWord(state.from),
        to: cleanWord(state.to),
        imgUrl: null,
        fromAudio: `https://8f585606e10f.ngrok.io/speech?word=${state.from}&lang=${state.langSettings[0]}&voice=${state.langSettings[1]}`,
        toAudio: `https://8f585606e10f.ngrok.io/speech?word=${state.to}&lang=${state.langSettings[2]}&voice=${state.langSettings[3]}`
      };
      state.words.push(word);
      state.from = "";
      fromInput.value.focus();
      state.to = "";

      await executeImageSearch({word: word.from, lang: state.langSettings[0]})
      allImgUrls[word.from] = imgUrls.value.getImages;
      state.selectedWord = word;

      fillImgModal();
      state.selectedWord.imgUrl = allImgUrls[word.from][0]; //auto select the first image
    }

    function openImgModal(word: Word) {
      const prevWord = state.selectedWord;
      state.selectedWord = word;
      if (prevWord != word) fillImgModal()
      imgModalInstance.value.open();
    }

    let counter = 0;

    function onImgLoad() {
      counter++;
      if (counter == state.imagesToLoad.length) {
        state.imagesLoaded = true;
        counter = 0;
      }
    }

    function setUrl(imgUrl: string) {
      imgModalInstance.value.close();
      state.selectedWord.imgUrl = imgUrl;
    }

    function swapImg() {
      state.selectedWord.imgUrl = null;
    }

    function removeWord(fromWord: string) {
      state.words = state.words.filter(word => word.from != fromWord)
    }

    onMounted(() => {
      imgModalInstance.value = M.Modal.init(imgModalElement.value, {outDuration: 0});
    });


    return {
      state,
      translateInput,
      insertEntry,
      saveLangSettings,
      fromInput,
      toInput,
      getCountry,
      getExampleWord,
      imgModalElement,
      openImgModal,
      onImgLoad,
      setUrl,
      swapImg,
      removeWord
    };
  },
});
</script>

<style scoped>
.flag-icon {
  width: 30px;
  position: absolute;
  right: 20px;
  top: 5px;
}

.reverse-order {
  display: flex;
  flex-direction: column-reverse;
}
</style>