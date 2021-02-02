<template>
  <div class="modal" ref="profilePicModalElem" id="profilePicModal"
       :style="{backgroundImage: 'url(' + require('../../assets/triangle2.svg') + ')'}">
    <div class="modal-content">
      <h4 class="center">🖼 Choose profile picture 🖼</h4>
      <div class="divider"></div>
      <div class="row section" v-if="opened">
        <div class="col s6 m4" v-for="(profilePic, index) in profilePics" :key="index">
          <img :src="getBlobUrl(profilePic)" :alt="index" class="circle hoverable centered-img unselectable"
               style="width: 100px;height: 100px; margin-top: 20px" @click="changeProfilePic(profilePic)">
        </div>
      </div>

      <div class="divider"></div>

      <p class="flow-text center"><b>Who is this?</b></p>
      <p class="flow-text center">This is the guy that desperately wanted the ability to change his <b>PROFILE
        PICTURE</b>. I Hope you are happy :))</p>
    </div>
    <div class="modal-footer" style="background-color: revert">
      <a class="modal-close waves-effect waves-green btn-flat">Close</a>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent, inject, onMounted, ref} from "@vue/composition-api";
import {addGroup, changeProfilePicState} from "@/use/state";
import {Community, correctMessage, getBlobUrl, newLastUpdated} from "@/use/general";
import Modal = M.Modal;
import {useChangeProfilePicMutation} from "@/gen-types";
import {Localdb} from "@/use/localdb";
import {AuthModule} from "@/use/authModule";
import M from "materialize-css";

export default defineComponent({
  setup() {
    const profilePicModalElem = ref<HTMLElement>(null);
    const profilePicModal = ref<Modal>(null);
    const {mutate: changeProfilePicOnline} = useChangeProfilePicMutation({});
    const db = inject<Localdb>("db");
    const auth = inject<AuthModule>("auth");
    const opened = ref<boolean>(false);

    const profilePics = ["daniel1.jpg", "daniel2.jpg", "daniel3.jpg","daniel4.jpg", "daniel5.jpg", "daniel6.jpg"]

    function onOpen(){
      opened.value = true;
    }

    onMounted(() => {
      profilePicModal.value = M.Modal.init(profilePicModalElem.value, {onOpenStart: onOpen})
    });


    function changeProfilePic(img: string){
      changeProfilePicState(img);
      correctMessage("Profile Picture changed!")
      profilePicModal.value.close();
      changeProfilePicOnline({userId: auth.getOid().value, pic: img, lastUpdated: newLastUpdated()})
      db.changeProfilePic(img);
    }

    return {
      changeProfilePic,
      getBlobUrl,
      profilePicModalElem,
      profilePics,
      opened
    }

  },
});
</script>

<style scoped>
.divider{
  background-color: black;
}
</style>