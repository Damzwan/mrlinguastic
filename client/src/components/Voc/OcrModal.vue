<template>
  <div>
    <div id="ocr" class="modal fullscreen-modal" ref="ocrModal">
      <div class="modal-content" style="height: 100%">
        <i class="material-icons right unselectable close-btn modal-close">close</i>
        <h4 class="center" style="margin-bottom: 30px">Words Importer 🧾</h4>

        <div v-if="state.imgLoading === 0">
          <p class="flow-text center">Select an image, word document or text file to import your words from :))</p>
          <div class="file-field input-field">
            <div class="btn">
              <span>File</span>
              <input type="file" @change="readUrl">
            </div>
            <div class="file-path-wrapper">
              <input class="file-path validate" type="text">
            </div>
          </div>
        </div>

        <div v-else-if="state.imgLoading === 1">
          <div class="preloader-wrapper big active">
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

        <div v-show="state.imgLoading === 2" style="display: block; max-width: 100%; height: 80%">
          <div v-show="state.ocrLoading === 0" style="width: 100%; height: 100%">
            <img src="" alt="this should be image" ref="img" @load="state.imgLoading = 2" style="max-width: 1280px">
            <div class="waves-effect waves-light btn confirm-btn" @click="sendImg">Send</div>

            <div class="switch down_left">
              <label>
                One
                <input type="checkbox" ref="ocrType">
                <span class="lever"></span>
                Two
              </label>
            </div>

            <i class="material-icons unselectable" style="font-size: 40px" @click="zoomIn">zoom_out</i>
            <i class="material-icons unselectable" style="font-size: 40px" @click="zoomOut">zoom_in</i>
          </div>

          <div v-if="state.ocrLoading === 1">
            Loading...
          </div>

          <div v-else-if="state.ocrLoading === 2 && state.importedWords.from">
            <p v-for="word in state.importedWords.from" :key="word">{{word}}</p>
          </div>
        </div>
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
import {cleanWord} from "@/use/voc";

interface ImportedWords {
  from: string[];
  to: string[];
}

export default defineComponent({
  props: {
    langSettings: Array as () => Array<string>
  },
  setup(props, context) {

    const iso2to3 = {en: "eng", fr: "fra", it: "ita", nl: "nld"};

    const ocrModal = ref(null);
    const ocrModalInstance = ref<M.Modal>(null);

    const img = ref<HTMLImageElement>(null); //The image the user uploads, used to push
    const ocrType = ref<HTMLInputElement>(null); //The switch to determine if we should ocr only 1 image or two

    const state = reactive({imgLoading: 0, ocrLoading: 0, importedWords: {from: [], to: []}})
    const cropper = ref<Cropper>(null);
    // const importedWords = ref<ImportedWords>({from: null, to: null});

    //worker setup
    const worker = createWorker();
    worker.load();
    worker.loadLanguage(iso2to3[props.langSettings[0]] + "+" + iso2to3[props.langSettings[2]])

    onMounted(() => {
      ocrModalInstance.value = M.Modal.init(ocrModal.value, {inDuration: 0, outDuration: 0});
    })

    function readUrl(event) {
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          state.imgLoading = 1;
          img.value.src = e.target.result.toString();
          cropper.value = new Cropper(img.value, {dragMode: "move", viewMode: 2, responsive: false, zoomOnTouch: false})
        }
        reader.readAsDataURL(event.target.files[0]);
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
      const words = [];
      for (const word of receivedWords) {
        if (word == "" | word == " ") continue;
        words.push(cleanWord(word));
      }
      return words;
    }

    async function sendImg() {
      state.ocrLoading = 1;
      const croppedImg = cropper.value.getCroppedCanvas().toDataURL();
      const lang = !ocrType.value.checked || !state.importedWords.from ? iso2to3[props.langSettings[0]] : iso2to3[props.langSettings[2]]
      const text = await ocr(croppedImg, lang)
      const words = textToWords(text);
      console.log(words)

      if (!ocrType.value.checked) {
        state.importedWords.from = words;
        state.ocrLoading = 2;
      }


      //filter the received results a bit

      // if (!ocrType.value.checked) console.log("should send words directly to parent")
      // else {
      //   if (!importedWords.value.from) importedWords.value.from = [text];
      //   else {
      //     importedWords.value.to = [text];
      //     //send to parent
      //   }
      // }
    }

    return {ocrModal, readUrl, state, img, zoomIn, zoomOut, sendImg, ocrType}
  },
});
</script>

<style scoped>
.confirm-btn {
  position: absolute;
  right: 30px;
  bottom: 20px;
}

.down_left {
  position: absolute;
  left: 30px;
  bottom: 20px;
}
</style>