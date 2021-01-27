<template>
  <div>
    <div v-if="state.restored">
      <ConfigModal v-on:create-list="createList" v-bind:settings="list.settings"></ConfigModal>
      <div v-if="list.settings.langSettings.fromLang && list.settings.langSettings.toLang">
        <OcrModal v-bind:langSettings="list.settings.langSettings"
                  v-on:addImportedWords="addImportedWords"></OcrModal>

        <div v-if="state.selectedWord">
          <ImgModal v-bind:selected-word="state.selectedWord" v-bind:images-to-load="state.imagesToLoad"
                    v-on:remove-blob="removeBlob"></ImgModal>
          <CreateExampleModal v-bind:selected-word="state.selectedWord"></CreateExampleModal>
        </div>


        <div class="row">
          <div class="input-field col s12">
            <input v-bind:placeholder="getExampleWord(list.settings.langSettings.fromLang)" type="text"
                   v-model="state.from"
                   v-on:keyup.enter="translateInput" ref="fromInput"/>
            <img role="img"
                 :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.fromLang)}.svg`)"
                 class="flag-icon"
                 alt="From Flag" width="30px" height="30px"/>
          </div>
          <div class="input-field col s12">
            <input v-bind:placeholder="getExampleWord(list.settings.langSettings.toLang)" type="text"
                   v-model="state.to" id="to"
                   v-on:keyup.enter="insertEntry" ref="toInput" class="autocomplete"/>
            <img role="img"
                 :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.toLang)}.svg`)"
                 class="flag-icon" alt="From Flag" width="30px" height="30px"/>
          </div>
          <!--          <div class="divider col s12"></div>-->
        </div>
        <div class="reverse-order" style="margin-bottom: 20px">
          <WordDiv div v-for="(word, index) in list.words" :key="index" v-bind:word="word"
                   v-bind:fromLang="list.settings.langSettings.fromLang"
                   v-bind:toLang="list.settings.langSettings.toLang"
                   v-bind:img-search="list.settings.langSettings.imgSearch"
                   v-on:fill-img-modal="fillImgModal" v-on:remove-word="removeWord"
                   v-on:select-word="selectWord"></WordDiv>
        </div>
      </div>
    </div>
    <Loader v-else style="margin-top: 100px"></Loader>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onUnmounted, reactive, ref, watch,} from "@vue/composition-api";
import M from "materialize-css";
import ConfigModal from "./ConfigModal.vue";
import {ImportedWords} from "@/components/voc/create/OcrModal.vue";
import Loader from "@/components/Loader.vue"
import {cleanWord, getBlobUrl, getCountry, getExampleWord, newLastUpdated, wrongMessage} from "@/use/general";
import {useUpdateVoclistMutation, Voclist, VoclistInput, VoclistSettings, Word} from "@/gen-types";
import {AuthModule} from "@/use/authModule";
import {Localdb} from "@/use/localdb";
import {replaceList, resetWordsLoading} from "@/use/state";
import {useTranslateWordQueryLazy} from "@/use/lazyQueries";

//used to make use of typescript typing
interface State {
  from: string; //word that is typed by the user in the first input
  to: string; //word that is types by the users in the second input
  imagesToLoad: string[]; //an array of image urls that should be loaded into the imgModal
  selectedWord: Word; //the currently selected word by the user (when a user clicks on a word component this variable is set)
  restored: boolean;
  blobsToRemove: string[];
}

export default defineComponent({
  components: {
    WordDiv: () => import(/* webpackPrefetch: true */ '@/components/voc/create/WordDiv.vue'),
    ConfigModal,
    OcrModal: () => import('@/components/voc/create/OcrModal.vue'),
    ImgModal: () => import(/* webpackPrefetch: true */ '@/components/voc/create/ImgModal.vue'),
    Loader,
    CreateExampleModal: () => import(/* webpackPrefetch: true */ '@/components/voc/create/CreateExampleModal.vue')
  },
  setup() {
    const fromInput = ref<HTMLInputElement>(null); //html element of the first input
    const toInput = ref<HTMLInputElement>(null); //html element of the second input

    const auth = inject<AuthModule>("auth");
    const db = inject<Localdb>("db");

    const serverUri = inject<string>("serverUri");

    const list = reactive<Voclist>({
      _id: null,
      settings: {
        title: "my new voclist",
        description: "",
        langSettings: {
          fromLang: null,
          toLang: null,
          toVoice: null,
          imgSearch: true
        },
      },
      words: [],
      creator: auth.getOid().value,
      lastEdited: new Date().toISOString()
    })

    const state = reactive<State>({
      from: "",
      to: "",
      imagesToLoad: [],
      selectedWord: null,
      restored: false,
      blobsToRemove: [],
    })

    const {result: translatedWord, load: executeTranslate} = useTranslateWordQueryLazy();
    const {mutate: updateVoclistOnline} = useUpdateVoclistMutation(null); //TODO fix better name xd

    resetWordsLoading();

    function restoreVoclist() {
      db.restoreVocList(localStorage.getItem("_id")).then(async restoredList => {
        Object.assign(list, restoredList);
        state.restored = true;
      })
    }

    if (localStorage.getItem("_id")) restoreVoclist()
    else state.restored = true;

    function finalSave() {
      if (!localStorage.getItem("_id")) return;
      if (auth.getOid().value && list && list.settings) {
        updateVoclistOnline({
          list: list as VoclistInput,
          changedBlobs: state.blobsToRemove,
          oid: auth.getOid().value,
          lastUpdated: newLastUpdated()
        })
      }
      replaceList(list);
      db.addListToUser(list._id);
    }

    watch(() => list, () => {
      if (localStorage.getItem("_id")) db.save("voclists", list)
    }, {deep: true})


    async function createList(settings: VoclistSettings) {
      if (localStorage.getItem("_id")) return;
      list._id = await db.createVoclist(settings, list.words, list.creator);
      localStorage.setItem("_id", list._id)
    }

    //this is the stupid format materialize wants
    function createObject(arr: string[]) {
      const obj = {};
      for (const key of arr) obj[key] = null;
      return obj
    }

    function onAutoCompleteTo(res) {
      state.to = res;
      toInput.value.blur();
      insertEntry();
    }

    async function translateInput() {
      const from = cleanWord(state.from);
      if (from == "") return;
      toInput.value.focus();

      executeTranslate(null, {
        word: from,
        fromLang: list.settings.langSettings.fromLang,
        toLang: list.settings.langSettings.toLang
      })

      watch(translatedWord, () => {
        if (translatedWord.value.translateWord.length == 1) state.to = cleanWord(translatedWord.value.translateWord[0]);
        else {
          M.Autocomplete.init(toInput.value, {
            data: createObject(translatedWord.value.translateWord),
            minLength: 0,
            onAutocomplete: onAutoCompleteTo
          })
          toInput.value.click();
        }
      })
    }

    //check if a given word has already been inserted by the user
    function wordExists(from: string) {
      for (const word of list.words)
        if (word.from == from) return true;
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
        toAudio: `${serverUri}/speech?word=${to}&lang=${list.settings.langSettings.toLang}&voice=${list.settings.langSettings.toVoice}`,
        sentences: [{from: "", to: [""]}],
      };
      list.words.push(word);
    }

    function fillImgModal(imgs: string[]) {
      state.imagesToLoad = imgs;
    }

    //TODO perhaps search for the word itself instead of the fromWord
    function removeWord(fromWord: string) {
      list.words = list.words.filter(word => word.from != fromWord)
    }

    function selectWord(word: Word) {
      state.selectedWord = word;
    }

    async function addImportedWords(words: ImportedWords) {

      for (let i = 0; i < words.from.length; i++) {
        if (wordExists(words.from[i])) continue;

        const word: Word = {
          from: words.from[i],
          to: words.to[i],
          img: null,
          toAudio: `${serverUri}/speech?word=${words.to[i]}&lang=${list.settings.langSettings.toLang}&voice=${list.settings.langSettings.toVoice}`,
          sentences: [{from: "", to: [""]}],
        };
        list.words.push(word);
      }
    }

    function removeBlob(blob: string) {
      state.blobsToRemove.push(blob);
    }

    window.addEventListener("beforeunload", finalSave)

    onUnmounted(() => {
      window.removeEventListener("beforeunload", finalSave)
    })

    return {
      state,
      list,
      translateInput,
      insertEntry,
      fromInput,
      toInput,
      getCountry,
      getExampleWord,
      fillImgModal,
      removeWord,
      addImportedWords,
      createList,
      finalSave,
      getBlobUrl,
      selectWord,
      removeBlob
    };
  },
  beforeRouteLeave(to, from, next) {
    this.finalSave();
    next(); //TODO perhaps have a better look at this
  }
});
</script>

<style scoped>
.reverse-order {
  display: flex;
  flex-direction: column-reverse;
}

::placeholder {
  color: #424242;
}

input {
  border-bottom: 1px solid #000000 !important;
}

.divider {
  background-color: black;
}
</style>