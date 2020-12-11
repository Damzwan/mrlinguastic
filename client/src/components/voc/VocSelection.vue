<template>
  <div>
    <div v-if="selectedList">
      <PdfModal :list="selectedList"></PdfModal>
      <a class="modal-trigger" href="#pdfModal" ref="pdfTrigger"></a>

      <ShareModal :list="selectedList"></ShareModal>
      <a class="modal-trigger" href="#shareModal" ref="shareTrigger"></a>
    </div>

    <div style="margin-bottom: 20px">
      <h4 class="center-align">👩‍🎓 Vocabulary 👩‍🎓</h4>
      <div class="divider"></div>
    </div>

    <div class="fixed-action-btn">
      <div @click="goToCreatePage" class="btn-floating btn-large red" :class="{disabled: isOffline()}">
        <i class="large material-icons" style="font-size: 35px;">add</i>
      </div>
    </div>

    <div v-if="downloadedLists && downloadedLists.length > 0">
      <h5 class="center">Downloaded</h5>
      <div class="row">
        <div class="col l4 m6 s12" v-for="list in downloadedLists" :key="list._id">
          <VocCard v-bind:list="list" :is-offline="true" v-on:remove="removeDownloadedList"
                   v-on:pdf="openPdfModal" v-on:select-list="selectList"></VocCard>
        </div>
      </div>
      <div class="divider" style="margin-bottom: 30px"></div>
    </div>

    <div class="row" v-if="userLists" style="margin-bottom: 70px">
      <div v-if="userLists.length === 0">
        <div class="col s10 offset-s1"><p class="flow-text center">You haven't created any lists yet</p></div>
        <div class="col s10 offset-s1"><p class="flow-text center">Press the red button below to create one</p></div>
        <div class="col s10 offset-s1"><p class="flow-text center">Or download online lists in the language you want by joining a
          <a href="#" data-target="nav2" class="sidenav-trigger">community</a></p></div>
      </div>

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
import {defineComponent, inject, ref} from "@vue/composition-api";
import {downloadedLists, removeVoclistFromState, userLists} from "@/use/state";
import {useDeleteVoclistMutation, useRemoveImgsMutation, Voclist} from "@/gen-types";
import {Localdb} from "@/use/localdb";
import VocCard from "@/components/voc/VocCard.vue";
import Loader from "@/components/Loader.vue";
import {correctMessage, isOffline, newLastUpdated, wrongMessage} from "@/use/general";
import {AuthModule} from "@/use/authModule";
import {useVoclistUpdater} from "@/use/listUpdater";

export default defineComponent({
  components: {
    VocCard,
    Loader,
    PdfModal: () => import('@/components/voc/PdfModal.vue'),
    ShareModal: () => import(/* webpackPrefetch: true */ '@/components/voc/ShareModal.vue')
  },
  setup(props, ctx) {
    localStorage.removeItem("isOfflineList");
    const db = inject<Localdb>("db");
    const auth = inject<AuthModule>("auth");

    const selectedList = ref<Voclist>(null);

    const pdfTrigger = ref<HTMLLinkElement>(null);
    const shareTrigger = ref<HTMLLinkElement>(null);

    const {updateVoclist} = useVoclistUpdater();

    const {mutate: removeVoclist} = useDeleteVoclistMutation({});
    const {mutate: removeImgs} = useRemoveImgsMutation({});

    function removeDownloadedList() {
      downloadedLists.value.splice(downloadedLists.value.indexOf(selectedList.value), 1);
      db.deleteItem(selectedList.value._id, "downloadedVoclists");
      correctMessage("deleted offline voclist!")
    }

    async function removeOnlineList() {
      if (navigator.onLine) {
        removeVoclistFromState(selectedList.value);
        if (auth.getOid().value) removeVoclist({
          vocId: selectedList.value._id, userId: auth.getOid().value, lastUpdated: newLastUpdated()
        })
        else {
          const offlineList = await db.getItem<Voclist>(selectedList.value._id, "voclists");
          removeImgs({imgs: offlineList.words.filter(word => word.img).map(word => word.img)})
        }
        db.removeListFromUser(selectedList.value._id);
        correctMessage("deleted voclist!")
      } else wrongMessage("must be online to delete this voclist!")
    }

    function openPdfModal() {
      pdfTrigger.value.click();
    }

    async function download() {
      let index = -1;
      for (let i = 0; i < downloadedLists.value.length; i++)
        if (downloadedLists.value[i]._id == selectedList.value._id) index = i;

      const updatedList = await updateVoclist(selectedList.value._id);
      db.downloadVoclist(updatedList).then(list => {
        if (index == -1) {
          downloadedLists.value.push(list);
          correctMessage("list downloaded!");
        } else {
          downloadedLists.value.splice(index);
          downloadedLists.value.push(list)
          correctMessage("updated downloaded voclist");
        }
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
      removeDownloadedList,
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