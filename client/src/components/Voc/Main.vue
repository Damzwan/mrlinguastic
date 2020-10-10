<template>
  <div>
    <PdfModal :list="selectedList" v-if="selectedList"></PdfModal>
    <a class="modal-trigger" href="#pdfModal" ref="pdfModalTrigger"></a>
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

    <div class="modal bottom-sheet" ref="shareModalElem">
      <div class="modal-content" style="padding: 0">
        <div class="collection" v-if="!clickedAddToGroup">
          <a class="collection-item unselectable" @click="copyListLink">
            <i class="material-icons unselectable">content_copy</i>
            Copy link
          </a>
          <a class="collection-item unselectable" @click="clickedAddToGroup = true">
            <i class="material-icons unselectable">group</i>
            Add to group
          </a>
        </div>
        <div v-else>
          <div class="collection">
            <a class="collection-item unselectable" v-for="group in getGroups" @click="addVoclistToGroup(group._id)"
               :key="group._id">
              <i class="material-icons unselectable">group</i>
              {{ group.name }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <div v-if="downloadedLists && downloadedLists.length > 0">
      <h5 class="center">Downloaded Voclists</h5>
      <div class="row">
        <div class="col l4 m6 s12" v-for="list in downloadedLists" :key="list._id">
          <VoclistCard v-bind:list="list" :is-offline="true" v-on:removeList="removeList"
                       v-on:openPdfModal="openPdfModal" v-on:download="downloadVoclist"></VoclistCard>
        </div>
      </div>
      <div class="divider" style="margin-bottom: 30px"></div>
    </div>

    <div class="row" v-if="allLists" style="margin-bottom: 70px">
      <div class="col l4 m6 s12" v-for="list in allLists" :key="list._id">
        <VoclistCard v-bind:list="list" :is-offline="false" v-on:removeList="removeList"
                     v-on:openPdfModal="openPdfModal" v-on:download="downloadVoclist"
                     v-on:share="shareList"></VoclistCard>
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
import {defineComponent, inject, onMounted, reactive, ref, watch} from "@vue/composition-api";
import VoclistCard from "./VoclistCard.vue";
import {Localdb} from "@/use/localdb";
import {
  useAddUserToGroupMutation,
  useAddVoclistToGroupMutation,
  useAddVoclistToUserMutation,
  useCopyVoclistMutation,
  useDeleteVoclistMutation,
  useGetUserQuery,
  Voclist
} from "@/gen-types";
import {AuthModule} from "@/use/authModule";
import PdfModal from "@/components/Voc/PdfModal.vue";
import {correctMessage, normalMessage, wrongMessage} from "@/use/messages";
import moment from "moment";
import {useState} from "@/use/vuex";
import M from "materialize-css"

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
    localStorage.removeItem("isOfflineList");

    const auth = inject<AuthModule>("auth");
    const db = inject<Localdb>("db");

    const pdfModalTrigger = ref<HTMLLinkElement>(null);
    const selectedList = ref<Voclist>(null);

    const {mutate: removeVoclist} = useDeleteVoclistMutation(null);
    const {mutate: addListToUser} = useAddVoclistToUserMutation(null);
    const {mutate: addListToGroup} = useAddVoclistToGroupMutation(null);
    const {mutate: addUserToGroup} = useAddUserToGroupMutation(null);
    const {mutate: copyVoclist} = useCopyVoclistMutation(null);

    const allLists = ref<Voclist[]>(null);
    const downloadedLists = ref<Voclist[]>(null);

    const shareModalElem = ref<HTMLElement>(null);
    const shareModal = ref<M.Modal>(null);
    const clickedAddToGroup = ref<boolean>(false);

    const {setState, addGroup, getGroups} = useState();

    const state = reactive<State>({
      hasJustAddedList: localStorage.getItem("justAddedVoclist") != null,
      hasSharedList: false,
      userVoclists: null,
      sharedVoclist: null,
      justAddedVoclist: null,
    })

    onMounted(() => {
      shareModal.value = M.Modal.init(shareModalElem.value, {onCloseEnd: () => clickedAddToGroup.value = false});
    })

    async function resetLocalDb() {
      db.clearStore("voclists").then(() => {
        allLists.value.forEach(list => {
          db.save("voclists", list)
        })
      })
    }

    function containsVoclist(lists: Voclist[], voclistId: string) {
      for (let i = 0; i < lists.length; i++)
        if (lists[i]._id === voclistId) return i;
      return -1;
    }

    function getSharedVoclist() {
      const sharedLink = window.location.search;
      if (!sharedLink) return;
      window.history.replaceState({}, document.title, "/#/"); //remove url parameters
      const voclistId = new URLSearchParams(sharedLink).get("oid");
      if (!voclistId) return;

      state.hasSharedList = true;
      copyVoclist({voclistId: voclistId}).then(voclist => {
        if (!voclist) wrongMessage("voclist does not exist!");
        else state.sharedVoclist = voclist.data.copyVoclist;
      })
    }

    async function addSharedGroup() {
      const sharedLink = window.location.search;
      if (!sharedLink) return;
      const groupId = new URLSearchParams(sharedLink).get("groupId");
      if (!groupId) return;

      if (auth.getOid()) addUserToGroup({userId: auth.getOid(), groupId: groupId}).then(item => {
        addGroup({_id: groupId, name: item.data.addUserToGroup});
        correctMessage("added group!");
      })
      else wrongMessage("can't add groups when not logged in!")
    }

    async function getUserListsOnline() {
      const {result: userVoclists} = useGetUserQuery({oid: auth.getOid()});
      if (userVoclists.value) state.userVoclists = userVoclists.value.user.voclists;
      else watch(userVoclists, async () => {
        userVoclists.value.user ? state.userVoclists = userVoclists.value.user.voclists : state.userVoclists = [];
        setState(userVoclists.value.user.groups.map(group => {
          return {_id: group._id, name: group.name}
        }));
      });
    }

    async function getUserListsOffline() {
      db.getItems<Voclist>("voclists").then(lists => state.userVoclists = lists)
    }

    async function getDownloadedLists() {
      db.getItems<Voclist>("downloadedVoclists").then(lists => downloadedLists.value = lists)
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
          if (containsVoclist(allLists.value, state.sharedVoclist._id) == -1) {
            if (auth.getOid()) addListToUser({userId: auth.getOid(), vocId: state.sharedVoclist._id}) //add the voclist to the user
            allLists.value.push(state.sharedVoclist);
            correctMessage("voclist added!")
          } else wrongMessage("voclist already saved!")
        }

        if (state.hasJustAddedList) {
          const i = containsVoclist(allLists.value, state.justAddedVoclist._id);
          if (i > -1) allLists.value[i] = state.justAddedVoclist //we replace the older(online) version with the newer one
          else allLists.value.push(state.justAddedVoclist) //only one version so we push
        }

        allLists.value.forEach(list => list.lastEdited = moment(new Date(list.lastEdited)).format("lll"));

        selectedList.value = allLists.value[0];
        resetLocalDb();
      }
    })

    function removeList(args: Array<any>) {
      const list: Voclist = args[0];
      const isOfflineList = args[1];

      if (isOfflineList) {
        downloadedLists.value.splice(downloadedLists.value.indexOf(list), 1);
        db.deleteItem(list._id, "downloadedVoclists");
      } else if (navigator.onLine) {
        allLists.value.splice(allLists.value.indexOf(list), 1);
        db.deleteItem(list._id, "voclists");
        if (auth.getUser()) removeVoclist({
          vocId: list._id,
          userId: auth.getOid(),
          blobs: auth.getOid() == list.creator ? list.words.filter(word => word.img).map(word => word.img) : []
        })
      }
      normalMessage("deleted voclist!")
    }

    function openPdfModal(list: Voclist) {
      selectedList.value = list;
      pdfModalTrigger.value.click();
    }

    function shareList(listId: string) {
      selectedList.value._id = listId; //TODO hack xdd
      shareModal.value.open();
    }

    function isOffline() {
      return !navigator.onLine
    }

    function copyListLink() {
      const url = `${window.location.origin}/?oid=${selectedList.value._id}#/`
      navigator.clipboard.writeText(url).then(function () {
        correctMessage("link copied!")
        shareModal.value.close();
      })
    }

    async function downloadVoclist(list: Voclist) {
      if (containsVoclist(downloadedLists.value, list._id)) await db.deleteItem(list._id, "downloadedVoclists")
      db.downloadVoclist(list).then(() => {
        correctMessage("list downloaded!")
        getDownloadedLists();
      });
    }

    async function addVoclistToGroup(groupId) {
      addListToGroup({vocId: selectedList.value._id, groupId: groupId}).then(() => {
        correctMessage("added voclist to group!")
        shareModal.value.close();
      })

    }

    if (localStorage.getItem("justAddedVoclist")) {
      db.getItem<Voclist>(localStorage.getItem("justAddedVoclist"), "voclists").then(list => state.justAddedVoclist = list)
      localStorage.removeItem("justAddedVoclist")
    }
    if (navigator.onLine) addSharedGroup();
    if (navigator.onLine) getSharedVoclist()
    getDownloadedLists()
    if (auth.getUser() && navigator.onLine) getUserListsOnline();
    else getUserListsOffline();

    return {
      state,
      removeList,
      openPdfModal,
      selectedList,
      pdfModalTrigger,
      allLists,
      isOffline,
      downloadVoclist,
      downloadedLists,
      shareList,
      shareModalElem,
      copyListLink,
      clickedAddToGroup,
      addVoclistToGroup,
      getGroups
    }
  },
});
</script>

<style scoped>
</style>