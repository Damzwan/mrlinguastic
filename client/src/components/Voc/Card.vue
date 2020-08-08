<template>
  <div class="card horizontal hoverable unselectable">
    <div class="card-content" style="width: 100%; height: 100%;">
      <span class="card-title">
        {{ title }}
        <i class="material-icons right activator" style="font-size: 35;">more_vert</i>
      </span>
      <p
        style="margin-top: -5px; margin-bottom: 10px"
      >A small description to give more info about the list</p>

      <div class="row">
        <div class="col s5">
          <p style="font-weight: bold; font-size: 15px;">{{ wordAmount }} words</p>
        </div>
        <div class="col s1" style="margin-right: 10px">
          <img :src="getPic(fromLang)" v-if="fromLang" width="25px" height="25px" />
        </div>
        <div class="col s1">
          <img :src="getPic(toLang)" v-if="toLang" width="25px" height="25px" />
        </div>
      </div>

      <p class="footer">Created by Damian</p>
      <p class="footer" style="right: 5%">08/08/2020 12:50</p>
    </div>

    <div class="card-reveal unselectable" style="overflow: hidden; width: 100%; height: 100%">
      <div class="action-row" style="top: 0px">
        <div
          class="action-item"
          v-for="(card_item, index) in itemsTop"
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
          v-for="(card_item, index) in itemsBot"
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

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  props: {
    title: String,
    wordAmount: String,
    fromLang: String,
    toLang: String,
  },
  setup() {
    const itemsTop = [
      { icon: "mode_edit", title: "Edit", action: "edit" },
      { icon: "text_fields", title: "Rename", action: "rename" },
      { icon: "share", title: "Share", action: "share" },
    ];
    const itemsBot = [
      { icon: "picture_as_pdf", title: "Export", action: "toPdf" },
      { icon: "delete", title: "Delete", action: "delete" },
      { icon: "arrow_back", title: "Back", action: "back" },
    ];

    function edit() {
      console.log("should be editing");
    }
    function rename() {
      console.log("should be renaming");
    }
    function share() {
      console.log("should be sharing");
    }
    function toPdf() {
      console.log("should be pdfing");
    }
    function del() {
      console.log("should be deleting");
    }

    function actionHandler(item: any) {
      if (item.action == "edit") edit();
      else if (item.action == "rename") rename();
      else if (item.action == "share") share();
      else if (item.action == "toPdf") toPdf();
      else if (item.action == "delete") del();
    }

    function getPic(lang: string) {
      const images = require.context(
        "../../assets/country-flags/",
        false,
        /\.svg$/
      );

      return images("./" + lang + ".svg");
    }

    return {
      itemsTop,
      itemsBot,
      actionHandler,
      getPic,
      edit,
      rename,
      share,
      toPdf,
      del,
    };
  },
});
</script>



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
  background-color: #2e7d32;
  width: 33.33%;
  height: 100%;
}

.action-item:hover {
  background-color: #1b5e20;
}

.icon {
  margin-top: 15%;
  color: white;
  font-size: 30px;
}

.action-text {
  font-size: 20px;
  font-weight: bold;
  color: white;
  position: relative;
  top: -30%;
}

.footer {
  position: absolute;
  color: gray;
  font-size: 12px;
}
</style>
