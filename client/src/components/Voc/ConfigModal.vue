<template>
  <div>
    <div id="configuration" class="modal fullscreen-modal" ref="configModalElement">
      <div class="modal-content">
        <i class="material-icons right unselectable close-btn modal-close">close</i>
        <h4 class="center">Configuration 👷‍♀️</h4>
        <p class="flow-text center">Let's configure some things before creating our voc list</p>
        <div class="row">
          <div class="input-field col s12">
            <input id="title" type="text" placeholder="Unsaved Word List"/>
            <label for="title">Title</label>
          </div>

          <div class="big-space-1">
            <div class="input-field col s12 m6">
              <select class="icons" id="fromLang" @change="updateSelect()">
                <option value="null" disabled selected>Choose your Language</option>
                <option value="en" :data-icon="getCountryFlag('united-kingdom')">English</option>
                <option value="fr" :data-icon="getCountryFlag('france')">French</option>
                <option value="it" :data-icon="getCountryFlag('italy')">Italian</option>
                <option value="nl" :data-icon="getCountryFlag('belgium')">Dutch</option>
              </select>
              <label>
                From Language
                <i class="material-icons right unselectable question-btn tooltipped"
                   data-tooltip="The language from which you'd like to translate from. This should be your mother language in most cases"
                >live_help</i>
              </label>
            </div>

            <div class="input-field col s12 m6">
              <select class="icons" id="fromVoice" disabled>
                <option v-for="(voice, index) in state.fromVoices" :key="index" :value="voice.ShortName">
                  {{ voice.DisplayName }} ({{ voice.ShortName.substring(3, 5).toUpperCase() }})
                </option>
              </select>
              <label>From Voice</label>
            </div>
          </div>

          <div class="big-space-2">
            <div class="input-field col s12 m6">
              <select class="icons" id="toLang" @change="updateSelect()">
                <option value="null" disabled selected>Choose your Language</option>
                <option value="en" :data-icon="getCountryFlag('united-kingdom')">English</option>
                <option value="fr" :data-icon="getCountryFlag('france')">French</option>
                <option value="it" :data-icon="getCountryFlag('italy')">Italian</option>
                <option value="nl" :data-icon="getCountryFlag('belgium')">Dutch</option>
              </select>
              <label>To Language<i class="material-icons right unselectable question-btn tooltipped"
                                   data-tooltip="This should be the language you would like to learn">live_help</i>
              </label>
            </div>

            <div class="input-field col s12 m6">
              <select class="icons" id="toVoice" disabled>
                <option v-for="(voice, index) in state.toVoices" :key="index" :value="voice.ShortName">
                  {{ voice.DisplayName }} ({{ voice.ShortName.substring(3, 5).toUpperCase() }})
                </option>
              </select>
              <label>To Voice</label>
            </div>
          </div>

          <div class="col s6 m4">Auto Search Images:</div>
          <div class="col s6 m4">
            <div class="switch">
              <label>
                Off
                <input type="checkbox" checked/>
                <span class="lever"></span>
                On
              </label>
              <i class="material-icons right unselectable question-btn tooltipped"
                 data-tooltip="Automatically search for a matching image after each insertion">live_help</i>
            </div>
          </div>
        </div>
      </div>

      <div class="waves-effect waves-light btn footer-btn disabled" v-on:click="saveConfig" id="continue">Continue
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted, onUpdated,
  reactive, ref,
  watch,
} from "@vue/composition-api";
import M, {Modal} from "materialize-css";
import {useGetVoicesQuery, Voice} from "@/gen-types";
import {useResult} from "@vue/apollo-composable";

interface Voices {
  fromVoices: Voice[];
  toVoices: Voice[];
}

export default defineComponent({
  setup(props, context) {
    const configModalElement = ref(null); //check Create.vue for similar docs
    const configModalInstance = ref<Modal>(null);

    let selects: M.FormSelect[] | null = null;
    let langSettings: string[] = []; //array of length 4: [fromLanguage, fromVoice, toLanguage, toVoice]

    const state = reactive<Voices>({
      fromVoices: [],
      toVoices: []
    })


    const {result} = useGetVoicesQuery(); //we retrieve a list of all possible voices

    onMounted(() => {
      configModalInstance.value = M.Modal.init(configModalElement.value, {inDuration: 0, outDuration: 0});
      M.FormSelect.init(document.querySelectorAll("select"));
      M.Tooltip.init(document.querySelectorAll(".tooltipped"));

      configModalInstance.value.open();
    });

    function getCountryFlag(country: string) {
      return require(`@/assets/country-flags/${country}.svg`);
    }

    //get the value from the selects and send it to Create.vue
    function saveConfig() {
      selects = M.FormSelect.init(document.querySelectorAll("select")); //init the selects again, hack to update the values...
      configModalInstance.value.close();
      langSettings = [];
      for (const select of selects)
        langSettings.push(select.getSelectedValues()[0]);
      context.emit("saveLangSettings", langSettings);
    }

    function updateSelect() {
      selects = M.FormSelect.init(document.querySelectorAll("select")); //init the selects again, hack to update the values...

      //if both languages have been chosen we allow the user to continue
      if (selects[0].getSelectedValues()[0] != "null" && selects[2].getSelectedValues()[0] != "null")
        document.getElementById("continue")!.classList.remove("disabled");


      //if the fromLanguage has ben selected we show all possible voices for that language
      if (selects[0].getSelectedValues()[0]) {
        // document.getElementById("fromVoice").disabled = false;
        state.fromVoices = result.value.getVoices.filter(voice => voice.ShortName.substring(0, 2) == selects[0].getSelectedValues()[0])
      }

      //if the toLanguage has ben selected we show all possible voices for that language
      if (selects[2].getSelectedValues()[0]) {
        // document.getElementById("toVoice").disabled = false;
        state.toVoices = result.value.getVoices.filter(voice => voice.ShortName.substring(0, 2) == selects[2].getSelectedValues()[0])
      }
    }

    onUpdated(() => {
      selects = M.FormSelect.init(document.querySelectorAll("select"));
    })

    return {
      getCountryFlag,
      saveConfig,
      updateSelect,
      state,
      configModalElement
    };
  },
});
</script>

<style scoped>
.question-btn {
  margin-left: 5px;
  top: -2px;
  position: relative;
}

.big-space {
  padding-top: initial;
}

@media only screen and (max-width: 600px) {
  .big-space-1 {
    padding-top: 30%;
  }

  .big-space-2 {
    padding-top: 50%;
  }
}
</style>