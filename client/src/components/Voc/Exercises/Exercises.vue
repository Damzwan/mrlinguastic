<template>
  <div>
    <div style="margin-bottom: 10px">
      <h4 class="center-align">🏋️‍♀ Exercises 🏋️‍♀</h4>
      <div class="divider"></div>
    </div>
    <div class="row" v-if="exerciseMethods">
      <div v-for="(method, index) in exerciseMethods" :key="index">
        <ExerciseMethod v-bind:exerciseMethod="method"
                        v-if="method.requirements.map(req => req.condition).includes(true)"></ExerciseMethod>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, ref} from "@vue/composition-api";
import ExerciseMethod, {ExerciseMethods} from "@/components/Voc/Exercises/ExerciseMethod.vue";
import {Localdb} from "@/use/localdb";
import {Voclist} from "@/gen-types";
import {isOfflineList} from "@/use/voc";


export default defineComponent({
  components: {
    ExerciseMethod
  },
  setup() {
    const db = inject<Localdb>("db");
    const list = ref<Voclist>(null);
    const exerciseMethods = ref<ExerciseMethods[]>(null)

    function exerciseSetup(providedList: Voclist) {
      list.value = providedList;
      const words = list.value.words;
      const wordsWithImage = list.value.words.filter(word => word.img);
      const wordsWithAudio = list.value.words.filter(word => word.toAudio);

      exerciseMethods.value = [{
        type: "text",
        tabTitles: ['Standard', 'Multiple Choice', "Flashcards"],
        routes: ['standard', 'multiple', "flashcards"],
        text: "Text",
        icon: "translate",
        requirements: [{condition: words.length > 0, message: "ok"}, {
          condition: words.length >= 4,
          message: "voclist not big enough for multiple choice"
        }, {condition: words.length > 0, message: "ok"}]
      }, {
        type: "image",
        tabTitles: ['Standard', 'Multiple Choice', "Flashcards"],
        routes: ['standard', 'multiple', "flashcards"],
        text: "Image",
        icon: "image",
        requirements: [{condition: wordsWithImage.length > 0, message: "not enough words with images"}, {
          condition: wordsWithImage.length >= 4,
          message: "not enough words with images for multiple choice"
        }, {condition: wordsWithImage.length > 0, message: "not enough words with images"}]
      }, {
        type: "audio",
        tabTitles: ['Standard'],
        routes: ['standard'],
        text: "Speech",
        icon: "hearing",
        requirements: [{condition: wordsWithAudio.length > 0, message: "not enough words with audio"}]
      }
      ]
    }

    if (isOfflineList()) db.getItem<Voclist>(localStorage.getItem("_id"), "downloadedVoclists").then(nlist => exerciseSetup(nlist))
    else db.getItem<Voclist>(localStorage.getItem("_id"), "voclists").then(nlist => exerciseSetup(nlist))

    return {exerciseMethods}
  },
});
</script>

<style scoped>
</style>