<template>
  <div>
    <a class="modal-trigger" href="#pdfModal" ref="pdfModalTrigger"></a>
    <div class="section">
      <h5 class="center-align hide-on-large-only">🐉 Choose or create a voc list 🐉</h5>
      <h4 class="center-align hide-on-med-and-down">🐉 Choose or create a voc list 🐉</h4>
    </div>

    <div class="fixed-action-btn">
      <router-link to="/vocabulary/create" class="btn-floating btn-large red">
        <i class="large material-icons" style="font-size: 35px;">add</i>
      </router-link>
    </div>

    <!-- use VFOR and a list of voc lists -->
    <div class="row" v-if="lists">
      <PdfModal :list="selectedList" v-if="selectedList"></PdfModal>
      <div class="col l4 m6 s12" v-for="list in lists" :key="list._id">
        <VoclistCard v-bind:list="list" v-on:removeList="removeList" v-on:openPdfModal="openPdfModal"></VoclistCard>
      </div>
    </div>

    <div v-else style="margin-top: 100px">
      <div class="preloader-wrapper big active centered-img">
        <div class="spinner-layer spinner-blue-only">
          <div class="circle-clipper left">
            <div class="circle"></div>
          </div>
          <div class="gap-patch">
            <div class="circle"></div>
          </div>
          <div class="circle-clipper right">
            <div class="circle"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import {defineComponent, inject, ref, watch} from "@vue/composition-api";
import VoclistCard from "./VoclistCard.vue";
import {Localdb} from "@/use/localdb";
import {
  Exact, GetUserQuery, useAddVoclistToUserMutation,
  useDeleteVoclistMutation,
  useGetUserQuery,
  useGetVoclistQuery,
  useUpdateVoclistMutation,
  Voclist, VoclistInput
} from "@/gen-types";
import {AuthModule} from "@/use/authModule";
import PdfModal from "@/components/Voc/PdfModal.vue";
import {correctMessage, wrongMessage} from "@/use/messages";
import {ApolloQueryResult} from 'apollo-boost';

export default defineComponent({
  components: {
    VoclistCard,
    PdfModal
  },
  setup() {
    localStorage.removeItem("_id");

    const auth = inject<AuthModule>("auth");
    const lists = ref<Voclist[]>([])
    const db = inject<Localdb>("db");

    const pdfModalTrigger = ref<HTMLLinkElement>(null);
    const selectedList = ref<Voclist>(null);

    const {mutate: removeVoclist} = useDeleteVoclistMutation(null);

    async function resetLocalDb() {
      db.clearStore().then(() => {
        lists.value.forEach(list => {
          db.save("voclists", list)
        })
      })
    }

    function containsVoclist(lists: Voclist[], voclistId: string) {
      for (const list of lists)
        if (list._id === voclistId) return true;
      return false;
    }

    //TODO rewrite this garbage
    function addVoclists(newLists: Voclist[]) {
      if (lists.value.length == 0) lists.value = lists.value.concat(newLists)
      else if (lists.value.length == 1) {
        if (containsVoclist(newLists, lists.value[0]._id)) {
          lists.value = newLists;
          wrongMessage("voclist already saved!")
        } else {
          lists.value = lists.value.concat(newLists);
          correctMessage("voclist added!")
        }
      } else if (newLists.length == 1) {
        if (containsVoclist(lists.value, newLists[0]._id)) wrongMessage("voclist already saved!")
        else {
          lists.value = lists.value.concat(newLists)
          correctMessage("voclist added!")
        }
      }
    }

    function getSharedVoclist() {
      const sharedLink = window.location.search;
      if (!sharedLink) return;
      window.history.replaceState({}, document.title, "/#/vocabulary"); //remove url parameters
      const voclistId = new URLSearchParams(sharedLink).get("oid");
      if (!voclistId) return;

      const {result: sharedVoclist} = useGetVoclistQuery({voclistId: voclistId})
      const {mutate: addListToUser} = useAddVoclistToUserMutation(null);
      watch(sharedVoclist, () => {
        if (sharedVoclist.value.voclist){
          addListToUser({userId: auth.getOid(), vocId: voclistId})
          addVoclists([sharedVoclist.value.voclist]);
        }
        else wrongMessage("voclist does not exist!");
      })
    }

    async function getListsOnline() {
      getSharedVoclist();
      const {result: userVoclists} = useGetUserQuery({oid: auth.getOid()});
      if (userVoclists.value) addVoclists(userVoclists.value.user.voclists)
      else watch(userVoclists, async () => addVoclists(userVoclists.value.user.voclists));
    }

    async function getListsOffline() {
      if (navigator.onLine) getSharedVoclist();
      addVoclists(await db.getAllVoclists());
    }

    watch(lists, (newList, prevList) => {
      selectedList.value = newList[0];
      //all lists are loaded so we should reset the local database with the newest version
      if (prevList && navigator.onLine) resetLocalDb()
    })

    if (localStorage.getItem("justAddedVoclist")){
      db.getVoclist(localStorage.getItem("justAddedVoclist")).then(list => addVoclists([list]))
      localStorage.removeItem("justAddedVoclist")
    }

    if (auth.getUser() && navigator.onLine) getListsOnline();
    else getListsOffline();

    function removeList(list: Voclist) {
      lists.value.splice(lists.value.indexOf(list), 1);
      db.deleteVoclist(list._id);
      if (auth.getUser() && navigator.onLine) removeVoclist({
        vocId: list._id,
        userId: auth.getOid(),
        blobs: list.words.filter(word => word.img).map(word => word.img)
      })
    }

    function openPdfModal(list: Voclist) {
      selectedList.value = list;
      pdfModalTrigger.value.click();
    }

    return {lists, removeList, openPdfModal, selectedList, pdfModalTrigger}
  },
});
</script>

<style scoped>
</style>