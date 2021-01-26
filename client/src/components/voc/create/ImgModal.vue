<template>
  <div class="modal bottom-sheet" ref="modalElement" id="imgModal"
       :style="{backgroundImage: 'url(' + require('../../../assets/triangle2.svg') + ')'}">
    <div class="modal-content" v-if="selectedWord && !selectedWord.img">
      <h5 class="center">🖼 Select an image 🖼</h5>
      <div class="row section" v-show="imagesLoaded">
        <div class="col s4 m2 l1" v-for="(imgUrl, index) in imagesToLoad" :key="index">
          <img :src="imgUrl" :alt="index" @load="onImgLoad" class="circle hoverable centered-img unselectable"
               style="width: 100px;height: 100px; margin-top: 20px" @click="setUrl(imgUrl)">
        </div>
      </div>
      <Loader v-if="!imagesLoaded && imagesToLoad.length > 0"></Loader>
      <div v-if="imagesToLoad.length === 0">
        <h6 class="center">We did not find any matching image 😭</h6>
        <h6 class="center">If you would still like to have an image, please insert a valid image location below</h6>
        <input type="text" class="center" ref="imgUrlInput"
               placeholder="e.g: https://cdn.pixabay.com/photo/2020/08/15/18/26/european-bee-eater-5491117_1280.jpg">
        <i class="material-icons unselectable" @click="setUrl(imgUrlInput.value)" style="color: #26a69a; font-size: 50px; position: absolute; right: 20px">play_arrow</i>
      </div>
    </div>
    <div v-else-if="selectedWord" style="overflow: hidden">
      <h5 class="center">🖼 Selected image 🖼</h5>
      <div class="row section valign-wrapper">
        <div class="col s8 m6 offset-m3">
          <img :src="getBlobUrl(selectedWord.img)" alt="selected image"
               class="centered-img" style="height: 150px">
        </div>
        <div class="col s4 m3 valign-wrapper unselectable" @click="swapImg">
          <i class="material-icons unselectable tooltipped centered-img" data-tooltip="Switch Image"
             style="font-size: 100px; color: gray">swap_vert</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, ref, watch,} from "@vue/composition-api";
import {useSaveImgMutation, Word} from "@/gen-types";
import M from "materialize-css"
import {getBlobUrl} from "@/use/general";
import Loader from "@/components/Loader.vue"
import Modal = M.Modal;
import {setShouldCloseWordDiv, shouldCloseWordDiv} from "@/use/state";

export default defineComponent({
  props: {
    selectedWord: Object() as () => Word,
    imagesToLoad: Array
  },
  components: {
    Loader
  },
  setup(props, ctx) {
    const {mutate: saveImgToServer} = useSaveImgMutation(null);
    const imagesLoaded = ref(false);

    const modalElement = ref<HTMLElement>(null);
    const modal = ref<Modal>(null);

    const imgUrlInput:HTMLInputElement = ref(null);

    let counter = 0;

    //switch a boolean as soon as all images are loaded
    function onImgLoad() {
      counter++;
      if (counter == props.imagesToLoad.length) {
        imagesLoaded.value = true;
        counter = 0;
      }
    }

    //called when the user selects an image
    function setUrl(imgUrl: string) {
      modal.value.close();
      const selectedWord = props.selectedWord;
      selectedWord.img = imgUrl;
      saveImgToServer({img: imgUrl}).then(result => selectedWord.img = result.data.saveImg);
    }

    //the user wants to select a new image
    function swapImg() {
      if (props.selectedWord.img.substring(0, 5) != "https") ctx.emit("remove-blob", props.selectedWord.img)
      props.selectedWord.img = null;
    }

    function enableCloseDiv(){
      setShouldCloseWordDiv(true);
    }

    onMounted(() => {
      modal.value = M.Modal.init(modalElement.value, {onCloseEnd: enableCloseDiv});
    })

    onUnmounted(() => {
      modal.value.destroy();
    })

    watch(() => props.imagesToLoad, () => {
      imagesLoaded.value = false;
    })

    return {imagesLoaded, onImgLoad, modalElement, setUrl, swapImg, getBlobUrl, imgUrlInput}

  },
});
</script>

<style scoped>
::placeholder {
  color: #424242;
}
</style>