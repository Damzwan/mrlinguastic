<template>
  <div>
    <!--    TODO lazy load-->
    <PdfModal :list="selectedList" v-if="selectedList"></PdfModal>
    <a class="modal-trigger" href="#pdfModal" ref="pdfTrigger"></a>

<!--    TODO lazy load-->
    <ShareModal :list="selectedList" v-if="selectedList"></ShareModal>
    <a class="modal-trigger" href="#shareModal" ref="shareTrigger"></a>

    <div class="section">
      <h5 class="center-align hide-on-large-only">🐉 Choose or create a voc list 🐉</h5>
      <h4 class="center-align hide-on-med-and-down">🐉 Choose or create a voc list 🐉</h4>
    </div>
    <div class="divider" style="margin-bottom: 30px"></div>

    <div class="fixed-action-btn">
      <router-link to="/create" class="btn-floating btn-large red" :class="{disabled: isOffline()}">
        <i class="large material-icons" style="font-size: 35px;">add</i>
      </router-link>
    </div>

    <div v-if="downloadedLists && downloadedLists.length > 0">
      <h5 class="center">Downloaded Voclists</h5>
      <div class="row">
        <div class="col l4 m6 s12" v-for="list in downloadedLists" :key="list._id">
          <VocCard v-bind:list="list" :is-offline="true" v-on:remove="removeOfflineList"
                   v-on:pdf="openPdfModal"></VocCard>
        </div>
      </div>
      <div class="divider" style="margin-bottom: 30px"></div>
    </div>

    <div class="row" v-if="userLists" style="margin-bottom: 70px">
      <div class="col l4 m6 s12" v-for="list in userLists" :key="list._id">
        <VocCard v-bind:list="list" :is-offline="false" v-on:remove="removeOnlineList" v-on:pdf="openPdfModal"
                 v-on:download="download"
                 v-on:share="share"></VocCard>
      </div>
    </div>

    <div v-else>
      <Loader></Loader>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent, inject, ref, watch} from "@vue/composition-api";
import {removeVoclistFromState, userLists} from "@/use/state";
import {Maybe, useDeleteVoclistMutation, useRemoveImgsMutation, Voclist} from "@/gen-types";
import {Localdb} from "@/use/localdb";
import VocCard from "@/components/voc/VocCard.vue";
import Loader from "@/components/Loader.vue";
import {correctMessage, isOffline, wrongMessage} from "@/use/general";
import {AuthModule} from "@/use/authModule";
import PdfModal from "@/components/voc/PdfModal.vue";
import ShareModal from "@/components/voc/ShareModal.vue";

export default defineComponent({
  components: {
    VocCard,
    Loader,
    PdfModal,
    ShareModal
  },
  setup() {
    localStorage.removeItem("_id");
    localStorage.removeItem("isOfflineList");
    const db = inject<Localdb>("db");
    const auth = inject<AuthModule>("auth");

    const downloadedLists = ref<Maybe<Voclist[]>>(null);
    const selectedList = ref<Voclist>(null);

    const pdfTrigger = ref<HTMLLinkElement>(null);
    const shareTrigger = ref<HTMLLinkElement>(null);

    const {mutate: removeVoclist} = useDeleteVoclistMutation({});
    const {mutate: removeImgs} = useRemoveImgsMutation({});


    db.getItems<Voclist>("downloadedVoclists").then(lists => lists ? downloadedLists.value = lists : null);

    if (userLists.value && userLists.value[0]) selectedList.value = userLists.value[0];
    watch(userLists, () => {
      selectedList.value = userLists.value[0];
    })

    function removeOfflineList(list: Voclist) {
      downloadedLists.value.splice(downloadedLists.value.indexOf(list), 1);
      db.deleteItem(list._id, "downloadedVoclists");
      correctMessage("deleted offline voclist!")
    }

    function removeOnlineList(list: Voclist) {
      if (navigator.onLine) {
        removeVoclistFromState(list);
        if (auth.getOid().value) removeVoclist({
          vocId: list._id, userId: auth.getOid().value,
          blobs: auth.getOid().value == list.creator ? list.words.filter(word => word.img).map(word => word.img) : []
        })
        else removeImgs({imgs: list.creator ? list.words.filter(word => word.img).map(word => word.img) : []})
        db.removeListFromUser(list._id);
        correctMessage("deleted voclist!")
      } else wrongMessage("must be online to delete this voclist!")
    }

    function openPdfModal(list: Voclist) {
      selectedList.value = list;
      pdfTrigger.value.click();
    }

    async function download(list: Voclist) {
      if (downloadedLists.value.includes(list)) await db.deleteItem(list._id, "downloadedVoclists")
      db.downloadVoclist(list).then(list => {
        correctMessage("list downloaded!");
        downloadedLists.value.push(list);
      });
    }

    function share(list: Voclist) {
      selectedList.value = list;
      shareTrigger.value.click();
    }

    return {
      downloadedLists,
      userLists,
      isOffline,
      removeOfflineList,
      removeOnlineList,
      selectedList,
      openPdfModal,
      download,
      share,
      pdfTrigger,
      shareTrigger
    }
  },
});
</script>

<style scoped>
</style>