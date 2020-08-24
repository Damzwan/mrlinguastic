<template>
  <div>
    <div id="configuration" class="modal fullscreen-modal" ref="configModalElement">
      <div class="modal-content">
        <i class="material-icons right unselectable close-btn modal-close">close</i>
        <h4 class="center">Configuration 👷‍♀️</h4>
        <p class="flow-text center">Let's configure some things before creating our voc list</p>
        <div class="row">
          <div class="input-field col s12">
            <input type="text" id="title" v-model="settings.title"
                   placeholder="Unsaved Word List"/>
            <label for="title">Title</label>
          </div>

          <div class="input-field col s12">
            <textarea id="description" class="materialize-textarea" v-model="settings.description"></textarea>
            <label for="description">Some information about the list</label>
          </div>

          <div class="big-space-1">
            <div class="input-field col s12 m6">
              <select class="icons" ref="fromLangElement" v-model="settings.langSettings.fromLang">
                <option value="" disabled selected>Choose your Language</option>
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
              <select class="icons" disabled ref="fromVoiceElement" v-model="settings.langSettings.fromVoice">
                <option v-for="(voice, index) in voices.fromVoices" :key="index" :value="voice.ShortName">
                  {{ voice.DisplayName }} ({{ voice.ShortName.substring(3, 5).toUpperCase() }})
                </option>
              </select>
              <label>From Voice</label>
            </div>
          </div>

          <div class="big-space-2">
            <div class="input-field col s12 m6">
              <select class="icons" ref="toLangElement" v-model="settings.langSettings.toLang">
                <option value="" disabled selected>Choose your Language</option>
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
              <select class="icons" disabled ref="toVoiceElement" v-model="settings.langSettings.toVoice">
                <option v-for="(voice, index) in voices.toVoices" :key="index" :value="voice.ShortName">
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
  reactive, Ref, ref, UnwrapRef,
  watch,
} from "@vue/composition-api";
import M, {Modal} from "materialize-css";
import {useGetVoicesQuery, VoclistSettings, Voice} from "@/gen-types";
import {useResult} from "@vue/apollo-composable";

interface Voices {
  fromVoices: Voice[];
  toVoices: Voice[];
}

export default defineComponent({
  props: {
    prevSettings: Object as () => VoclistSettings
  },
  setup(props, context) {
    const configModalElement = ref(null); //check Create.vue for similar docs
    const configModalInstance = ref<Modal>(null);

    const fromLangElement = ref<HTMLSelectElement>(null)
    const toLangElement = ref<HTMLSelectElement>(null)

    const fromVoiceElement = ref<HTMLSelectElement>(null);
    const toVoiceElement = ref<HTMLSelectElement>(null);

    const settings = reactive<VoclistSettings>({
      title: "",
      description: "",
      langSettings: {fromLang: "", fromVoice: "", toLang: "", toVoice: ""}
    })

    const voices = reactive<Voices>({
      fromVoices: [],
      toVoices: []
    })

    const {result} = useGetVoicesQuery(); //we retrieve a list of all possible voices

    function fillSettings() {
      settings.title = "update"; //active the onUpdated event
    }

    onMounted(() => {
      configModalInstance.value = M.Modal.init(configModalElement.value, {inDuration: 0, outDuration: 0});
      M.FormSelect.init(document.querySelectorAll("select"));
      M.Tooltip.init(document.querySelectorAll(".tooltipped"));

      if (!props.prevSettings) configModalInstance.value.open();
      else fillSettings()
    });

    function getCountryFlag(country: string) {
      return require(`@/assets/country-flags/${country}.svg`);
    }

    //get the value from the selects and send it to Create.vue
    function saveConfig() {
      configModalInstance.value.close();
      context.emit("saveSettings", settings);
    }

    function enableBtn() {
      document.getElementById("continue")!.classList.remove("disabled");
    }

    watch(() => settings.langSettings.fromLang, () => {
      if (props.prevSettings) return;
      fromVoiceElement.value.disabled = false;
      voices.fromVoices = result.value.getVoices.filter(voice => voice.ShortName.substring(0, 2) == settings.langSettings.fromLang)
      if (settings.langSettings.fromLang != "" && settings.langSettings.toLang != "") enableBtn()
    })

    watch(() => settings.langSettings.toLang, () => {
      if (props.prevSettings) return;
      toVoiceElement.value.disabled = false;
      voices.toVoices = result.value.getVoices.filter(voice => voice.ShortName.substring(0, 2) == settings.langSettings.toLang)
      if (settings.langSettings.fromLang && settings.langSettings.toLang) enableBtn()
    })

    onUpdated(() => {

      //I don't know why this is not possible in the fillSettings function
      if (props.prevSettings && !fromLangElement.value.disabled) {
        fromLangElement.value.disabled = true;
        toLangElement.value.disabled = true;

        voices.fromVoices = [{
          ShortName: props.prevSettings.langSettings.fromVoice,
          DisplayName: props.prevSettings.langSettings.fromVoice.substring(props.prevSettings.langSettings.fromVoice.lastIndexOf("-") + 1)
        }]
        voices.toVoices = [{
          ShortName: props.prevSettings.langSettings.toVoice,
          DisplayName: props.prevSettings.langSettings.toVoice.substring(props.prevSettings.langSettings.toVoice.lastIndexOf("-") + 1)
        }]

        Object.assign(settings, props.prevSettings);
        fromLangElement.value.value = settings.langSettings.fromLang; //stupid hack
        toLangElement.value.value = settings.langSettings.toLang; // stupid hack

        M.FormSelect.init(document.querySelectorAll("select"));
        enableBtn()
      }

      if (voices.fromVoices.length > 0) {
        M.FormSelect.init(fromVoiceElement.value);
        settings.langSettings.fromVoice = voices.fromVoices[0].ShortName
      }

      if (voices.toVoices.length > 0) {
        M.FormSelect.init(toVoiceElement.value);
        settings.langSettings.toVoice = voices.toVoices[0].ShortName
      }
    })

    return {
      getCountryFlag,
      saveConfig,
      voices,
      configModalElement,
      fromVoiceElement,
      toVoiceElement,
      fromLangElement,
      toLangElement,
      settings
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