<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <div v-on-clickaway="closeCollapsible" v-if="value">
    <ul class="collapsible popout" ref="collapsible">
      <li class="rounded">
        <div class="collapsible-header">
          <input type="text" style="width: 49%;" class="word center" v-bind:class="{'non-clickable': state.disabled}"
                 :value="value.from" v-on:input="updateFrom"/>
          <input type="text" style="width:49%;margin-left: 2%" class="word center"
                 v-bind:class="{'non-clickable': state.disabled}" :value="value.to" v-on:input="updateTo"/>
        </div>
        <div class="collapsible-body">
          <!-- hack to prevent collapsible from closing -->
          <span style="visibility: hidden">"</span>
          <div style="margin-top: 10px"></div>

          <i class="material-icons left unselectable tooltipped word-btn" data-tooltip="Remove" @click="playFromAudio"
             style="margin-left: 10px">volume_up</i>
          <i class="material-icons left unselectable tooltipped word-btn" data-tooltip="Remove"
             @click="playToAudio">volume_up</i>
          <i class="material-icons right unselectable tooltipped word-btn" data-tooltip="Remove" @click="remove"
             style="margin-right: 10px; color: #8b0000">close</i>

          <i class="material-icons right unselectable tooltipped word-btn" data-tooltip="Select Image"
             v-if="!value.imgUrl"
             @click="getImage">image</i>
          <div v-else class="right unselectable" style="margin-top: -33px; margin-left: 15px" @click="getImage"><img
              :src="value.imgUrl" style="width: 35px; height: 35px;" class="circle"></div>

          <i class="material-icons right unselectable tooltipped word-btn" data-tooltip="Example Sentences"
             @click="getExamples">format_list_numbered</i>

          <div class="back-container" @click="closeCollapsible" v-if="!state.disabled">
            <i class="material-icons center unselectable tooltipped back-btn" data-tooltip="Close">arrow_upward</i>
          </div>

        </div>
      </li>
    </ul>

  </div>

</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  reactive,
} from "@vue/composition-api";
import M, {Collapsible} from "materialize-css";
import {Word} from "@/gen-types";

export default defineComponent({
  props: {
    value: Object as () => Word //for each inserted word we create a WordItem and pass a reference of the Word (by making use of v-model) to the WordItem
  },
  setup(props, context) {
    const collapsibleInstance = ref<Collapsible>(null);
    const collapsibleElement = ref(null);
    const state = reactive({disabled: true}); //when a WordItem is in its collapsed state it

    const fromAudio = document.createElement("audio");
    fromAudio.src = props.value.fromAudio;
    const toAudio = document.createElement("audio");
    toAudio.src = props.value.toAudio;

    function flipDisabled() {
      state.disabled = !state.disabled
    }

    onMounted(() => {

      //when a user expands a WordItem we remove a click event listener so that the modal does not automatically close once we click on for example an input field
      function activateInputs() {
        collapsibleElement.value.removeEventListener("click", collapsibleInstance.value._handleCollapsibleClickBound);
        flipDisabled();
      }

      collapsibleInstance.value = M.Collapsible.init(collapsibleElement.value, {
        accordion: false,
        onOpenEnd: activateInputs,
        onCloseStart: flipDisabled,
      });

    });

    function closeCollapsible() {
      if (collapsibleInstance) collapsibleInstance.value.close(0);
      collapsibleElement.value.addEventListener("click", collapsibleInstance.value._handleCollapsibleClickBound); //we add the click event listener again
    }

    function remove() {
      context.emit("removeWord", props.value.from)
    }

    function openImgModal() {
      context.emit("openImgModal", props.value)
    }

    function openExamplesModal() {
      context.emit("openExamplesModal", props.value)
    }

    function updateFrom($event) {
      context.emit('input', {from: $event.target.value, to: props.value.to})
    }

    function updateTo($event) {
      context.emit('input', {from: props.value.from, to: $event.target.value})
    }

    function playFromAudio() {
      fromAudio.play();
    }

    function playToAudio() {
      toAudio.play();
    }

    return {
      closeCollapsible,
      state,
      collapsible: collapsibleElement,
      remove,
      getImage: openImgModal,
      getExamples: openExamplesModal,
      updateFrom,
      updateTo,
      playFromAudio,
      playToAudio
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

.non-clickable {
  pointer-events: none;
  user-select: none;
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
</style>