<template>
  <div class="row rounded z-depth-1">
    <div class="material-icons unselectable" style="right: 30px; position: absolute" @click="removeSentence">close</div>
    <div class="col s12">
      <input type="text" class="no-border-bottom no-margin" placeholder="Hello, my name is Damian"
             :value="value.from" v-bind:class="{'invalid': !value.from.includes(fromWord) && value.from.length > 0}"
             v-on:input="updateFrom" v-on:keyup.enter="focusFirstTranslation(`0${value.from}`)" v-insta-focus/>
      <div class="divider green darken-4"></div>
      <div v-for="(translation, index) in value.to" :key="index">
        <input type="text" class="no-border-bottom" v-insta-focus :id="`${index}${value.from}`"
               placeholder="Bonjour, je m'appelle Damien" :value="translation" v-on:input="updateTo($event, index)"
               v-on:keyup.enter="addSentenceTranslation()"
               v-bind:class="{'invalid': !value.to[index].includes(toWord) && value.to[index].length > 0}"/>
        <i class="material-icons remove-btn unselectable" @click="removeSentenceTranslation(index)" v-if="index > 0">close</i>
      </div>
      <div class="divider"></div>
      <div style="height: 3rem; width: 100%" class="col s12 valign-wrapper">
        <i class="material-icons unselectable tooltipped centered-img" data-tooltip="Add extra Sentence"
           style="font-size: 2.5rem;color: #1b5e20" @click="addSentenceTranslation">add_circle</i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "@vue/composition-api";
import {Sentence} from "@/gen-types";

export default defineComponent({
  props: {
    value: Object as () => Sentence, //for each sentence in the sentences array of a word we create an ExampleItem and pass it a reference of the sentence
    fromWord: String, // we also pass the fromWord to check whether a created sentence contains the fromWord
    toWord: String // we also pass the toWord to check whether a created sentence contains the toWord
  },
  setup(props, context) {

    //add a possible sentence translation for this sentence. This will automatically create an input field and focus on it
    function addSentenceTranslation() {
      props.value.to.push("");
    }

    function removeSentenceTranslation(index: number) {
      props.value.to.splice(index, 1);
    }

    function removeSentence() {
      context.emit("removeSentence", props.value)
    }

    function updateFrom($event) {
      context.emit('input', {from: $event.target.value, to: props.value.to})
    }

    function updateTo($event, index: number) {
      const to = props.value.to;
      to[index] = $event.target.value
      context.emit('input', {from: props.value.from, to: to})
    }

    //if a user has entered a fromSentence and presses enter we will focus on the first sentence translation
    function focusFirstTranslation(id: string) {
      if (id.length == 1) return;
      document.getElementById(id).focus();
    }

    return {
      addSentenceTranslation,
      removeSentenceTranslation,
      removeSentence,
      updateFrom,
      updateTo,
      focusFirstTranslation,
    }
  },
});
</script>


<style scoped>
.no-border-bottom {
  border-bottom: none !important;
}

.no-margin {
  margin: 0 0 0 0 !important;
}

.remove-btn {
  position: absolute;
  right: 35px;
  margin-top: 12px;
}

</style>
