<template>
  <div class="card horizontal hoverable unselectable"
       style="background-color: #ead9a1; height: 110px"
       @click="selectList">

    <div class="card-content" @click="toExercises" style="width: 100%; height: 100%; padding: 10px 24px 5px 24px">
      <span class="card-title">
        {{ list.settings.title }}
        <i class="material-icons right activator" style="font-size: 35px;" v-on:click.prevent>more_vert</i>
      </span>
      <p style="margin-top: -5px; margin-bottom: 10px; height: 25px" class="truncate">{{
          list.settings.description
        }}</p>

      <div class="row">
        <div class="col s4">
          <p style="font-weight: bold; font-size: 15px;">
            {{ list.wordsLength ? list.wordsLength : (list.words ? list.words.length : 0) }}
            words</p>
        </div>
        <div class="col s1" style="margin-right: 10px">
          <img :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.fromLang)}.svg`)"
               width="25px" height="25px" alt="fromLanguage"/>
        </div>
        <div class="col s1">
          <img :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.toLang)}.svg`)"
               width="25px" height="25px" alt="toLanguage"/>
        </div>
      </div>

      <!--      <p class="footer">Created by {{ list.creator }}</p>-->
      <p class="footer" style="right: 5%">{{ formatDate(list.lastEdited) }}</p>
    </div>

    <div class="card-reveal unselectable" style="overflow: hidden; width: 100%; height: 100%">
      <div class="action-row" style="top: 0">
        <div class="action-item" v-for="(card_item, index) in itemsTop" :key="index"
             @click="actionHandler(card_item)">
          <i class="material-icons icon">{{ card_item.icon }}</i>
          <p class="action-text">{{ card_item.title }}</p>
        </div>
      </div>

      <div class="action-row" style="top: 50%">
        <div class="action-item" v-for="(card_item, index) in itemsBot" :key="index"
             v-on:click="actionHandler(card_item)">
          <!--          hack to flip the card-->
          <span v-if="index === 2" class="card-title"
                style="width: 100%; height: 100%; position: absolute; z-index: 2"></span>
          <i class="material-icons icon">{{ card_item.icon }}</i>
          <p class="action-text">{{ card_item.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject} from "@vue/composition-api";
import {formatDate, getCountry, wrongMessage} from "@/use/general";
import {Voclist} from '@/gen-types';
import {AuthModule} from "@/use/authModule";

//the items on the back of the card are very similar so we can define an item object by an icon, a title and an action
interface Item {
  icon: string;
  title: string;
  action: string;
}

export default defineComponent({
  props: {
    list: Object as () => Voclist,
    isOffline: Boolean
  },
  setup(props, context) {

    const auth = inject<AuthModule>("auth") as AuthModule;

    const itemsTop: Array<Item> = [
      {icon: "mode_edit", title: "Edit", action: "edit"},
      {icon: "file_download", title: "Download", action: "download"},
      {icon: "share", title: "Share", action: "share"},
    ];
    const itemsBot: Array<Item> = [
      {icon: "picture_as_pdf", title: "Export", action: "toPdf"},
      {icon: "delete", title: "Delete", action: "delete"},
      {icon: "arrow_back", title: "Back", action: "back"},
    ];

    function actionNotSupportedMessage() {
      wrongMessage("action not supported for offline lists!")
    }

    function notOnlineMessage() {
      wrongMessage("cannot perform this action when offline!")
    }

    function edit() {
      if (!navigator.onLine) notOnlineMessage();
      else if (props.isOffline) actionNotSupportedMessage();
      else {
        localStorage.setItem("_id", props.list._id);
        context.root.$router.push("/home/create");
      }
    }

    function download() {
      if (!navigator.onLine) notOnlineMessage();
      else if (props.isOffline) actionNotSupportedMessage()
      else context.emit("download");
    }

    function share() {
      if (!navigator.onLine) notOnlineMessage();
      else if (props.isOffline) actionNotSupportedMessage();
      else if (!auth.getOid().value) wrongMessage("not supported when not logged in");
      else context.emit("share");
    }

    function toPdf() {
      if (!navigator.onLine) notOnlineMessage();
      else context.emit("pdf");
    }

    function del() {
      context.emit("remove");
    }

    function toExercises(e) {
      if (e.target.classList.contains("activator")) return
      if (props.isOffline) localStorage.setItem("isOfflineList", "true")
      localStorage.setItem("_id", props.list._id);
      context.root.$router.push("/home/exercises");
    }

    function actionHandler(item: Item) {
      if (item.action == "edit") edit();
      else if (item.action == "download") download();
      else if (item.action == "share") share();
      else if (item.action == "toPdf") toPdf();
      else if (item.action == "delete") del();
    }

    function selectList() {
      context.emit("select-list", props.list)
    }

    return {
      itemsTop,
      itemsBot,
      actionHandler,
      getCountry,
      toExercises,
      formatDate,
      selectList
    };
  },
});
</script>


<style scoped>
.action-row {
  left: 0;
  height: 51%;
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
  margin-top: 5px;
  color: white;
  font-size: 25px;
}

.action-text {
  font-size: 15px;
  font-weight: bold;
  color: white;
  position: relative;
  top: -35%;
}

.footer {
  position: absolute;
  color: gray;
  font-size: 12px;
  right: 5px;
  bottom: 5px;
}
</style>
