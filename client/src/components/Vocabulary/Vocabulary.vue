<template>
  <div>
    <div>
      <div class="section">
        <h5 class="center-align hide-on-large-only">Choose or create a word list</h5>
        <h4 class="center-align hide-on-med-and-down">Choose or create a word list</h4>
      </div>

      <div class="fixed-action-btn hide-on-large-only">
        <a class="btn-floating btn-large red" href="create">
          <i class="large material-icons" style="font-size: 35;">add</i>
        </a>
      </div>

      <div class="row" id="lists">
        <div class="col l4 m5 s12 hide-on-med-and-down">
          <a href="create">
            <div
              class="card horizontal hoverable unselectable valign-wrapper"
              style="height: 115.33;"
            >
              <div style="width: 100%" class="center-align">
                <i class="material-icons" style="font-size: 75; color: black;">add</i>
              </div>
            </div>
          </a>
        </div>

        <div class="col l4 m5 s12">
          <VocCard title="Sample Card" wordAmount="5000" fromLang="belgium" toLang="france"></VocCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VocCard from "./Voc_Card";

export default {
  name: "Vocabulary",
  components: { VocCard }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
