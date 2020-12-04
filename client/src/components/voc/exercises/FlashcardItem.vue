<template>
  <div class="carousel-item" style="cursor: pointer"
       :class="{'text-card': type === 'text', 'img-card': type === 'image'}" @click="cardClicked($event)">

    <transition name="flip">
      <div style="height: 400px;background-color: #ead9a1" class="z-depth-2" v-if="type === 'text'"
           v-bind:key="triggerAnimation">
        <p class="center" style="font-size: 2.5rem; padding-top: 50px">{{ flipped ? word.to : word.from }}</p>
        <div style="position: absolute; bottom: -100px; right: 5px">
          <a href="#exampleModal" class="modal-trigger" style="color: black"><i class="material-icons card-icon">format_list_numbered</i></a>
          <a href="#infoModal" class="modal-trigger" style="color: black;">
            <i class="material-icons card-icon">info_outline</i>
          </a>
          <i class="material-icons unselectable card-icon" @click="playAudio(word.toAudio)">volume_up</i>
        </div>
      </div>
    </transition>


    <div v-if="type === 'image'" @click="cardClicked($event)">
      <img :src="!isOfflineList() ? getBlobUrl(word.img) : word.img" alt="no image :(((" width="100%">
    </div>
  </div>
</template>

<script lang="ts">


import {defineComponent, onMounted, onUnmounted, ref, watch} from "@vue/composition-api";
import {Word} from "@/gen-types";
import {getBlobUrl, isOfflineList} from "@/use/general";


export default defineComponent({
  props: {
    word: Object as () => Word,
    globalIndex: Number,
    index: Number
  },
  setup(props, ctx) {
    const flipped = ref(false);
    const triggerAnimation = ref(false);
    const type = localStorage.getItem("exerciseType");


    function cardClicked(e: Event) {
      const target: any = e.target
      if (target.classList.contains("card-icon") || props.globalIndex != props.index) return;
      flipped.value = !flipped.value;
      triggerAnimation.value = !triggerAnimation.value;
      ctx.emit("show-translation")
    }

    const audio = new Audio();

    function playAudio(url: string) {
      audio.src = url;
      audio.play();
    }

    watch(props, (newProps) => {
      if (newProps.globalIndex != props.index) {
        flipped.value = false;
      }
    })

    document.addEventListener("cycle", function () {
      flipped.value = true;
    })

    function handleKeyup(e: any) {
      if (props.globalIndex == props.index && (e.key == "ArrowUp" || e.key == "ArrowDown")) cardClicked(e);
    }

    onMounted(() => {
      document.addEventListener("keyup", handleKeyup);
    })

    onUnmounted(() => {
      document.removeEventListener("keyup", handleKeyup);
    })

    return {getBlobUrl, isOfflineList, cardClicked, playAudio, flipped, type, triggerAnimation}
  },
});
</script>

<style scoped>

@media only screen and (max-width: 600px) {
  .text-card {
    width: 275px !important;
  }

  .img-card {
    width: 275px !important;
  }
}

@media only screen and (max-width: 992px) and (min-width: 600px) {
  .text-card {
    width: 400px !important;
  }

  .img-card {
    width: 400px !important;
  }
}

@media only screen and (min-width: 992px) {
  .text-card {
    width: 700px !important;
  }

  .img-card {
    width: 400px !important;
  }
}

.card-icon {
  margin-left: 5px;
  font-size: 35px;
}

.flip-enter-active {
  transition: all 0.8s ease;
}

.flip-leave-active {
  display: none;
}

.flip-enter, .flip-leave {
  transform: rotateY(180deg);
  opacity: 0;

}

</style>