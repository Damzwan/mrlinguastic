<template>
  <div class="card horizontal hoverable unselectable"
       style="background-color: #ead9a1; height: 110px">

    <div class="card-content" style="width: 100%;  padding: 10px 24px 5px 24px" @click="showList">
      <i class="material-icons right" style="font-size: 35px; position: absolute; right: 15px; color: red"
         @click="$emit('remove', list)" v-if="list.creator === oid">
        close</i>
      <span class="card-title">
        {{ list.settings.title }}
      </span>
      <p style="margin-top: -5px; margin-bottom: 10px; height: 25px" class="truncate">{{
          list.settings.description
        }}</p>

      <div class="row">
        <div class="col s4">
          <p style="font-weight: bold; font-size: 15px;">{{ list.wordsLength }} words</p>
        </div>
        <div class="col s1" style="margin-right: 10px">
          <img :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.fromLang)}.svg`)"
               width="25px" height="25px"/>
        </div>
        <div class="col s1">
          <img :src="require(`@/assets/country-flags/${getCountry(list.settings.langSettings.toLang)}.svg`)"
               width="25px" height="25px"/>
        </div>
      </div>

      <!--      <p class="footer">Created by {{ list.creator }}</p>-->
      <p class="footer" style="right: 5%">{{ list.lastEdited }}</p>
    </div>
  </div>
  <!--  </router-link>-->
</template>

<script lang="ts">
import {defineComponent, inject} from "@vue/composition-api";
import {getCountry} from "@/use/general";
import {Voclist} from '@/gen-types';
import {AuthModule} from "@/use/authModule";
import moment from "moment";

//the items on the back of the card are very similar so we can define an item object by an icon, a title and an action
interface Item {
  icon: string;
  title: string;
  action: string;
}

export default defineComponent({
  props: {
    list: Object as () => Voclist,
  },
  setup(props, context) {
    const auth: AuthModule = inject<AuthModule>("auth");
    const list: Voclist = props.list;
    list.lastEdited = moment(new Date(list.lastEdited)).format("lll");

    function showList(e: any) {
      if (e.target.classList.contains("material-icons")) return;
      context.emit("showList", list);
    }

    return {getCountry, oid: auth.getOid(), showList}
  },
});
</script>


<style scoped>
.footer {
  position: absolute;
  color: gray;
  font-size: 12px;
  right: 5px;
  bottom: 5px;
}
</style>
