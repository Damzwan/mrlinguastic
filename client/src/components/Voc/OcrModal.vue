<template>
  <div>
    <div id="ocr" class="modal fullscreen-modal" ref="ocrModal">
      <div class="modal-content" style="height: 100%">
        <i class="material-icons right unselectable close-btn modal-close">close</i>
        <h4 class="center" style="margin-bottom: 30px">Words Importer 🧾</h4>

        <div v-if="state.imgLoading === 0" @paste="pasteImage" style="height: 100%; width: 100%">
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

        <div v-else-if="state.imgLoading === 1">
          <div class="preloader-wrapper fat active centered-img">
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
          <h6 class="center-align">Loading...</h6>
        </div>

        <div v-else-if="state.imgLoading === 3">
          <div v-if="state.ocrLoading !== 2">
            <p class="flow-text center">Let's try to extract some words from your text file</p>
            <div class="divider"></div>

            <div class="row section">

              <p class="flow-text">The first line of your file is: </p>
              <div class="input-field col s12">
                <input type="text" disabled :value="txtWords[0]">
              </div>

              <p class="flow-text">Does this line contain the translation as well?</p>
              <div class="col s12">
                <div class=" switch">
                  <label>
                    No
                    <input type="checkbox" v-model="isChecked">
                    <span class="lever"></span>
                    Yes
                  </label>
                </div>
              </div>


              <p class="flow-text" style="margin-top: 100px">Enter the first word of the first line</p>
              <div class="input-field col s12">
                <input id="firstWord" type="text">
                <label for="firstWord">First Word</label>
              </div>

              <div v-if="isChecked">
                <p class="flow-text">Enter the second line of the first line</p>
                <div class="input-field col s12">
                  <input id="splitter" type="text">
                  <label for="splitter">Second Word</label>
                </div>
              </div>
            </div>

            <div class="waves-effect waves-light btn footer-btn" @click="wordsFromTextFile">Get Words</div>
          </div>

          <div v-else-if="state.ocrLoading === 2">
            <p class="flow-text center">Please remove or edit any words that are incorrect ❌</p>
            <div class="row">
              <div class="col s12"><i class="material-icons unselectable centered-img" style="font-size: 60px; color: lightgray; text-align: center" @click="swapWords">swap_horiz</i></div>
            </div>
            <div class="divider"></div>
            <div class="row rounded z-depth-1" v-for="(word, index) in state.importedWords.from" :key="index">
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

        <div v-show="state.imgLoading === 2" style="display: block; max-width: 100%; height: 70%">
          <div v-show="state.ocrLoading === 0" style="width: 100%; height: 100%">
            <p class="flow-text center" v-if="isChecked">Please select words that are in
              <b>{{ getLang(langSettings.fromLang) }}</b>
              first and words in <b>{{ getLang(langSettings.toLang) }}</b> afterwards
            </p>
            <p class="flow-text center" v-else>Please select words that are in <b>{{
                getLang(langSettings.fromLang)
              }}</b>. We will
              add the translation of the selected words for you</p>
            <div class="divider"></div>

            <div ref="prevCrop" class="cropbox-outline"></div>
            <img src="" alt="this should be image" ref="img" @load="state.imgLoading = 2" style="max-width: 1280px">
            <div class="waves-effect waves-light btn footer-btn" @click="sendImg">Send</div>

            <div class="switch down_left">
              <label>
                One
                <input type="checkbox" ref="ocrType" @change="switchCheck">
                <span class="lever"></span>
                Two
              </label>
            </div>

            <i class="material-icons unselectable" style="font-size: 40px" @click="zoomIn">zoom_out</i>
            <i class="material-icons unselectable" style="font-size: 40px" @click="zoomOut">zoom_in</i>
          </div>

          <div v-if="state.ocrLoading === 1">
            <div class="preloader-wrapper fat active centered-img">
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
            <h6 class="center-align">Loading...</h6>
          </div>

          <div v-else-if="state.ocrLoading === 2">
            <p class="flow-text center">Please remove or edit any words that are incorrect ❌</p>
            <div class="divider"></div>
            <div class="row rounded z-depth-1" v-for="(word, index) in state.importedWords.from" :key="index">
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

    </div>
    <div class="fixed-action-btn" style="z-index: 9999999" v-if="state.ocrLoading === 2">
      <div class="btn-floating btn-large red" @click="addImportedWords">
        <i class="large material-icons" style="font-size: 35px;">add</i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref,} from "@vue/composition-api";
import M from "materialize-css";

import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

import {createWorker} from "tesseract.js"
import {cleanWord, useTranslateMultiple} from "@/use/voc";
import {normalMessage} from "@/use/messages";
import {LangSettings} from "@/gen-types";
import {getLang} from "@/use/languageToCountry";

interface OcrState {
  imgLoading: number;
  ocrLoading: number;
  importedWords: ImportedWords;
}

export interface ImportedWords {
  from: string[];
  to: string[];
}

export default defineComponent({
  props: {
    langSettings: Object as () => LangSettings
  },
  setup(props, context) {


    const iso2to3 = {en: "eng", fr: "fra", it: "ita", nl: "nld"};

    const ocrModal = ref(null);
    const ocrModalInstance = ref<M.Modal>(null);

    const {translatedWords, executeTranslate} = useTranslateMultiple();

    const img = ref<HTMLImageElement>(null); //The image the user uploads, used to push
    const ocrType = ref<HTMLInputElement>(null); //The switch to determine if we should ocr only 1 image or two

    const prevCrop = ref<HTMLDivElement>(null);

    const txtWords = ref<string[]>(null);
    const state = reactive<OcrState>({imgLoading: 0, ocrLoading: 0, importedWords: {from: [], to: []}})
    const cropper = ref<Cropper>(null);

    //worker setup
    const worker = createWorker();
    worker.load();
    worker.loadLanguage(iso2to3[props.langSettings.fromLang] + "+" + iso2to3[props.langSettings.toLang])

    const isChecked = ref(false);

    function reset() {
      state.ocrLoading = 0;
      state.imgLoading = 0;
      if (cropper.value) cropper.value.destroy();

      isChecked.value = false;
      ocrType.value.disabled = false;
      ocrType.value.checked = false;

      prevCrop.value.style.visibility = "hidden";

      state.importedWords = {from: [], to: []}
    }

    onMounted(() => {
      M.Tooltip.init(document.getElementById("infoTip"));
      ocrModalInstance.value = M.Modal.init(ocrModal.value, {inDuration: 0, outDuration: 0, onCloseEnd: reset});
    })

    function switchCheck() {
      isChecked.value = !isChecked.value;
    }

    //perhaps resize image before creating a cropper
    function createCropper(imgUrl: string) {
      img.value.src = imgUrl;
      img.value.onload = function () {
        cropper.value = new Cropper(img.value, {
          dragMode: "move",
          viewMode: 2,
          responsive: false,
          zoomOnTouch: false,
          autoCropArea: 0.5
        })
      }
    }

    function pasteImage(event) {
      if (event.clipboardData == false) return;
      const items = event.clipboardData.items;
      if (items == null) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") == -1) continue;
        const blob = items[i].getAsFile();
        const URLObj = window.URL || window.webkitURL;
        createCropper(URLObj.createObjectURL(blob))
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

    async function wordsFromTextFile() {
      let elem = document.getElementById("firstWord") as HTMLInputElement;
      const firstWord = elem.value;
      const startIndex = txtWords.value[0].indexOf(firstWord);
      let splitter: string = null;

      if (isChecked.value) {
        elem = document.getElementById("splitter") as HTMLInputElement;
        const secondWord = elem.value;
        splitter = txtWords.value[0].charAt(txtWords.value[0].indexOf(secondWord) - 1);
      }


      if (!isChecked.value) {
        state.importedWords.from = txtWords.value.map(line => cleanWord(line.substring(startIndex)));
        await executeTranslate({
          words: state.importedWords.from,
          fromLang: props.langSettings.fromLang,
          toLang: props.langSettings.toLang
        })
        state.importedWords.to = translatedWords.value.translateWords.map(word => cleanWord(word));
        state.ocrLoading = 2;
        // state.imgLoading = 2;
      } else {
        state.importedWords.from = txtWords.value.map(line => cleanWord(line.substring(startIndex, line.lastIndexOf(splitter))))
        state.importedWords.to = txtWords.value.map(line => cleanWord(line.substring(line.lastIndexOf(splitter) + 1)))
        // state.imgLoading = 2;
        state.ocrLoading = 2;
      }


    }

    function readTextFile(blob: Blob) {
      state.imgLoading = 1;
      const reader = new FileReader();
      reader.onload = event => {
        const res = event.target.result as string;
        txtWords.value = res.split("\n");
        state.imgLoading = 3;
      };
      reader.readAsText(blob);
    }

    function readUrl(event) {
      if (event.target.files && event.target.files[0]) {
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        const extension = fileInput.value.substring(fileInput.value.lastIndexOf(".") + 1);
        const imgExtensions = ["jpeg", "jpg", "png"];

        if (imgExtensions.includes(extension)) getImgUrl(event.target.files[0], 1400).then(url => {
          state.imgLoading = 1;
          createCropper(url);
        });
        else if (extension == "txt") readTextFile(event.target.files[0])

      }
    }

    function zoomIn() {
      cropper.value.zoom(-0.1)
    }

    function zoomOut() {
      cropper.value.zoom(0.1);
    }

    async function ocr(imgUrl: string, lang: string) {
      await worker.initialize(lang);
      const {data: {text}} = await worker.recognize(imgUrl);
      return text;
    }

    function textToWords(text: string) {
      const receivedWords = text.split("\n");
      const words: Array<string> = [];
      for (const word of receivedWords) {
        if (word == "" || word == " ") continue;
        words.push(cleanWord(word));
      }
      return words;
    }

    async function handleSingleOcr(words: string[]) {
      state.importedWords.from = words;
      await executeTranslate({words: words, fromLang: props.langSettings.fromLang, toLang: props.langSettings.toLang})
      state.importedWords.to = translatedWords.value.translateWords.map(word => cleanWord(word));
      state.ocrLoading = 2;
    }

    async function handleDoubleOcr(words: string[]) {
      if (state.importedWords.from.length == 0) {
        state.importedWords.from = words
        ocrType.value.disabled = true;
      } else {
        state.importedWords.to = words;
        state.ocrLoading = 2;
      }
    }

    function drawCropBoxOutline() {
      const cropBoxData = cropper.value.getCropBoxData();
      prevCrop.value.style.width = cropBoxData.width.toString() + "px";
      prevCrop.value.style.height = cropBoxData.height.toString() + "px";
      prevCrop.value.style.transform = `translateX(${cropBoxData.left}px) translateY(${cropBoxData.top}px)`
      prevCrop.value.style.visibility = "visible";
    }

    async function sendImg() {
      const firstOcr = state.importedWords.from.length == 0;
      if ((firstOcr && !ocrType.value.checked) || !firstOcr) state.ocrLoading = 1;
      if (firstOcr && ocrType.value.checked) {
        drawCropBoxOutline();
        normalMessage(`words sent!`)
      }

      const croppedImg = cropper.value.getCroppedCanvas().toDataURL();
      const lang = firstOcr ? iso2to3[props.langSettings.fromLang] : iso2to3[props.langSettings.toLang]
      const text = await ocr(croppedImg, lang)
      const words = textToWords(text);

      if (!ocrType.value.checked) await handleSingleOcr(words);
      else await handleDoubleOcr(words);
    }

    function remove(index: number) {
      state.importedWords.from.splice(index, 1);
      state.importedWords.to.splice(index, 1);
    }

    function addImportedWords() {
      context.emit("addImportedWords", state.importedWords)
      ocrModalInstance.value.close();
    }

    function swapWords(){
      const temp = state.importedWords.from;
      state.importedWords.from = state.importedWords.to;
      state.importedWords.to = temp;
    }

    return {
      ocrModal,
      readUrl,
      state,
      img,
      zoomIn,
      zoomOut,
      sendImg,
      ocrType,
      isChecked,
      switchCheck,
      remove,
      prevCrop,
      addImportedWords,
      pasteImage,
      getLang,
      txtWords,
      wordsFromTextFile,
      swapWords
    }
  }

  ,
});
</script>

<style scoped>

.down_left {
  position: absolute;
  left: 30px;
  bottom: 20px;
}

.rounded {
  padding: 3px;
  border-radius: 10px;
}

.line-under {
  border-bottom: 1px solid #9e9e9e;
}

.remove-btn {
  position: absolute;
  right: 30px;
}

.word {
  height: 1.5rem !important;
  margin-bottom: 0 !important;
}

.fat {
  width: 128px;
  height: 128px;
}

.cropbox-outline {
  position: absolute;
  z-index: 1;
  outline-style: dashed;
  outline-color: red;
  pointer-events: none;
  visibility: hidden;
}

.question-btn {
  position: absolute;
  left: 150px;
  bottom: 15px;
}
</style>