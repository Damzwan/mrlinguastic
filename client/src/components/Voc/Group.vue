<template>
  <div>

    <div class="modal fullscreen-modal" ref="modal">
      <i class="material-icons right unselectable close-btn modal-close">close</i>
      <div class="modal-content" v-if="selectedList">
        <h4 class="center">{{selectedList.settings.title}}</h4>
        <div class="divider" style="margin-bottom: 30px"></div>
          <div class="row rounded z-depth-1" v-for="(word, index) in selectedList.words" :key="index">
            <div class="col s6 input-field">
              <input type="text" :value="word.from" class="word center" disabled>
            </div>
            <div class="col s6 input-field">
              <input type="text" v-model="word.to" class="word center" disabled>
            </div>
          </div>

        <div class="fixed-action-btn" style="z-index: 9999999">
          <div class="btn-floating btn-large red" @click="addVoclistToUser(selectedList)">
            <i class="large material-icons" style="font-size: 35px;">add</i>
          </div>
        </div>
      </div>
    </div>

    <div v-if="result">
      <h4 class="center">
        <i class="material-icons unselectable" style="font-size: 35px" @click="leaveGroup">exit_to_app</i>
        {{ result.group.name }}
        <i class="material-icons unselectable" style="font-size: 35px" @click="copyGroupLink">content_copy</i>
      </h4>
      <p class="flow-text center">{{ result.group.description }}</p>
      <div class="divider"></div>

      <div class="row">
        <div class="col l4 m6 s12" v-for="(list, i) in result.group.voclists" :key="i">
          <GroupVoclistCard :list="list" v-on:remove="removeListFromGroup" v-on:add="addVoclistToUser"
                            v-on:showList="showList"></GroupVoclistCard>
        </div>
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
import {defineComponent, inject, onMounted, ref} from "@vue/composition-api";
import {
  useAddVoclistToUserMutation, useCopyVoclistMutation,
  useGetGroupQuery,
  useRemoveUserFromGroupMutation,
  useRemoveVoclistFromGroupMutation, Voclist
} from "@/gen-types";
import {getCountry} from "@/use/languageToCountry";
import {correctMessage} from "@/use/messages";
import {AuthModule} from "@/use/authModule";
import {useState} from "@/use/vuex";
import GroupVoclistCard from "@/components/Voc/GroupVoclistCard.vue";
import {Localdb} from "@/use/localdb";
import M from "materialize-css"


export default defineComponent({
  components: {
    GroupVoclistCard
  },
  setup(props, context) {

    const {mutate: removeListMutation} = useRemoveVoclistFromGroupMutation(null)
    const {mutate: addListMutation} = useAddVoclistToUserMutation(null);
    const {mutate: leaveGroupMutation} = useRemoveUserFromGroupMutation(null);
    const {mutate: copyVoclist} = useCopyVoclistMutation(null);
    const {result, loading} = useGetGroupQuery({groupId: localStorage.getItem("group")}, {fetchPolicy: "cache-and-network"});

    const {removeGroup} = useState();

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
      copyVoclist({voclistId: list._id}).then(async voclist => {
        await Promise.all([addListMutation({
          vocId: voclist.data.copyVoclist._id,
          userId: auth.getOid()
        }), db.save("voclists", voclist.data.copyVoclist)]);
        correctMessage("added voclist to collection!");
        localStorage.setItem("justAddedVoclist", voclist.data.copyVoclist._id);
        await context.root.$router.push("/");
      })
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
      leaveGroupMutation({userId: auth.getOid(), groupId: localStorage.getItem("group")})
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
      modal
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