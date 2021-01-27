<template>
  <div v-on-clickaway="closeCollapsible" @click="selectWord">
    <ul class="collapsible popout" ref="collapsible">
      <li class="rounded" style="background-color: #ead9a1">
        <div class="collapsible-header" style="background-color: #ead9a1">
          <input type="text" style="width: 49%;" class="word center" v-bind:class="{'non-clickable': state.disabled}"
                 v-on:input="updateFrom" :value="word.from"/>
          <input type="text" style="width:49%;margin-left: 2%" class="word center"
                 v-bind:class="{'non-clickable': state.disabled}" :value="word.to" v-on:input="updateTo"/>
        </div>
        <div class="collapsible-body">
          <!-- hack to prevent collapsible from closing -->
          <span style="visibility: hidden">"</span>
          <div style="margin-top: 10px"></div>

          <i class="material-icons left unselectable word-btn" style="margin-left: 10px"
             @click="playToAudio">volume_up</i>
          <i class="material-icons right unselectable word-btn" @click="remove"
             style="margin-right: 10px; color: #8b0000">close</i>

          <a href="#imgModal" class="modal-trigger" @click="setShouldCloseWordDiv(false)">
            <i class="material-icons right unselectable word-btn" style="color: black"
               v-if="!word.img"
               @click="fillImgModal">image</i>
            <div v-else class="right unselectable" style="margin-top: -33px; margin-left: 15px" @click="fillImgModal">
              <img
                  :src="getBlobUrl(word.img)" style="width: 35px; height: 35px;" class="circle"
                  alt="img not available"></div>
          </a>

          <a href="#exampleModal" class="modal-trigger" @click="setShouldCloseWordDiv(false)">
            <i class="material-icons right unselectable word-btn"
               style="color: black">format_list_numbered</i>
          </a>

          <div class="back-container" @click="closeCollapsible" v-if="!state.disabled">
            <i class="material-icons center unselectable back-btn">arrow_upward</i>
          </div>
        </div>
      </li>
    </ul>

  </div>

</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, reactive, ref, watch,} from "@vue/composition-api";
import M, {Collapsible} from "materialize-css";
import {useGetExamplesQuery, useGetImagesQuery, useSaveImgMutation, Word} from "@/gen-types";
import {getBlobUrl, getLang} from "@/use/general";
import {decrementWordsLoading, incrementWordsLoading, setShouldCloseWordDiv, shouldCloseWordDiv} from "@/use/state";
import {useGetImagesQueryLazy, useTranslateWordQueryLazy} from "@/use/lazyQueries";

export default defineComponent({
  props: {
    word: Object as () => Word,
    fromLang: String, //TODO this is really stupid (related to executeImageSearch and importedWords).
    toLang: String,
    imgSearch: Boolean
  },
  setup(props, context) {
    const collapsibleInstance = ref<Collapsible>(null);
    const collapsibleElement = ref(null);
    const state = reactive({disabled: true}); //when a Word is in its collapsed state it
    const toAudio = document.createElement("audio");
    let savedImgs = null;
    let requestsWaiting = 0;

    const {mutate: saveImgToServer} = useSaveImgMutation(null);

    if (props.word.sentences.length == 1 && props.word.sentences[0].from == "") {
      incrementWordsLoading();
      requestsWaiting++;
      const {result: examples} = useGetExamplesQuery({
        fromLang: getLang(props.fromLang),
        toLang: getLang(props.toLang),
        from: props.word.from,
        to: props.word.to
      });

      watch(examples, () => {
        props.word.sentences = examples.value.getExamples;
        decrementWordsLoading();
        requestsWaiting--;
      })
    }

    const {result: imgUrlsLazy, load: executeLazyImageSearch} = useGetImagesQueryLazy();

    if (!props.word.img && props.imgSearch) getImagesLazy().then(async () => {
      if (savedImgs.length > 0) {
        props.word.img = savedImgs[0]
        const res = await saveImgToServer({img: savedImgs[0]});
        props.word.img = res.data.saveImg;
      }
    })

    function flipDisabled() {
      state.disabled = !state.disabled
    }

    onMounted(() => {
      //when a user expands a WordItem we remove a click event listener so that the modal does not automatically close once we click on for example an input field
      function activateInputs() {
        const hack = collapsibleInstance.value as any;
        collapsibleElement.value.removeEventListener("click", hack._handleCollapsibleClickBound);
        flipDisabled();
      }

      collapsibleInstance.value = M.Collapsible.init(collapsibleElement.value, {
        accordion: false,
        onOpenEnd: activateInputs,
        onCloseStart: flipDisabled,
      });
    });

    onUnmounted(() => {
      collapsibleInstance.value.destroy();
    })

    async function getImagesLazy() {
      executeLazyImageSearch(null, {word: props.word.from, lang: props.fromLang});

      //request already cached...
      if (!imgUrlsLazy.value) {
        incrementWordsLoading();
        requestsWaiting++;
      }

      return await new Promise(resolve => {
        watch(imgUrlsLazy, () => {
          savedImgs = imgUrlsLazy.value.getImages;
          decrementWordsLoading();
          requestsWaiting--;
          resolve();
        })

      })
    }

    function closeCollapsible() {
      if (!shouldCloseWordDiv.value) return;
      if (collapsibleInstance) collapsibleInstance.value.close(0);
      const hack = collapsibleInstance.value as any;
      collapsibleElement.value.addEventListener("click", hack._handleCollapsibleClickBound); //we add the click event listener again
    }

    function remove() {
      context.emit("remove-word", props.word.from)
      for (let i = 0; i < requestsWaiting; i++) decrementWordsLoading();
    }

    async function fillImgModal() {
      if (!savedImgs) await getImagesLazy();
      context.emit("fill-img-modal", savedImgs)
    }

    function selectWord() {
      context.emit("select-word", props.word);
    }

    function updateFrom($event) {
      props.word.from = $event.target.value;
    }

    function updateTo($event) {
      props.word.to = $event.target.value;
    }

    function playToAudio() {
      toAudio.src = props.word.toAudio;
      toAudio.play();
    }

    return {
      closeCollapsible,
      state,
      collapsible: collapsibleElement,
      remove,
      fillImgModal,
      updateFrom,
      updateTo,
      playToAudio,
      getBlobUrl,
      selectWord,
      setShouldCloseWordDiv
    };
  },
});
</script>

<style scoped>
.word {
  height: 1.5rem !important;
  margin-bottom: 0 !important;
}

.collapsible.popout > li {
  margin: 0 6px;
}

.rounded {
  padding: 3px;
  border-radius: 10px;
}

.collapsible-header {
  border-bottom: 0;
}

.collapsible-body {
  border-bottom: 0;
  box-sizing: border-box;
  padding: 0;
}

.word-btn {
  font-size: 35px;
  margin-top: -30px;
}

.back-container {
  position: absolute;
  overflow: hidden;
  left: 50%;
  transform: translate(-50%, -90%);
}

.back-btn {
  transform: translate(0%, 50%);
  color: darkgray;
  font-size: 35px;
}

.non-clickable {
  pointer-events: none;
  user-select: none;
}
</style>