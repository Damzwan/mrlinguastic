<template>
  <div>
    <div class="modal fullscreen-modal" ref="pdfModal" id="pdfModal">
      <div class="modal-content" style="height: 100%">
        <i class="material-icons right unselectable close-btn modal-close">close</i>
        <h3 class="center">Export to Flashcards</h3>
        <p class="flow-text center">Let's create some flashcards containing the words from <b>{{
            list.settings.title
          }}</b>
          First select how you want the flashcards to look like, then press on the button below.</p>
        <div class="divider"></div>

        <div class="section row">
          <div class="input-field col m6 s12">
            <select v-model="state.displayFront">
              <option value="1">{{ getLang(list.settings.langSettings.fromLang) }}</option>
              <option value="2">{{ getLang(list.settings.langSettings.toLang) }}</option>
              <option value="3">Image</option>
              <option value="4">Image + {{ getLang(list.settings.langSettings.fromLang) }}</option>
              <option value="5">Image + {{ getLang(list.settings.langSettings.toLang) }}</option>
            </select>
            <label>Front Of Flashcard</label>
          </div>

          <div class="input-field col m6 s12">
            <select v-model="state.displayBack">
              <option value="0">Nothing</option>
              <option value="1">{{ getLang(list.settings.langSettings.fromLang) }}</option>
              <option value="2">{{ getLang(list.settings.langSettings.toLang) }}</option>
              <option value="3">Image</option>
              <option value="4">Image + {{ getLang(list.settings.langSettings.fromLang) }}</option>
              <option value="5">Image + {{ getLang(list.settings.langSettings.toLang) }}</option>
            </select>
            <label>Back Of Flashcard</label>
          </div>
        </div>

        <div class=row>
          <div class="input-field col m2 s4">
            <input id="rows" type="text" v-model="state.displayRows">
            <label class="active" for="rows">Rows</label>
          </div>
          <div class="input-field col m2 s4">
            <input id="columns" type="text" v-model="state.displayCols">
            <label class="active" for="columns">Columns</label>
          </div>
          <div class="input-field col m2 s4">
            <input id="cardFont" type="text" v-model="state.displaySize">
            <label class="active" for="cardFont">Font Size</label>
          </div>
        </div>

        <div class="waves-effect waves-light btn footer-btn" v-on:click="generatePdf" id="continue">Generate pdf!</div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent, onMounted, reactive, ref, watch,} from "@vue/composition-api";
import M from "materialize-css";

import {jsPDF} from "jspdf";
import {Voclist, Word} from "@/gen-types";
import {getLang} from "@/use/general";
import Modal = M.Modal;
import {getBlobUrl} from "@/use/general";

export interface State {
  displayFront: string,
  front: ComputedRef<number>,
  displayBack: string,
  back: ComputedRef<number>,
  displayCols: string,
  cols: ComputedRef<number>,
  displayRows: string,
  rows: ComputedRef<number>,
  displaySize: string,
  size: ComputedRef<number>
}

export default defineComponent({
  props: {
    list: Object as () => Voclist
  },
  setup(props, context) {
    const pdfModal = ref(null)
    const pdfModalInstance = ref<Modal>(null);

    const state = reactive<State>({
      front: computed(() => parseInt(state.displayFront)),
      back: computed(() => parseInt(state.displayBack)),
      cols: computed(() => parseInt(state.displayCols)),
      rows: computed(() => parseInt(state.displayRows)),
      size: computed(() => parseInt(state.displaySize)),
      displayFront: "1",
      displayBack: "0",
      displayCols: "3",
      displayRows: "5",
      displaySize: "22"
    })

    onMounted(() => {
      pdfModalInstance.value = M.Modal.init(pdfModal.value);
      M.FormSelect.init(document.querySelectorAll('select'));
    })

    watch(props, () => M.FormSelect.init(document.querySelectorAll('select')))

    //TODO garbage code xd
    const w = 210;
    const h = 297;

    function generatePdf() {
      const doc = new jsPDF();
      drawAllWords(doc, props.list.words).then(x => {
        doc.save(props.list.settings.title)
      });
    }

    async function drawAllWords(doc, words: Word[]) {
      let pageWords = [];
      for (let i = 0; i <= words.length; i++) {
        if ((i % (state.rows * state.cols)) == 0 && i != 0) {
          await (drawHandler("front", words, doc));
          doc.addPage();
          if (state.back != 0) {
            await (drawHandler("back", words, doc));
            doc.addPage();
          }
          pageWords = [];
        }
        if (i != words.length) pageWords.push(words[i]);
      }
      await (drawHandler("front", pageWords, doc));
      if (state.back != 0) {
        doc.addPage();
        await (drawHandler("back", pageWords, doc));
      }
    }

    async function drawHandler(side: string, words: Word[], doc) {
      drawLines(doc);
      const val = side == "front" ? state.front : state.back;
      if (val <= 2) {
        if (side == "front") drawWords(doc, words.map(word => word.from), 0, false);
        else drawWords(doc, words.map(word => word.to), state.cols - 1, false);
      } else if (val == 3) {
        if (side == "front") await (drawImages(doc, words.map(word => word.img), 0, true))
        else await (drawImages(doc, words.map(word => word.img), state.cols - 1, true))
      } else {
        if (side == "front") {
          drawWords(doc, words.map(word => word.from), 0, true);
          await (drawImages(doc, words.map(word => word.img), 0, false))
        } else {
          drawWords(doc, words.map(word => word.to), state.cols - 1, true);
          await (drawImages(doc, words.map(word => word.img), state.cols - 1, false))
        }
      }
    }

    function drawLines(doc) {
      doc.setLineDash([5, 5], 0);
      for (let i = 1; i < state.rows; i++) {
        doc.line(0, i * (h / state.rows), w, i * (h / state.rows))
      }

      for (let i = 1; i < state.cols; i++) {
        doc.line(i * (w / state.cols), 0, i * (w / state.cols), h)
      }
    }

    function drawWords(doc, words, cheat, image_included) {
      const y_ratio = image_included ? 0.4 : 0; //used to move the word down a bit for image + word
      const fontSize = doc.internal.getFontSize();
      for (let i = 0; i < state.rows; i++) {
        for (let j = 0; j < state.cols; j++) {
          const word = words.shift();
          if (word == null) return;
          const txtWidth = doc.getStringUnitWidth(word) * fontSize / doc.internal.scaleFactor;
          doc.text(word, (((2 * Math.abs(cheat - j) + 1) * (w / state.cols)) - txtWidth) / 2, (((2 * i + 1) * (h / state.rows)) / 2) + (y_ratio * (h / state.rows)))
        }
      }
    }

    async function drawImages(doc, images, cheat, big) {
      const img_width = big ? 0.85 * (w / state.cols) : 0.7 * (w / state.cols);
      const img_height = big ? 0.85 * (h / state.rows) : 0.7 * (h / state.rows);
      const y_ratio = big ? 0 : 0.1; //used to move the image up a bit for image + word
      for (let i = 0; i < state.rows; i++) {
        for (let j = 0; j < state.cols; j++) {
          const imgsrc: string = images.shift();
          if (imgsrc == null) continue;
          const url = imgsrc.substring(0, 4) == "data" ? imgsrc : getBlobUrl(imgsrc);
          doc.addImage(url, "PNG", ((2 * Math.abs(cheat - j) + 1) * (w / state.cols) - img_width) / 2, (((2 * i + 1) * (h / state.rows) - img_height) / 2) - (y_ratio * (h / state.rows)), img_width, img_height);
        }
      }
    }

    return {pdfModal, getLang, generatePdf, state}
  },
});
</script>

<style scoped>
@media only screen and (min-width: 600px) {
  .fullscreen-modal {
    width: 55% !important;
    height: initial !important;
    max-height: 70% !important;
    top: initial !important;
  }
}
</style>