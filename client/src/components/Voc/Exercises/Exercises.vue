<template>
  <div>
    <div style="margin-bottom: 10px">
      <h4 class="center-align">🏋️‍♀ Exercises 🏋️‍♀</h4>
      <div class="divider"></div>
    </div>
    <div class="row">
      <ExerciseMethod v-for="(method, index) in exerciseMethods" :key="index"
                      v-bind:exerciseMethod="method"></ExerciseMethod>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted} from "@vue/composition-api";
import ExerciseMethod, {ExerciseMethods} from "@/components/Voc/Exercises/ExerciseMethod.vue";
import M from "materialize-css";


export default defineComponent({
  components: {
    ExerciseMethod
  },
  setup() {
    const exerciseMethods: ExerciseMethods[] = [{
      tabTitles: ['Standard', 'Multiple Choice'],
      routes: ['text-standard', 'text-multiple'],
      text: "Text",
      icon: "translate"
    }, {
      tabTitles: ['Standard', 'Multiple Choice'],
      routes: ['image-standard', 'image-multiple'],
      text: "Image",
      icon: "image"
    }, {
      tabTitles: ['Standard', 'Multiple Choice'],
      routes: ['speech-standard', 'speech-multiple'],
      text: "Speech",
      icon: "hearing"
    }, {
      tabTitles: ['Standard'],
      routes: ['flashcards'],
      text: "Flashcards",
      icon: "flip_to_back"
    }]

    // onMounted(() => {
    //   M.Tabs.init(document.querySelector(".tabs"))
    // })

    return {exerciseMethods}
  },
});
</script>

<style scoped>
</style>