<template>
  <div>
    <a class="modal-trigger" href="#pdfModal" ref="pdfModalTrigger"></a>
    <div class="section">
      <h5 class="center-align hide-on-large-only">🐉 Choose or create a voc list 🐉</h5>
      <h4 class="center-align hide-on-med-and-down">🐉 Choose or create a voc list 🐉</h4>
    </div>

    <div class="divider" style="margin-bottom: 30px"></div>

    <div class="fixed-action-btn">
      <router-link to="/vocabulary/create" class="btn-floating btn-large red" :class="{disabled: isOffline()}">
        <i class="large material-icons" style="font-size: 35px;">add</i>
      </router-link>
    </div>

    <!-- use VFOR and a list of voc lists -->
    <div class="row" v-if="allLists">
      <PdfModal :list="selectedList" v-if="selectedList"></PdfModal>
      <div class="col l4 m6 s12" v-for="list in allLists" :key="list._id">
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
import {defineComponent, inject, reactive, ref, watch} from "@vue/composition-api";
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
import moment from "moment";

interface State {
  hasJustAddedList: boolean,
  hasSharedList: boolean,
  userVoclists: Voclist[],
  sharedVoclist: Voclist,
  justAddedVoclist: Voclist
}

export default defineComponent({
  components: {
    VoclistCard,
    PdfModal
  },
  setup() {
    localStorage.removeItem("_id");

    const auth = inject<AuthModule>("auth");
    const db = inject<Localdb>("db");

    const pdfModalTrigger = ref<HTMLLinkElement>(null);
    const selectedList = ref<Voclist>(null);

    const {mutate: removeVoclist} = useDeleteVoclistMutation(null);
    const {mutate: addListToUser} = useAddVoclistToUserMutation(null);
    const allLists = ref<Voclist[]>(null);

    const state = reactive<State>({
      hasJustAddedList: localStorage.getItem("justAddedVoclist") != null,
      hasSharedList: false,
      userVoclists: null,
      sharedVoclist: null,
      justAddedVoclist: null
    })

    async function resetLocalDb() {
      db.clearStore().then(() => {
        allLists.value.forEach(list => {
          db.save("voclists", list)
        })
      })
    }

    function containsVoclist(lists: Voclist[], voclistId: string) {
      for (const list of lists)
        if (list._id === voclistId) return true;
      return false;
    }

    function getSharedVoclist() {
      const sharedLink = window.location.search;
      if (!sharedLink) return;
      window.history.replaceState({}, document.title, "/#/vocabulary"); //remove url parameters
      const voclistId = new URLSearchParams(sharedLink).get("oid");
      if (!voclistId) return;

      state.hasSharedList = true;
      const {result: sharedVoclist} = useGetVoclistQuery({voclistId: voclistId})
      watch(sharedVoclist, () => {
        if (sharedVoclist.value.voclist) {
          state.sharedVoclist = sharedVoclist.value.voclist;
        } else wrongMessage("voclist does not exist!");
      })
    }

    async function getUserListsOnline() {
      const {result: userVoclists} = useGetUserQuery({oid: auth.getOid()});
      if (userVoclists.value) state.userVoclists = userVoclists.value.user.voclists;
      else watch(userVoclists, async () => userVoclists.value.user ? state.userVoclists = userVoclists.value.user.voclists : state.userVoclists = []);
    }

    async function getUserListsOffline() {
      db.getAllVoclists().then(lists => state.userVoclists = lists)
    }

    function allListsLoaded() {
      return (!state.hasSharedList || (state.hasSharedList && state.sharedVoclist))
          && (!state.hasJustAddedList || (state.hasJustAddedList && state.justAddedVoclist))
          && state.userVoclists
    }

    watch(state, () => {
      if (allListsLoaded() && !allLists.value) {
        allLists.value = state.userVoclists;

        if (state.hasSharedList) {
          if (!containsVoclist(allLists.value, state.sharedVoclist._id)) {
            if (auth.getOid()) addListToUser({userId: auth.getOid(), vocId: state.sharedVoclist._id}) //add the voclist to the user
            allLists.value.push(state.sharedVoclist);
            correctMessage("voclist added!")
          } else wrongMessage("voclist already saved!")
        }

        if (state.hasJustAddedList && !containsVoclist(allLists.value, state.justAddedVoclist._id))
          allLists.value.push(state.justAddedVoclist)

        allLists.value.forEach(list => list.lastEdited = moment(list.lastEdited).format("lll"))

        selectedList.value = allLists.value[0];
        resetLocalDb();
      }
    })

    function removeList(list: Voclist) {
      allLists.value.splice(allLists.value.indexOf(list), 1);
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

    function isOffline() {
      return !navigator.onLine
    }

    if (localStorage.getItem("justAddedVoclist")) {
      db.getVoclist(localStorage.getItem("justAddedVoclist")).then(list => state.justAddedVoclist = list)
      localStorage.removeItem("justAddedVoclist")
    }
    if (navigator.onLine) getSharedVoclist()
    if (auth.getUser() && navigator.onLine) getUserListsOnline();
    else getUserListsOffline();

    return {state, removeList, openPdfModal, selectedList, pdfModalTrigger, allLists, isOffline}
  },
});
</script>

<style scoped>
</style>