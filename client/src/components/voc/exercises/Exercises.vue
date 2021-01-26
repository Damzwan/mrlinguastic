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
      <Loader v-else></Loader>
    </div>
</template>

<script lang="ts">
import {defineComponent, inject, ref} from "@vue/composition-api";
import ExerciseMethod, {ExerciseMethods} from "@/components/voc/exercises/ExerciseMethod.vue";
import {Localdb} from "@/use/localdb";
import {Voclist} from "@/gen-types";
import {isLarge, isOfflineList} from "@/use/general";
import Loader from "@/components/Loader.vue"
import {useVoclistUpdater} from "@/use/listUpdater";


export default defineComponent({
      components: {
        ExerciseMethod,
        Loader
      },
      setup() {
        const db = inject<Localdb>("db");
        const list = ref<Voclist>(null);
        const exerciseMethods = ref<ExerciseMethods[]>(null)

        const {updateVoclist} = useVoclistUpdater();

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
            requirements: [{
              condition: wordsWithImage.length > 0 && (isOfflineList() || (!isOfflineList() && navigator.onLine)),
              message: "not enough words with images"
            }, {
              condition: wordsWithImage.length >= 4 && (isOfflineList() || (!isOfflineList() && navigator.onLine)),
              message: "not enough words with images for multiple choice"
            }, {
              condition: wordsWithImage.length > 0 && (isOfflineList() || (!isOfflineList() && navigator.onLine)),
              message: "not enough words with images"
            }]
          }, {
            type: "audio",
            tabTitles: ['Standard'],
            routes: ['standard'],
            text: "Audio",
            icon: "hearing",
            requirements: [{
              condition: wordsWithAudio.length > 0 && navigator.onLine,
              message: "not enough words with audio"
            }]
          }, {
            type: "list",
            tabTitles: ['Standard'],
            routes: ['list'],
            text: "List",
            icon: "format_list_numbered",
            requirements: [{condition: words.length > 0, message: "not enough words"}]
          },
            {
              type: "game",
              tabTitles: ['Space Invader'],
              routes: ['spaceinvader'],
              text: "Games",
              icon: "videogame_asset",
              requirements: [{condition: words.length > 0, message: "not enough words"}]
            },
            {
              type: "definition",
              tabTitles: ['Guess the word'],
              routes: ['guess-the-word'],
              text: "Definitions",
              icon: "directions_bike",
              requirements: [{condition: words.length >= 4 && navigator.onLine, message: "not enough words"}]
            }
          ]
        }

        if (isOfflineList()) db.getItem<Voclist>(localStorage.getItem("_id"), "downloadedVoclists").then(nlist => exerciseSetup(nlist))
        else updateVoclist(localStorage.getItem("_id")).then(voclist => exerciseSetup(voclist))

        return {exerciseMethods, isLarge}
      }
    }
);
</script>

<style scoped>
.divider {
  background-color: black !important;
}

</style>