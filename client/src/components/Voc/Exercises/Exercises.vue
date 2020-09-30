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
      tabTitles: ['Standard', 'Multiple Choice', "Flashcards"],
      routes: ['standard', 'multiple', "flashcards"],
      text: "Text",
      icon: "translate"
    }, {
      type: "image",
      tabTitles: ['Standard', 'Multiple Choice', "Flashcards"],
      routes: ['standard', 'multiple', "flashcards"],
      text: "Image",
      icon: "image"
    }, {
      type: "audio",
      tabTitles: ['Standard'],
      routes: ['standard'],
      text: "Speech",
      icon: "hearing"
    }
    ]

    return {exerciseMethods}
  },
});
</script>

<style scoped>
</style>