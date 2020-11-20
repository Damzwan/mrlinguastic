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
      <Loader v-if="!imagesLoaded"></Loader>
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

    onMounted(() => {
      modal.value = M.Modal.init(modalElement.value);
    })

    onUnmounted(() => {
      modal.value.destroy();
    })

    watch(() => props.imagesToLoad, () => {
      imagesLoaded.value = false;
    })

    return {imagesLoaded, onImgLoad, modalElement, setUrl, swapImg, getBlobUrl}

  },
});
</script>