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
                <i
                    class="material-icons right unselectable question-btn tooltipped"
                    data-tooltip="The language from which you'd like to translate from. This should be your mother language in most cases"
                >live_help</i>
              </label>
            </div>

            <div class="input-field col s12 m6">
              <select class="icons" id="fromVoice">
                <option
                    value="M"
                    selected
                    data-icon="https://upload.wikimedia.org/wikipedia/commons/4/48/Outdoors-man-portrait_%28cropped%29.jpg"
                >Male 01
                </option>
                <option
                    value="F"
                    data-icon="data:image/jpeg;base64,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"
                >Female 01
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
              <label>
                To Language
                <i
                    class="material-icons right unselectable question-btn tooltipped"
                    data-tooltip="This should be the language you would like to learn"
                >live_help</i>
              </label>
            </div>

            <div class="input-field col s12 m6">
              <select class="icons" id="toVoice">
                <option
                    value="M"
                    selected
                    data-icon="https://upload.wikimedia.org/wikipedia/commons/4/48/Outdoors-man-portrait_%28cropped%29.jpg"
                >Male 01
                </option>
                <option
                    value="F"
                    data-icon="data:image/jpeg;base64,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"
                >Female 01
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
              <i
                  class="material-icons right unselectable question-btn tooltipped"
                  data-tooltip="Automatically search for a matching image after each insertion"
              >live_help</i>
            </div>
          </div>
        </div>
      </div>

      <div
          class="waves-effect waves-light btn confirm-btn disabled"
          id="continue"
          v-on:click="saveConfig"
      >Continue
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  watch,
} from "@vue/composition-api";
import M, {Modal} from "materialize-css";

export default defineComponent({
  setup(props, context) {
    let configModal: Modal | null = null;
    let selects: M.FormSelect[] | null = null;
    let langSettings: string[] | null = null;

    onMounted(() => {
      M.Modal.init(document.querySelectorAll(".modal"));
      M.FormSelect.init(document.querySelectorAll("select"));
      M.Tooltip.init(document.querySelectorAll(".tooltipped"));

      configModal = M.Modal.getInstance(
          document.querySelectorAll("#configuration")[0]
      );
      configModal.open();
    });

    function getCountryFlag(country: string) {
      return require(`@/assets/country-flags/${country}.svg`);
    }

    function saveConfig() {
      if (configModal) configModal.close();
      langSettings = [];
      for (const select of selects!)
        langSettings.push(select.getSelectedValues()[0]);
      context.emit("saveLangSettings", langSettings);
    }

    //TODO replace with template code
    function openModal() {
      if (configModal) configModal.open();
    }

    function updateSelect() {
      selects = M.FormSelect.init(document.querySelectorAll("select"));
      if (
          selects[0].getSelectedValues()[0] != "null" &&
          selects[2].getSelectedValues()[0] != "null"
      )
        document.getElementById("continue")!.classList.remove("disabled");
    }

    return {
      getCountryFlag,
      saveConfig,
      updateSelect,
      openModal,
    };
  },
});
</script>

<style scoped>
.close-btn {
  font-size: 35px;
  position: absolute;
  right: 3%;
  top: 1%;
}

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