<template>
  <div>

    <div class="modal fullscreen-modal" ref="modal">
      <i class="material-icons right unselectable close-btn modal-close">close</i>
      <div class="modal-content" v-if="selectedList">
        <h4 class="center">{{ selectedList.settings.title }}</h4>
        <div class="divider" style="margin-bottom: 30px"></div>
        <div class="row rounded z-depth-1" v-for="(word, index) in selectedList.words" :key="index">
          <div class="col s6 input-field">
            <input type="text" :value="word.from" class="word center" disabled>
          </div>
          <div class="col s6 input-field">
            <input type="text" v-model="word.to" class="word center" disabled>
          </div>
        </div>

        <div class="fixed-action-btn" style="z-index: 9999999" v-if="selectedList.creator !== oid">
          <div class="btn-floating btn-large red" @click="addVoclistToUser(selectedList)">
            <i class="large material-icons" style="font-size: 35px;">add</i>
          </div>
        </div>
      </div>
    </div>

    <div v-if="result">
      <h5 class="center">
        <i class="material-icons unselectable tooltipped" style="font-size: 35px" @click="leaveGroup"
           data-tooltip="Leave Group">exit_to_app</i>
        {{ result.group.name }}
        <i class="material-icons unselectable tooltipped" style="font-size: 35px" @click="copyGroupLink"
           data-tooltip="Copy Group Link">content_copy</i>
      </h5>
      <p class="flow-text center">{{ result.group.description }}</p>
      <div class="divider"></div>

      <div class="row" style="margin-top: 30px">
        <div class="col l4 m6 s12" v-for="(list, i) in result.group.voclists" :key="i">
          <GroupVocCard :list="list" v-on:remove="removeListFromGroup" v-on:add="addVoclistToUser"
                        v-on:showList="showList"></GroupVocCard>
        </div>
      </div>
    </div>

    <div v-else>
      <Loader></Loader>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, ref} from "@vue/composition-api";
import {
  useAddVoclistToUserMutation, useCopyVoclistMutation,
  useGetGroupQuery,
  useRemoveUserFromGroupMutation,
  useRemoveVoclistFromGroupMutation, Voclist
} from "@/gen-types";
import {getCountry} from "@/use/general";
import {correctMessage} from "@/use/general";
import {AuthModule} from "@/use/authModule";
import GroupVocCard from "@/components/voc/groups/GroupVocCard.vue";
import Loader from "@/components/Loader.vue";

import M from "materialize-css"
import {addVoclist, removeGroup, userLists} from "@/use/state";
import {Localdb} from "@/use/localdb";


export default defineComponent({
  components: {
    GroupVocCard,
    Loader
  },
  setup(props, context) {

    const {mutate: removeListMutation} = useRemoveVoclistFromGroupMutation(null)
    const {mutate: addListMutation} = useAddVoclistToUserMutation(null);
    const {mutate: leaveGroupMutation} = useRemoveUserFromGroupMutation(null);
    const {mutate: copyVoclist} = useCopyVoclistMutation(null);
    const {result, loading} = useGetGroupQuery({groupId: localStorage.getItem("group")}, {fetchPolicy: "cache-and-network"});

    const auth = inject<AuthModule>("auth");
    const db = inject<Localdb>("db");
    const selectedList = ref<Voclist>(null);

    const modal = ref<HTMLElement>(null);
    const modalInstance = ref<M.Modal>(null);

    onMounted(() => {
      modalInstance.value = M.Modal.init(modal.value);
    })

    async function removeListFromGroup(list: Voclist) {
      removeListMutation({vocId: list._id, groupId: localStorage.getItem("group")}).then(() => {
        correctMessage("removed list from group");
        const voclists = result.value.group.voclists;
        voclists.splice(voclists.indexOf(list), 1);
      })
    }

    async function addVoclistToUser(list: Voclist) {
      if (auth.getOid().value) {
        copyVoclist({voclistId: list._id}).then(async voclist => {
          await addListMutation({vocId: voclist.data.copyVoclist._id, userId: auth.getOid().value})
          db.save("voclists", voclist.data.copyVoclist).then(() => db.addListToUser(voclist.data.copyVoclist._id))
          addVoclist(voclist.data.copyVoclist);
          correctMessage("added voclist to collection!");
        });
      } else {
        addVoclist(list);
        await db.save("voclists", list);
        await db.addListToUser(list._id);
        correctMessage("added voclist to collection!");
      }
    }

    function copyGroupLink() {
      const url = `${window.location.origin}/?groupId=${localStorage.getItem("group")}#/`
      navigator.clipboard.writeText(url).then(function () {
        correctMessage("link copied!")
      })
    }

    function leaveGroup() {
      removeGroup(localStorage.getItem("group"));
      context.root.$router.push("/");
      correctMessage("left the group")
      if (auth.getOid().value) leaveGroupMutation({userId: auth.getOid().value, groupId: localStorage.getItem("group")})
      else db.removeGroupFromUser(localStorage.getItem("group"));
    }

    function showList(list: Voclist) {
      selectedList.value = list;
      modalInstance.value.open();
    }

    return {
      result,
      loading,
      getCountry,
      removeListFromGroup,
      addVoclistToUser,
      copyGroupLink,
      leaveGroup,
      showList,
      selectedList,
      modal,
      oid: auth.getOid()
    }
  },
});
</script>

<style scoped>
.right-margin {
  margin-right: 30px;
}

.rounded {
  padding: 3px;
  border-radius: 10px;
}

.word {
  height: 1.5rem !important;
  margin-bottom: 0 !important;
}
</style>