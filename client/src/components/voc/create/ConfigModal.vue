<template>
  <div>
    <div id="configModal" class="modal fullscreen-modal" ref="modalElement"
         :style="{backgroundImage: 'url(' + require('../../../assets/triangle2.svg') + ')'}">
      <div class="modal-content">
        <i class="material-icons right unselectable close-btn modal-close"
           @click="!listAlreadyCreated() ? $router.push('/') : null">close</i>
        <h4 class="center">Configuration 👷‍♀️</h4>
        <p class="flow-text center">Let's configure some things before creating our voc list</p>
        <div class="row">
          <div class="input-field col s12">
            <input type="text" id="title" v-model="settings.title"
                   placeholder="Unsaved Word List"/>
            <label for="title" class="active">Title</label>
          </div>

          <div class="input-field col s12">
            <textarea id="description" class="materialize-textarea" v-model="settings.description"></textarea>
            <label for="description" class="active">Some information about the list</label>
          </div>

          <div class="big-space-1">
            <div class="input-field col s12 m6">
              <select class="icons" ref="fromLangElement" v-model="settings.langSettings.fromLang">
                <option value="" disabled selected>Choose your Language</option>
                <option value="en" :data-icon="getCountryFlag('united-kingdom')">English</option>
                <option value="fr" :data-icon="getCountryFlag('france')">French</option>
                <option value="it" :data-icon="getCountryFlag('italy')">Italian</option>
                <option value="nl" :data-icon="getCountryFlag('netherlands')">Dutch</option>
              </select>
              <label>
                From Language
                <i class="material-icons right unselectable question-btn tooltipped"
                   data-tooltip="The language from which you'd like to translate from. This should be your mother language in most cases"
                >live_help</i>
              </label>
            </div>

          </div>

          <div class="big-space-2">
            <div class="input-field col s12 m6">
              <select class="icons" ref="toLangElement" v-model="settings.langSettings.toLang">
                <option value="" disabled selected>Choose your Language</option>
                <option value="en" :data-icon="getCountryFlag('united-kingdom')">English</option>
                <option value="fr" :data-icon="getCountryFlag('france')">French</option>
                <option value="it" :data-icon="getCountryFlag('italy')">Italian</option>
                <option value="nl" :data-icon="getCountryFlag('netherlands')">Dutch</option>
              </select>
              <label>To Language<i class="material-icons right unselectable question-btn tooltipped"
                                   data-tooltip="This should be the language you would like to learn">live_help</i>
              </label>
            </div>

            <div class="input-field col s12 m6">
              <select class="icons" disabled ref="voiceElement" v-model="settings.langSettings.toVoice">
                <option v-for="(voice, index) in toVoices" :key="index" :value="voice.ShortName">
                  {{ voice.DisplayName }} ({{ voice.ShortName.substring(3, 5).toUpperCase() }})
                </option>
              </select>
              <label>Voice</label>
            </div>
          </div>
        </div>
      </div>

      <div class="waves-effect waves-light btn footer-btn disabled" v-on:click="createList" id="continue">Continue
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, onUpdated, ref, watch,} from "@vue/composition-api";
import M, {Modal} from "materialize-css";
import {useGetVoicesQuery, VoclistSettings, Voice} from "@/gen-types";
import FormSelect = M.FormSelect;
import Tooltip = M.Tooltip;

export default defineComponent({
  props: {
    settings: Object as () => VoclistSettings
  },
  setup(props, context) {
    const modalElement = ref(null); //check Create.vue for similar docs
    const modal = ref<Modal>(null);

    const selects = ref<FormSelect[]>(null);
    const tooltips = ref<Tooltip[]>(null);

    const fromLangElement = ref<HTMLSelectElement>(null)
    const toLangElement = ref<HTMLSelectElement>(null)

    const voiceElement = ref<HTMLSelectElement>(null);

    const voices = ref<Voice[]>([]);

    const {result} = useGetVoicesQuery(); //we retrieve a list of all possible voices

    onMounted(() => {
      modal.value = M.Modal.init(modalElement.value, {inDuration: 0, outDuration: 0});
      selects.value = M.FormSelect.init(document.querySelectorAll("select"));
      tooltips.value = M.Tooltip.init(document.querySelectorAll(".tooltipped"));

      if (!listAlreadyCreated()) modal.value.open();
      else {
        voices.value = [{
          DisplayName: props.settings.langSettings.toVoice.substring(6),
          ShortName: props.settings.langSettings.toVoice
        }];
        document.getElementById("continue")!.classList.remove("disabled");
      }
    });

    onUnmounted(() => {
      modal.value.close();
      modal.value.destroy();
      // if (selects.value) selects.value.forEach(select => select.destroy())
      if (tooltips.value) tooltips.value.forEach(tooltip => tooltip.destroy())
    })

    //TODO should destroy xd
    function getCountryFlag(country: string) {
      return require(`@/assets/country-flags/${country}.svg`);
    }

    function createList() {
      modal.value.close();
      context.emit("create-list");
    }

    function enableBtn() {
      document.getElementById("continue")!.classList.remove("disabled");
    }

    function enableVoiceSelect() {
      voiceElement.value.disabled = false;
      voices.value = result.value.getVoices.filter(voice => voice.ShortName.substring(0, 2) == props.settings.langSettings.toLang);
    }

    function listAlreadyCreated() {
      return localStorage.getItem("_id") != null;
    }


    watch(() => props.settings.langSettings.fromLang, () => {
      if (props.settings.langSettings.fromLang && props.settings.langSettings.toLang) enableBtn()
    })

    watch(() => props.settings.langSettings.toLang, () => {
      if (props.settings.langSettings.fromLang && props.settings.langSettings.toLang) enableBtn()
      enableVoiceSelect()
    })

    onUpdated(() => {
      if (voices.value.length > 0) {
        M.FormSelect.init(voiceElement.value);
        props.settings.langSettings.toVoice = voices.value[0].ShortName
      } else if (listAlreadyCreated()) M.FormSelect.init(voiceElement.value);

    })

    return {
      getCountryFlag,
      createList,
      modalElement,
      voiceElement,
      fromLangElement,
      toLangElement,
      toVoices: voices,
      listAlreadyCreated
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

@media only screen and (max-width: 600px) {
  .big-space-1 {
    padding-top: 30%;
  }

  .big-space-2 {
    padding-top: 50%;
  }
}

label {
  color: #424242;
}

input:not([type]):disabled, input:not([type])[readonly="readonly"], input[type="text"]:not(.browser-default):disabled, input[type="text"]:not(.browser-default)[readonly="readonly"], input[type="password"]:not(.browser-default):disabled, input[type="password"]:not(.browser-default)[readonly="readonly"], input[type="email"]:not(.browser-default):disabled, input[type="email"]:not(.browser-default)[readonly="readonly"], input[type="url"]:not(.browser-default):disabled, input[type="url"]:not(.browser-default)[readonly="readonly"], input[type="time"]:not(.browser-default):disabled, input[type="time"]:not(.browser-default)[readonly="readonly"], input[type="date"]:not(.browser-default):disabled, input[type="date"]:not(.browser-default)[readonly="readonly"], input[type="datetime"]:not(.browser-default):disabled, input[type="datetime"]:not(.browser-default)[readonly="readonly"], input[type="datetime-local"]:not(.browser-default):disabled, input[type="datetime-local"]:not(.browser-default)[readonly="readonly"], input[type="tel"]:not(.browser-default):disabled, input[type="tel"]:not(.browser-default)[readonly="readonly"], input[type="number"]:not(.browser-default):disabled, input[type="number"]:not(.browser-default)[readonly="readonly"], input[type="search"]:not(.browser-default):disabled, input[type="search"]:not(.browser-default)[readonly="readonly"], textarea.materialize-textarea:disabled, textarea.materialize-textarea[readonly="readonly"] {
  color: rgba(0, 0, 0, 1);
  border-bottom: 1px dotted #000000;
}

label {
  color: black;
}

.select-wrapper input.select-dropdown {
  border-bottom: 1px solid #000000 !important;
}

.divider {
  background-color: black;
}

input:not([type]):disabled, input:not([type])[readonly="readonly"], input[type="text"]:not(.browser-default):disabled, input[type="text"]:not(.browser-default)[readonly="readonly"], input[type="password"]:not(.browser-default):disabled, input[type="password"]:not(.browser-default)[readonly="readonly"], input[type="email"]:not(.browser-default):disabled, input[type="email"]:not(.browser-default)[readonly="readonly"], input[type="url"]:not(.browser-default):disabled, input[type="url"]:not(.browser-default)[readonly="readonly"], input[type="time"]:not(.browser-default):disabled, input[type="time"]:not(.browser-default)[readonly="readonly"], input[type="date"]:not(.browser-default):disabled, input[type="date"]:not(.browser-default)[readonly="readonly"], input[type="datetime"]:not(.browser-default):disabled, input[type="datetime"]:not(.browser-default)[readonly="readonly"], input[type="datetime-local"]:not(.browser-default):disabled, input[type="datetime-local"]:not(.browser-default)[readonly="readonly"], input[type="tel"]:not(.browser-default):disabled, input[type="tel"]:not(.browser-default)[readonly="readonly"], input[type="number"]:not(.browser-default):disabled, input[type="number"]:not(.browser-default)[readonly="readonly"], input[type="search"]:not(.browser-default):disabled, input[type="search"]:not(.browser-default)[readonly="readonly"], textarea.materialize-textarea:disabled, textarea.materialize-textarea[readonly="readonly"] {
  color: rgba(0, 0, 0, 1);
  border-bottom: 1px dotted #000000;
}

label {
  color: black;
}

.select-wrapper input.select-dropdown {
  border-bottom: 1px solid #000000 !important;
}
</style>