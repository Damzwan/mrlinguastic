<template>
  <div>

    <div class="modal fullscreen-modal" ref="modal"
         :style="{backgroundImage: 'url(' + require('@/assets/triangle2.svg') + ')'}">
      <i class="material-icons right unselectable close-btn modal-close">close</i>
      <div class="modal-content" v-if="selectedList">
        <h4 class="center">{{ selectedList.settings.title }}</h4>
        <div class="divider" style="margin-bottom: 30px"></div>
        <div class="row rounded z-depth-1" v-for="(word, index) in selectedList.words" :key="index"
             style="background-color: #ead9a1">
          <div class="col s6 input-field">
            <input type="text" :value="word.from" class="word center" disabled>
          </div>
          <div class="col s6 input-field">
            <input type="text" v-model="word.to" class="word center" disabled>
          </div>
        </div>
      </div>
    </div>

    <div v-if="result && !loading">
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
          <GroupVocCard :list="list" v-on:remove="removeListFromGroup"
                        v-on:showList="showList"></GroupVocCard>
        </div>
      </div>
    </div>

    <Loader v-else></Loader>

    <div class="fixed-action-btn" style="z-index: 9999999"
         v-if="selectedList && selectedList.creator !== oid && isModalOpen">
      <div class="btn-floating btn-large red" @click="addVoclistToUser(selectedList)">
        <i class="large material-icons" style="font-size: 35px;">add</i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, onUnmounted, onUpdated, ref, watch} from "@vue/composition-api";
import {
  BasicVoclist,
  useAddVoclistToUserMutation,
  useCopyImgsMutation,
  useCopyVoclistMutation,
  useGetGroupQuery,
  useRemoveUserFromGroupMutation,
  useRemoveVoclistFromGroupMutation,
  Voclist
} from "@/gen-types";
import {correctMessage, getCountry, newLastUpdated} from "@/use/general";
import {AuthModule} from "@/use/authModule";
import GroupVocCard from "@/components/voc/groups/GroupVocCard.vue";
import Loader from "@/components/Loader.vue";

import M from "materialize-css"
import {addVoclist, event, removeGroup, sendEvent} from "@/use/state";
import {Localdb} from "@/use/localdb";
import {v1 as uuidv1} from 'uuid';
import {useVoclistUpdater} from "@/use/listUpdater";


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
    const {mutate: copyImgs} = useCopyImgsMutation(null);
    const {result, refetch, loading} = useGetGroupQuery({groupId: localStorage.getItem("group")}, {fetchPolicy: "cache-and-network"});
    const {createVoclistFromBasic} = useVoclistUpdater();

    const auth = inject<AuthModule>("auth");
    const db = inject<Localdb>("db");
    const selectedList = ref<Voclist>(null);

    const modal = ref<HTMLElement>(null);
    const modalInstance = ref<M.Modal>(null);

    const isModalOpen = ref(false);

    function flipIsModalOpen() {
      isModalOpen.value = !isModalOpen.value;
    }

    onMounted(() => {
      modalInstance.value = M.Modal.init(modal.value, {onOpenStart: flipIsModalOpen, onCloseStart: flipIsModalOpen});
    })

    onUnmounted(() => {
      modalInstance.value.destroy();
    })

    onUpdated(() => {
      M.Tooltip.init(document.querySelectorAll('.tooltipped'));
    })

    async function removeListFromGroup(list: Voclist) {
      correctMessage("removed list from group");
      const voclists = result.value.group.voclists;
      for (let i = 0; i < voclists.length; i++)
        if (voclists[i]._id == list._id)
          voclists.splice(i, 1);

      await removeListMutation({vocId: list._id, groupId: localStorage.getItem("group")})
    }

    async function addVoclistToUser(list: Voclist) {
      if (auth.getOid().value) {
        copyVoclist({
          voclistId: list._id,
          userId: auth.getOid().value,
          lastUpdated: newLastUpdated()
        }).then(async voclist => {
          db.save("voclists", voclist.data.copyVoclist).then(() => db.addListToUser(voclist.data.copyVoclist._id))
          addVoclist(voclist.data.copyVoclist);
          correctMessage("added voclist to collection!");
          modalInstance.value.close();
          await addListMutation({vocId: voclist.data.copyVoclist._id, userId: auth.getOid().value})
        });
      } else {
        const copy = Object.assign({}, list);
        copy._id = uuidv1();

        const copiedImgs = await copyImgs({imgs: copy.words.map(word => word.img)});
        for (let i = 0; i < copy.words.length; i++)
          copy.words[i].img = copiedImgs.data?.copyImgs[i];

        addVoclist(copy);
        correctMessage("added voclist to collection!");
        modalInstance.value.close();
        await Promise.all([db.save("voclists", copy), db.addListToUser(copy._id)])
      }
    }

    function copyGroupLink() {
      const url = `${window.location.origin}/?groupId=${localStorage.getItem("group")}#/`

      if (navigator.share) {
        navigator.share({
          title: 'mrlinguastic group',
          text: result.value.group.name,
          url: url,
        })
      } else {
        navigator.clipboard.writeText(url).then(function () {
          correctMessage("link copied!")
        })
      }
    }

    function leaveGroup() {
      removeGroup(localStorage.getItem("group"));
      context.root.$router.push("/");
      correctMessage("left the group")
      if (auth.getOid().value) leaveGroupMutation({
        userId: auth.getOid().value,
        groupId: localStorage.getItem("group"),
        lastUpdated: newLastUpdated()
      })
      else db.removeGroupFromUser(localStorage.getItem("group"));
    }

    async function showList(list: BasicVoclist) {
      if (!selectedList.value || list._id != selectedList.value._id) selectedList.value = await createVoclistFromBasic(list);
      modalInstance.value.open();
    }

    watch(event, () => {
      if (!event.value) return;
      refetch({groupId: localStorage.getItem("group")})
      sendEvent(null); //notify that message has been read
    })

    return {
      result,
      refetch,
      loading,
      getCountry,
      removeListFromGroup,
      addVoclistToUser,
      copyGroupLink,
      leaveGroup,
      showList,
      selectedList,
      modal,
      oid: auth.getOid(),
      isModalOpen
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

.divider {
  background-color: black;
}
</style>