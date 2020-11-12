<template>
  <div>
    <div v-if="selectedList">
      <PdfModal :list="selectedList"></PdfModal>
      <a class="modal-trigger" href="#pdfModal" ref="pdfTrigger"></a>

      <ShareModal :list="selectedList"></ShareModal>
      <a class="modal-trigger" href="#shareModal" ref="shareTrigger"></a>
    </div>

    <div class="section">
      <h5 class="center-align hide-on-large-only">🐉 Choose or create a voc list 🐉</h5>
      <h4 class="center-align hide-on-med-and-down">🐉 Choose or create a voc list 🐉</h4>
    </div>
    <div class="divider" style="margin-bottom: 30px"></div>

    <div class="fixed-action-btn">
      <div @click="goToCreatePage" class="btn-floating btn-large red" :class="{disabled: isOffline()}">
        <i class="large material-icons" style="font-size: 35px;">add</i>
      </div>
    </div>

    <div v-if="downloadedLists && downloadedLists.length > 0">
      <h5 class="center">Downloaded Voclists</h5>
      <div class="row">
        <div class="col l4 m6 s12" v-for="list in downloadedLists" :key="list._id">
          <VocCard v-bind:list="list" :is-offline="true" v-on:remove="removeOfflineList"
                   v-on:pdf="openPdfModal" v-on:select-list="selectList"></VocCard>
        </div>
      </div>
      <div class="divider" style="margin-bottom: 30px"></div>
    </div>

    <div class="row" v-if="userLists" style="margin-bottom: 70px">
      <div class="col l4 m6 s12" v-for="list in userLists" :key="list._id">
        <VocCard v-bind:list="list" :is-offline="false" v-on:remove="removeOnlineList" v-on:pdf="openPdfModal"
                 v-on:download="download"
                 v-on:share="share" v-on:select-list="selectList"></VocCard>
      </div>
    </div>

    <Loader v-else></Loader>

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
import ShareModal from "@/components/voc/ShareModal.vue";
import {Route} from "vue-router";

export default defineComponent({
  components: {
    VocCard,
    Loader,
    PdfModal: () => import('@/components/voc/PdfModal.vue'),
    ShareModal
  },
  setup(props, ctx) {
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

    function removeOfflineList() {
      downloadedLists.value.splice(downloadedLists.value.indexOf(selectedList.value), 1);
      db.deleteItem(selectedList.value._id, "downloadedVoclists");
      correctMessage("deleted offline voclist!")
    }

    function removeOnlineList() {
      if (navigator.onLine) {
        removeVoclistFromState(selectedList.value);
        if (auth.getOid().value) removeVoclist({
          vocId: selectedList.value._id, userId: auth.getOid().value,
          blobs: auth.getOid().value == selectedList.value.creator ? selectedList.value.words.filter(word => word.img).map(word => word.img) : []
        })
        else removeImgs({imgs: selectedList.value.creator ? selectedList.value.words.filter(word => word.img).map(word => word.img) : []})
        db.removeListFromUser(selectedList.value._id);
        correctMessage("deleted voclist!")
      } else wrongMessage("must be online to delete this voclist!")
    }

    function openPdfModal() {
      pdfTrigger.value.click();
    }

    async function download() {
      if (downloadedLists.value.includes(selectedList.value)) await db.deleteItem(selectedList.value._id, "downloadedVoclists")
      db.downloadVoclist(selectedList.value).then(list => {
        correctMessage("list downloaded!");
        downloadedLists.value.push(list);
      });
    }

    function share() {
      shareTrigger.value.click();
    }

    function selectList(list: Voclist) {
      selectedList.value = list;
    }

    function goToCreatePage() {
      localStorage.removeItem("_id");
      ctx.root.$router.push("/create");
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
      shareTrigger,
      selectList,
      goToCreatePage
    }
  }
});
</script>

<style scoped>
.divider {
  background-color: black !important;
}
</style>