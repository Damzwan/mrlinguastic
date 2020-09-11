<template>
  <div>
    <div v-if="state.restored">
      <ConfigModal v-on:saveSettings="saveSettings" v-bind:prevSettings="list.settings"
      ></ConfigModal>
      <OcrModal v-if="list.settings" v-bind:langSettings="list.settings.langSettings"
                v-on:addImportedWords="addImportedWords"></OcrModal>

      <div v-if="list.settings">
        <div class="row">
          <div class="input-field col s12">
            <input v-bind:placeholder="getExampleWord(list.settings.langSettings.fromLang)" type="text"
                   v-model="state.from"
                   v-on:keyup.enter="translateInput" ref="fromInput"/>
            <img role="img"
                 :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.fromLang)}.svg`)"
                 class="flag-icon"
                 alt="From Flag"/>
          </div>
          <div class="input-field col s12">
            <input v-bind:placeholder="getExampleWord(list.settings.langSettings.toLang)" type="text"
                   v-model="state.to" id="to"
                   v-on:keyup.enter="insertEntry" ref="toInput"/>
            <img role="img"
                 :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.toLang)}.svg`)"
                 class="flag-icon" alt="From Flag"/>
          </div>
          <div class="divider col s12"></div>
        </div>
        <div class="reverse-order" style="margin-bottom: 20px">
          <WordItem div v-for="(word, index) in list.words" :key="index" v-model="list.words[index]"
                    v-bind:fromLang="list.settings.langSettings.fromLang"
                    v-on:openImgModal="openImgModal" v-on:removeWord="removeWord"
                    v-on:openExamplesModal="openExamplesModal"></WordItem>
        </div>
      </div>
      <div v-else>
        <a href="#configuration" class="modal-trigger">please configure the language before creating your list</a>
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


    <!--    TODO should be a separate component-->
    <div class="modal bottom-sheet" ref="imgModalElement">
      <div class="modal-content" v-if="state.selectedWord && !state.selectedWord.img">
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
            <img :src="getBlobUrl(state.selectedWord.img)" alt="selected image"
                 class="responsive-img centered-img">
          </div>
          <div class="col s4 m3 valign-wrapper unselectable" @click="swapImg">
            <i class="material-icons unselectable tooltipped centered-img" data-tooltip="Switch Image"
               style="font-size: 100px; color: gray">swap_vert</i>
          </div>
        </div>
      </div>
    </div>

    <!--    TODO should be a separate component-->
    <div class="modal fullscreen-modal" ref="exampleModalElement">
      <div class="modal-content" v-if="state.selectedWord">
        <i class="material-icons right unselectable close-btn modal-close">close</i>
        <h4 class="center">example sentences</h4>
        <p class="flow-text center">Create a sentence with <b>{{ state.selectedWord.from }}</b> in the first text box
          and create sentences with <b>{{ state.selectedWord.to }}</b> in the boxes below</p>
        <div class="divider" style="margin-bottom: 20px"></div>
        <ExampleItem v-for="(sentence, index) in state.selectedWord.sentences" :key="index"
                     v-model="state.selectedWord.sentences[index]" v-on:removeSentence="removeSentence"
                     v-bind:fromWord="state.selectedWord.from" v-bind:toWord="state.selectedWord.to"></ExampleItem>
        <div class="row">
          <div class="col s12 valign-wrapper">
            <i class="material-icons centered-img unselectable" style="font-size: 50px; color: gray"
               @click="addSentence">add</i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, reactive, ref, watch,} from "@vue/composition-api";
import M from "materialize-css";
import ConfigModal from "./ConfigModal.vue";
import WordItem from "./WordItem.vue";
import ExampleItem from "./ExampleItem.vue"
import OcrModal from "@/components/Voc/OcrModal.vue";
import {cleanWord, useTranslate} from "@/use/voc";
import {getCountry, getExampleWord} from "@/use/languageToCountry";
import {
  Sentence,
  useSaveImgMutation,
  useUpdateVoclistMutation,
  Voclist,
  VoclistInput,
  VoclistSettings,
  Word, WordInput
} from "@/gen-types";
import {wrongMessage} from "@/use/messages";
import {ImportedWords} from "./OcrModal.vue"
import {getDb} from "@/use/localdb";
import Modal = M.Modal;
import {getBlobUrl} from "@/use/blobStorage";
import {AuthModule} from "@/use/authModule";

//used to make use of typescript typing
interface State {
  from: string; //word that is typed by the user in the first input
  to: string; //word that is types by the users in the second input
  imagesToLoad: string[]; //an array of image urls that should be loaded into the imgModal
  imagesLoaded: boolean; //a boolean to determine whether all images have been loaded yet
  selectedWord: Word; //the currently selected word by the user (when a user clicks on a word component this variable is set)
  restored: boolean;
  changedBlobs: string[];
}

export default defineComponent({
  components: {
    WordItem,
    ConfigModal,
    ExampleItem,
    OcrModal
  },
  setup(props, context) {

    const imgModalElement = ref(null) //The HTML element of the imgModal
    const imgModalInstance = ref<Modal>(null); //An instance of the imgModal, as soon as we mount we initialize this Modal. Use this instance to call modal methods

    //same as above
    const exampleModalElement = ref(null);
    const exampleModalInstance = ref<Modal>(null);

    const fromInput = ref<HTMLInputElement>(null); //html element of the first input
    const toInput = ref<HTMLInputElement>(null); //html element of the second input

    const auth = inject<AuthModule>("auth");

    const list = reactive<Voclist>({
      _id: null,
      settings: null,
      words: [],
      creator: "me",
      lastEdited: new Date().toISOString()
    })

    const state = reactive<State>({
      from: "",
      to: "",
      imagesToLoad: [],
      imagesLoaded: false,
      selectedWord: null,
      restored: false,
      changedBlobs: [],
    })

    const {translatedWord, executeTranslate} = useTranslate(); //allow us to execute translation queries
    const {mutate: updateVoclistOnline} = useUpdateVoclistMutation(null); //TODO fix better name xd
    const {mutate: saveImgToServer} = useSaveImgMutation(null);


    const db = getDb();

    //TODO put this in use dir
    function restoreWords() {
      if (localStorage.getItem("_id")) {
        db.restoreVocList(localStorage.getItem("_id")).then(async restoredList => {
          Object.assign(list, restoredList);
          state.restored = true;
        })
      } else state.restored = true;
    }

    if (db.db) restoreWords()
    else db.connect().then(() => restoreWords())

    async function finalSave() {
      if (auth.getOid()) await updateVoclistOnline({
        list: list as VoclistInput,
        changedBlobs: state.changedBlobs,
        oid: auth.getOid()
      })
    }

    watch(() => list, () => {
      db.save("voclists", list)
    }, {deep: true})

    //initialize the modals
    onMounted(() => {
      imgModalInstance.value = M.Modal.init(imgModalElement.value, {outDuration: 0});
      exampleModalInstance.value = M.Modal.init(exampleModalElement.value);
    });

    //save the language settings that are being pushed from the ConfigModal
    async function saveSettings(settings: VoclistSettings) {
      if (!localStorage.getItem("_id")) {
        list._id = await db.createVoclist(settings, list.words, list.creator);
        localStorage.setItem("_id", list._id)
      }
      list.settings = settings;
    }

    async function translateInput() {
      toInput.value.focus();
      await executeTranslate({
        word: state.from,
        fromLang: list.settings.langSettings.fromLang,
        toLang: list.settings.langSettings.toLang
      })
      state.from = cleanWord(state.from);
      state.to = cleanWord(translatedWord.value.translateWord);

    }

    //fill the image modal with images for the selectedWord
    async function fillImgModal(imgs: string[]) {
      state.imagesToLoad = [];
      state.imagesLoaded = false;
      for (const img of imgs) state.imagesToLoad.push(img);
    }

    //check if a given word has already been inserted by the user
    function wordExists(from: string) {
      for (const word of list.words) {
        if (word.from == from) return true;
      }
      return false;
    }

    function cleanInputs() {
      state.from = "";
      fromInput.value.focus(); //focus on the from input first, otherwise the second input will not be cleaned
      state.to = "";
    }

    async function insertEntry() {
      const from = cleanWord(state.from);
      const to = cleanWord(state.to);
      cleanInputs();

      if (wordExists(from)) {
        wrongMessage("🤡 Word already in list 🤡")
        return;
      }

      const word: Word = {
        from: from,
        to: to,
        img: null,
        toAudio: `http://localhost:4000/speech?word=${to}&lang=${list.settings.langSettings.toLang}&voice=${list.settings.langSettings.toVoice}`,
        sentences: [{from: "", to: [""]}],
      };
      list.words.push(word);
    }

    function openImgModal(params: any[]) {
      const prevWord = state.selectedWord;
      state.selectedWord = params[0];
      if (prevWord != params[0]) fillImgModal(params[1]) //if the images are already loaded in the modal we should not do it again
      imgModalInstance.value.open();
    }

    let counter = 0;

    //switch a boolean as soon as all images are loaded
    function onImgLoad() {
      counter++;
      if (counter == state.imagesToLoad.length) {
        state.imagesLoaded = true;
        counter = 0;
      }
    }

    function openExamplesModal(word: Word) {
      state.selectedWord = word;
      exampleModalInstance.value.open();
    }

    //called when the user selects an image
    function setUrl(imgUrl: string) {
      imgModalInstance.value.close();
      state.selectedWord.img = imgUrl;
      saveImgToServer({img: imgUrl}).then(result => state.selectedWord.img = result.data.saveImg);
    }

    //the user wants to select a new image
    function swapImg() {
      if (state.selectedWord.img.substring(0, 5) != "https") state.changedBlobs.push(state.selectedWord.img);
      state.selectedWord.img = null;
    }

    //called when the users click on the delete button of a WordItem component
    //TODO perhaps search for the word itself instead of the fromWord
    function removeWord(fromWord: string) {
      list.words = list.words.filter(word => word.from != fromWord)
    }

    //called when the users click on the add button in the exampleModal
    function addSentence() {
      state.selectedWord.sentences.push({from: "", to: [""]})
    }

    //called when the users click on the remove button of an exampleItem component
    function removeSentence(sentenceToRemove: Sentence) {
      state.selectedWord.sentences = state.selectedWord.sentences.filter(sentence => sentence != sentenceToRemove)
    }

    async function addImportedWords(words: ImportedWords) {

      for (let i = 0; i < words.from.length; i++) {
        if (wordExists(words.from[i])) continue;

        const word: Word = {
          from: words.from[i],
          to: words.to[i],
          img: null,
          toAudio: `http://localhost:4000/speech?word=${words.to[i]}&lang=${list.settings.langSettings.toLang}&voice=${list.settings.langSettings.toVoice}`,
          sentences: [{from: "", to: [""]}],
        };
        list.words.push(word);
      }
    }

    window.onbeforeunload = async function (e) {
      await finalSave();
    };

    return {
      state,
      list,
      translateInput,
      insertEntry,
      fromInput,
      toInput,
      getCountry,
      getExampleWord,
      imgModalElement,
      exampleModalElement,
      openImgModal,
      openExamplesModal,
      onImgLoad,
      setUrl,
      swapImg,
      removeWord,
      addSentence,
      removeSentence,
      addImportedWords,
      saveSettings,
      finalSave,
      getBlobUrl
    };
  },
  async beforeRouteLeave(to, from, next) {
    await this.finalSave();
    next(); //TODO perhaps have a better look at this
  }
});
</script>

<style scoped>
.reverse-order {
  display: flex;
  flex-direction: column-reverse;
}

.rounded {
  padding: 3px;
  border-radius: 10px;
}
</style>