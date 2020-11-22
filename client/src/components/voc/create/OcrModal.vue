<template>
  <div>
    <div id="ocrModal" class="modal fullscreen-modal" ref="modalElement"
         :style="{backgroundImage: 'url(' + require('../../../assets/triangle2.svg') + ')'}">
      <div class="modal-content" style="height: 100%">
        <i class="material-icons right unselectable close-btn modal-close">close</i>
        <h4 class="center" style="margin-bottom: 30px">Words Importer 🧾</h4>

        <div v-if="state.importState === ImportState.NoFileUploaded"
             style="height: 100%; width: 100%">
          <p class="flow-text center">Select an image or text file to import your words from 🐱‍🐉<br> Or
            paste an image using ctrl+V</p>
          <div class="file-field input-field">
            <div class="btn">
              <span>File</span>
              <input type="file" @change="readUrl" accept="image/*, .docx, .txt" id="fileInput">
            </div>
            <div class="file-path-wrapper">
              <input class="file-path validate" type="text">
            </div>
          </div>
        </div>

        <div v-else-if="state.importState === ImportState.Img">
          <div v-show="cropperLoaded">
            <p class="flow-text center">Please select the words you want to import from the image</p>
            <div class="divider"></div>

            <div v-bind:style="{height: getNiceSize() + 'px'}">
              <img src="" alt="this should be image" ref="img" style="max-width: 1280px">
            </div>
            <div class="waves-effect waves-light btn footer-btn" @click="sendImg">Continue</div>

            <i class="material-icons unselectable" style="font-size: 40px" @click="zoomIn">zoom_out</i>
            <i class="material-icons unselectable" style="font-size: 40px" @click="zoomOut">zoom_in</i>

          </div>
          <Loader v-if="!cropperLoaded"></Loader>
        </div>

        <div v-else-if="state.importState === ImportState.ReadyToImport">
          <div v-if="!isProcessing">
            <p class="flow-text center">Let's try to extract some words from your text file</p>
            <div class="divider"></div>

            <div class="row section">
              <p class="flow-text">The first line of your file is: </p>
              <div class="input-field col s12">
                <input type="text" disabled :value="state.importedText[0]">
              </div>

              <p class="flow-text">Does this line contain the translation as well?</p>
              <div class="col s12">
                <div class=" switch">
                  <label>
                    No
                    <input type="checkbox" v-model="dontTranslateWords">
                    <span class="lever"></span>
                    Yes
                  </label>
                </div>
              </div>


              <p class="flow-text" style="margin-top: 100px">Enter the first word of this line</p>
              <div class="input-field col s12">
                <input id="firstWord" type="text">
                <label for="firstWord">First Word</label>
              </div>

              <p class="flow-text">What language is the first word?</p>
              <div class="input-field col s12">
                <select ref="langSelect">
                  <option :value="langSettings.fromLang">{{ getLang(langSettings.fromLang) }}</option>
                  <option :value="langSettings.toLang">{{ getLang(langSettings.toLang) }}</option>
                </select>
              </div>

              <div v-if="dontTranslateWords">
                <p class="flow-text">Enter the second word of this line</p>
                <div class="input-field col s12">
                  <input id="splitter" type="text">
                  <label for="splitter">Second Word</label>
                </div>
              </div>
            </div>

            <div class="waves-effect waves-light btn footer-btn" @click="wordsFromTextFile">Get Words</div>
          </div>
          <Loader v-if="isProcessing"></Loader>
        </div>

        <div v-else-if="state.importState === ImportState.Imported">
          <p class="flow-text center">Please remove or edit any words that are incorrect ❌</p>
          <div class="divider"></div>

          <div class="row">
            <div class="col s6 center"><b>Should be {{ getLang(langSettings.fromLang) }}</b></div>
            <div class="col s6 center"><b>Should be {{ getLang(langSettings.toLang) }}</b></div>
          </div>

          <div class="row rounded z-depth-1" v-for="(word, index) in state.importedWords.from" :key="index"
               style="background-color: #ead9a1">
            <div class="col s6 input-field">
              <input type="text" v-model="state.importedWords.from[index]" class="word center">
            </div>
            <div class="col s6 input-field">
              <input type="text" v-model="state.importedWords.to[index]" class="word center">
            </div>
            <i class="material-icons unselectable tooltipped remove-btn" data-tooltip="Remove" @click="remove(index)"
               style="color: #8b0000">close</i>
          </div>
        </div>
      </div>
    </div>


    <div class="fixed-action-btn" style="z-index: 9999999" v-if="state.importState === ImportState.Imported">
      <div class="btn-floating btn-large red" @click="addImportedWords">
        <i class="large material-icons" style="font-size: 35px;">add</i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, onUpdated, reactive, ref, watch,} from "@vue/composition-api";
import M from "materialize-css";

import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

import {createWorker} from "tesseract.js"
import {cleanWord, getLang} from "@/use/general";
import {LangSettings} from "@/gen-types";
import Loader from "@/components/Loader.vue"
import {useTranslateWordsQueryLazy} from "@/use/lazyQueries";
import Tooltip = M.Tooltip;

enum ImportState {
  NoFileUploaded,
  Img,
  ReadyToImport,
  Imported
}

interface State {
  importState: ImportState;
  importedWords: ImportedWords;
  importedText: string[];
}


export interface ImportedWords {
  from: string[];
  to: string[];
}

export default defineComponent({
  props: {
    langSettings: Object as () => LangSettings
  },
  components: {
    Loader
  },
  setup(props, context) {

    const iso2to3 = {en: "eng", fr: "fra", it: "ita", nl: "nld"};

    const modalElement = ref<HTMLElement>(null);
    const modal = ref<M.Modal>(null);

    const cropper = ref<Cropper>(null);
    const img = ref<HTMLImageElement>(null); //The image the user uploads
    const cropperLoaded = ref(false);
    const isProcessing = ref(false);

    const langSelect = ref<HTMLSelectElement>(null);

    const dontTranslateWords = ref(false);
    const tooltip = ref<Tooltip>(null);


    const state = reactive<State>({
      importState: ImportState.NoFileUploaded,
      importedWords: {from: [], to: []},
      importedText: null
    })

    const {result: translatedWords, load: executeTranslate} = useTranslateWordsQueryLazy();

    //worker setup
    const worker = createWorker();
    worker.load().then(() => worker.loadLanguage(iso2to3[props.langSettings.fromLang] + "+" + iso2to3[props.langSettings.toLang]))


    async function reset() {
      cropperLoaded.value = false;
      isProcessing.value = false;
      state.importState = ImportState.NoFileUploaded;
      dontTranslateWords.value = false;

      if (cropper.value) cropper.value.destroy();
      state.importedWords = {from: [], to: []}
    }

    onMounted(() => {
      tooltip.value = M.Tooltip.init(document.getElementById("infoTip"));
      modal.value = M.Modal.init(modalElement.value, {inDuration: 0, outDuration: 0, onCloseEnd: reset});
    })

    onUnmounted(() => {
      document.removeEventListener("paste", pasteImage);
      modal.value.destroy();
      if (tooltip.value) tooltip.value.destroy();
    })

    //perhaps resize image before creating a cropper
    function createCropper(imgUrl: string) {
      img.value.src = imgUrl;
      img.value.onload = function () {
        cropper.value = new Cropper(img.value, {
          dragMode: "move",
          viewMode: 2,
          responsive: false,
          zoomOnTouch: false,
          autoCropArea: 0.5,
        })
        cropperLoaded.value = true;
      }
    }

    function pasteImage(event) {
      if (event.clipboardData == false) return;
      const items = event.clipboardData.items;
      if (items == null) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") == -1) continue;
        state.importState = ImportState.Img;
        const blob = items[i].getAsFile();
        const URLObj = window.URL || window.webkitURL;
        const url = URLObj.createObjectURL(blob);
        setTimeout(createCropper, 100, url); //TODO stupid hack :/
      }
    }

    function getImgUrl(blob: Blob, maxSize: number): Promise<string> {
      return new Promise(resolve => {
        const img = new Image();

        img.onload = function () {
          const cnvs = document.createElement('canvas') as HTMLCanvasElement;
          const ctx = cnvs.getContext('2d');

          let w = img.width;
          let h = img.height;

          if (w > h) {
            if (w > maxSize) {
              h *= maxSize / w;
              w = maxSize;
            }
          } else {
            if (h > maxSize) {
              w *= maxSize / h;
              h = maxSize;
            }
          }

          cnvs.width = w;
          cnvs.height = h
          ctx.drawImage(img, 0, 0, w, h);

          let imgPixels = ctx.getImageData(0, 0, w, h);

          for (let y = 0; y < imgPixels.height; y++) {
            for (let x = 0; x < imgPixels.width; x++) {
              const i = (y * 4) * imgPixels.width + x * 4;
              const avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
              imgPixels.data[i] = avg;
              imgPixels.data[i + 1] = avg;
              imgPixels.data[i + 2] = avg;
            }
          }
          ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
          resolve(cnvs.toDataURL());
        }

        img.src = URL.createObjectURL(blob);

      })
    }

    async function wordsFromText() {
      isProcessing.value = true;
      let elem = document.getElementById("firstWord") as HTMLInputElement;
      const firstWord = elem.value;
      const startIndex = state.importedText[0].indexOf(firstWord);
      let splitter: string = null;

      const userLang = langSelect.value.value;
      if (dontTranslateWords.value) {
        elem = document.getElementById("splitter") as HTMLInputElement;
        const secondWord = elem.value;
        splitter = state.importedText[0].charAt(state.importedText[0].indexOf(secondWord) - 1);
        state.importedWords.from = state.importedText.map(line => cleanWord(line.substring(startIndex, line.lastIndexOf(splitter))))
        state.importedWords.to = state.importedText.map(line => cleanWord(line.substring(line.lastIndexOf(splitter) + 1)));
        if (userLang != props.langSettings.fromLang) swapWords();
        state.importState = ImportState.Imported;
      } else {
        state.importedWords.from = state.importedText.map(line => cleanWord(line.substring(startIndex)));
        executeTranslate(null, {
          words: state.importedWords.from,
          fromLang: userLang == props.langSettings.fromLang ? props.langSettings.fromLang : props.langSettings.toLang,
          toLang: userLang == props.langSettings.fromLang ? props.langSettings.toLang : props.langSettings.fromLang
        })
        watch(translatedWords, () => {
          state.importedWords.to = translatedWords.value.translateWords.map(word => cleanWord(word));
          if (userLang != props.langSettings.fromLang) swapWords();
          state.importState = ImportState.Imported;
        })
      }
    }

    function readTextFile(blob: Blob) {
      const reader = new FileReader();
      reader.onload = event => {
        const res = event.target.result as string;
        state.importedText = res.split("\n");
        state.importedText = state.importedText.map(line => line.toLowerCase())
        state.importState = ImportState.ReadyToImport;
      };
      reader.readAsText(blob);
    }

    function readUrl(event) {
      if (event.target.files && event.target.files[0]) {
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        const extension = fileInput.value.substring(fileInput.value.lastIndexOf(".") + 1);
        const imgExtensions = ["jpeg", "jpg", "png"];

        if (imgExtensions.includes(extension)) {
          state.importState = ImportState.Img;
          getImgUrl(event.target.files[0], 1400).then(url => createCropper(url));
        } else if (extension == "txt") readTextFile(event.target.files[0])

      }
    }

    function zoomIn() {
      cropper.value.zoom(-0.1)
    }

    function zoomOut() {
      cropper.value.zoom(0.1);
    }

    async function ocr(imgUrl: string) {
      await worker.initialize(iso2to3[props.langSettings.fromLang] + "+" + iso2to3[props.langSettings.toLang]);
      const {data: {text}} = await worker.recognize(imgUrl);
      return text;
    }

    async function handleOcr() {
      cropperLoaded.value = false; //turn back the loading screen
      const croppedImg = cropper.value.getCroppedCanvas().toDataURL();
      const textBlock = await ocr(croppedImg)
      state.importedText = textToWords(textBlock);
      state.importState = ImportState.ReadyToImport;
    }

    onUpdated(() => {
      if (state.importState === ImportState.ReadyToImport) {
        M.FormSelect.init(langSelect.value);
      }
    })

    function textToWords(text: string) {
      const receivedWords = text.split("\n");
      const words: Array<string> = [];
      for (const word of receivedWords) {
        if (word == "" || word == " ") continue;
        words.push(cleanWord(word));
      }
      return words;
    }

    function removeWord(index: number) {
      state.importedWords.from.splice(index, 1);
      state.importedWords.to.splice(index, 1);
    }

    function addImportedWords() {
      modal.value.close();
      context.emit("addImportedWords", state.importedWords)
    }

    function swapWords() {
      const temp = state.importedWords.from;
      state.importedWords.from = state.importedWords.to;
      state.importedWords.to = temp;
    }

    function getNiceSize() {
      return window.screen.height * 0.6;
    }

    document.addEventListener("paste", pasteImage);


    return {
      modalElement,
      readUrl,
      state,
      img,
      zoomIn,
      zoomOut,
      sendImg: handleOcr,
      dontTranslateWords,
      remove: removeWord,
      addImportedWords,
      pasteImage,
      getLang,
      wordsFromTextFile: wordsFromText,
      swapWords,
      ImportState,
      cropperLoaded,
      getNiceSize,
      isProcessing,
      langSelect
    }
  }

  ,
});
</script>

<style scoped>

.rounded {
  padding: 3px;
  border-radius: 10px;
}

.remove-btn {
  position: absolute;
  right: 30px;
}

.word {
  height: 1.5rem !important;
  margin-bottom: 0 !important;
}

::placeholder {
  color: black;
}

input {
  border-bottom: 1px #000000;
}

input:not([type]):disabled, input:not([type])[readonly="readonly"], input[type="text"]:not(.browser-default):disabled, input[type="text"]:not(.browser-default)[readonly="readonly"], input[type="password"]:not(.browser-default):disabled, input[type="password"]:not(.browser-default)[readonly="readonly"], input[type="email"]:not(.browser-default):disabled, input[type="email"]:not(.browser-default)[readonly="readonly"], input[type="url"]:not(.browser-default):disabled, input[type="url"]:not(.browser-default)[readonly="readonly"], input[type="time"]:not(.browser-default):disabled, input[type="time"]:not(.browser-default)[readonly="readonly"], input[type="date"]:not(.browser-default):disabled, input[type="date"]:not(.browser-default)[readonly="readonly"], input[type="datetime"]:not(.browser-default):disabled, input[type="datetime"]:not(.browser-default)[readonly="readonly"], input[type="datetime-local"]:not(.browser-default):disabled, input[type="datetime-local"]:not(.browser-default)[readonly="readonly"], input[type="tel"]:not(.browser-default):disabled, input[type="tel"]:not(.browser-default)[readonly="readonly"], input[type="number"]:not(.browser-default):disabled, input[type="number"]:not(.browser-default)[readonly="readonly"], input[type="search"]:not(.browser-default):disabled, input[type="search"]:not(.browser-default)[readonly="readonly"], textarea.materialize-textarea:disabled, textarea.materialize-textarea[readonly="readonly"] {
  color: rgba(0, 0, 0, 1);
  border-bottom: 1px dotted #000000;
}

label {
  color: black;
}

.select-wrapper input.select-dropdown {
  border-bottom: 1px solid #000000 !important;
}

.divider {
  background-color: black;
}
</style>