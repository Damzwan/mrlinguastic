<template>
  <div class="card horizontal hoverable unselectable">
    <div class="card-content" style="width: 100%; height: 100%;">
      <span class="card-title">
        {{ title }}
        <i class="material-icons right activator" style="font-size: 35;">more_vert</i>
      </span>
      <div class="row">
        <div class="col s4">
          <p style="font-weight: bold; font-size: 15px;">{{ wordAmount }} words</p>
        </div>
        <div class="col s1" style="margin-left: -30px">
          <img :src="getPic(fromLang)" width="25px" height="25px" />
        </div>
        <div class="col s1">
          <img :src="getPic(toLang)" width="25px" height="25px" />
        </div>
      </div>
    </div>

    <div class="card-reveal unselectable" style="overflow: hidden; width: 100%; height: 100%">
      <div class="action-row" style="top: 0px">
        <div
          class="action-item"
          v-for="(card_item, index) in card_items_top"
          :key="index"
          v-on:click="actionHandler(card_item)"
        >
          <i class="material-icons icon">{{card_item.icon}}</i>
          <p class="action-text">{{card_item.title}}</p>
        </div>
      </div>

      <div class="action-row" style="top: 50%">
        <div
          class="action-item"
          v-for="(card_item, index) in card_items_bot"
          :key="index"
          v-on:click="actionHandler(card_item)"
        >
          <span
            v-bind:class="(index==2)?'card-title':''"
            style="width: 100%; height: 100%; position: absolute; z-index: 2"
          ></span>
          <i class="material-icons icon">{{card_item.icon}}</i>
          <p class="action-text">{{card_item.title}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Voc_Card",
  components: {},
  props: {
    title: String,
    wordAmount: String,
    fromLang: String,
    toLang: String
  },
  data() {
    return {
      card_items_top: [
        { icon: "mode_edit", title: "Edit", action: "edit" },
        { icon: "text_fields", title: "Rename", action: "rename" },
        { icon: "share", title: "Share", action: "share" }
      ],
      card_items_bot: [
        { icon: "picture_as_pdf", title: "Export", action: "toPdf" },
        { icon: "delete", title: "Delete", action: "delete" },
        { icon: "arrow_back", title: "Back", action: "back" }
      ]
    };
  },
  methods: {
    actionHandler(item) {
      if (item.action == "edit") edit();
      else if (item.action == "rename") rename();
      else if (item.action == "share") share();
      else if (item.action == "toPdf") toPdf();
      else if (item.action == "delete") del();
    },
    getPic(lang) {
      var images = require.context("../../assets/country-flags/", false, /\.svg$/);
      return images("./" + lang + ".svg");
    }
  }
};

function edit() {
  console.log("should be editing");
}
function rename() {}
function share() {}
function toPdf() {}
function del() {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.action-row {
  left: 0px;
  height: 50%;
  position: absolute;
  width: 100%;
}

.action-item {
  display: inline-block;
  text-align: center;
  background-color: #f44336;
  width: 33.33%;
  height: 100%;
}

.action-item:hover {
  background-color: #e53935;
}

.icon {
  margin-top: 5%;
  color: white;
  font-size: 30px;
}

.action-text {
  font-size: 20px;
  font-weight: bold;
  color: white;
  position: relative;
  top: -40%;
}
</style>
