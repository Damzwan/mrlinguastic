<template>
  <div>
    <div id="configuration" class="modal fullscreen-modal">
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

      <div class="waves-effect waves-light btn confirm-btn disabled" id="continue" v-on:click="saveConfig">Continue
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
    let configModal: Modal | null = null;
    let selects: M.FormSelect[] | null = null;
    let langSettings: string[] | null = null;

    // const fromVoices = ref<Voice[]>([]);
    // const toVoices = ref<Voice[]>([]);

    const state = reactive<Voices>({
      fromVoices: [],
      toVoices: []
    })


    const {result} = useGetVoicesQuery();

    onMounted(() => {
      M.Modal.init(document.querySelectorAll(".modal"), {inDuration: 0});
      M.FormSelect.init(document.querySelectorAll("select"));
      M.Tooltip.init(document.querySelectorAll(".tooltipped"));

      configModal = M.Modal.getInstance(document.querySelectorAll("#configuration")[0]);
      configModal.open();
    });

    function getCountryFlag(country: string) {
      return require(`@/assets/country-flags/${country}.svg`);
    }

    function saveConfig() {
      selects = M.FormSelect.init(document.querySelectorAll("select"));
      if (configModal) configModal.close();
      langSettings = [];
      for (const select of selects)
        langSettings.push(select.getSelectedValues()[0]);
      context.emit("saveLangSettings", langSettings);
    }

    //TODO replace with template code
    function openModal() {
      if (configModal) configModal.open();
    }

    function updateSelect() {
      selects = M.FormSelect.init(document.querySelectorAll("select"));

      if (selects[0].getSelectedValues()[0] != "null" && selects[2].getSelectedValues()[0] != "null")
        document.getElementById("continue")!.classList.remove("disabled");

      if (selects[0].getSelectedValues()[0]) {
        document.getElementById("fromVoice").disabled = false;
        state.fromVoices = result.value.getVoices.filter(voice => voice.ShortName.substring(0, 2) == selects[0].getSelectedValues()[0])
      }

      if (selects[2].getSelectedValues()[0]) {
        document.getElementById("toVoice").disabled = false;
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
      state
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

.confirm-btn {
  position: absolute;
  right: 2%;
  bottom: 2%;
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