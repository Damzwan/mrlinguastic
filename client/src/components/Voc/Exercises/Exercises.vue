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
import {defineComponent} from "@vue/composition-api";
import ExerciseMethod, {ExerciseMethods} from "@/components/Voc/Exercises/ExerciseMethod.vue";


export default defineComponent({
  components: {
    ExerciseMethod
  },
  setup() {
    const exerciseMethods: ExerciseMethods[] = [{
      type: "text",
      tabTitles: ['Standard', 'Multiple Choice'],
      routes: ['standard', 'multiple'],
      text: "Text",
      icon: "translate"
    }, {
      type: "image",
      tabTitles: ['Standard', 'Multiple Choice'],
      routes: ['standard', 'multiple'],
      text: "Image",
      icon: "image"
    }, {
      type: "audio",
      tabTitles: ['Standard', 'Multiple Choice'],
      routes: ['standard', 'multiple'],
      text: "Speech",
      icon: "hearing"
    }, {
      type: "flashcard",
      tabTitles: ['Standard'],
      routes: ['flashcards'],
      text: "Flashcards",
      icon: "flip_to_back"
    }]

    return {exerciseMethods}
  },
});
</script>

<style scoped>
</style>