<template>
  <div class="modal bottom-sheet" ref="modal" id="shareModal" :style="{backgroundImage: 'url(' + require('@/assets/triangle2.svg') + ')'}">
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
        <a class="collection-item unselectable" @click="addVoclistToCommunity(community._id)" v-if="community">
          <img :src="require(`@/assets/country-flags/${community.country}.svg`)" alt="flag" class="left"
               width="24px" height="24px" style="position: relative; margin-right: 10px">
          Add to {{ community.name }} Community
        </a>
      </div>
      <div v-else-if="clickedAddToGroup">
        <div class="collection">
          <a class="collection-item unselectable" v-for="group in groups" @click="addVoclistToGroup(group._id)"
             :key="group._id">
            <i class="material-icons unselectable">group</i>
            {{ group.name }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, ref,} from "@vue/composition-api";
import {useAddVoclistToGroupMutation, Voclist} from "@/gen-types";
import M from "materialize-css";
import {Community, correctMessage, getCountry} from "@/use/general";
import {communities, groups} from "@/use/state";
import Modal = M.Modal;

export default defineComponent({
  props: {
    list: Object as () => Voclist
  },
  setup(props, context) {
    const modal = ref<HTMLElement>(null);
    const shareModal = ref<Modal>(null);
    const clickedAddToGroup = ref(false);
    const clickedAddToCommunity = ref(false);
    const community = ref<Community>(null);

    const {mutate: addListToGroup} = useAddVoclistToGroupMutation({});

    function reset() {
      clickedAddToGroup.value = false;
    }

    function copyListLink() {
      const url = `${window.location.origin}/?oid=${props.list._id}#/home`
      if (navigator.share) {
        navigator.share({
          title: 'mrlinguastic voclist',
          text: props.list.settings.title,
          url: url,
        })
      } else {
        navigator.clipboard.writeText(url).then(function () {
          correctMessage("link copied!")
        })
      }
      shareModal.value.close();
    }

    function addVoclistToGroup(groupId: string) {
      correctMessage("added voclist to group!")
      shareModal.value.close();
      addListToGroup({vocId: props.list._id, groupId: groupId})
    }

    function addVoclistToCommunity(communityId: string) {
      correctMessage("added voclist to community!")
      shareModal.value.close();
      addListToGroup({vocId: props.list._id, groupId: communityId});
    }

    function update(){
      community.value = communities.value.length > 0 ? communities.value.reduce((acc, community) =>
          community.country == getCountry(props.list.settings.langSettings.toLang) ? acc = community : acc) : null;
    }

    onMounted(() => {
      shareModal.value = M.Modal.init(modal.value, {onCloseEnd: reset, onOpenStart: update})
    })

    onUnmounted(() => {
      shareModal.value.destroy();
    })

    return {
      modal,
      copyListLink,
      groups,
      addVoclistToGroup,
      clickedAddToGroup,
      clickedAddToCommunity,
      community,
      addVoclistToCommunity
    }
  }
});
</script>

<style scoped>

.collection-item{
  background-color: initial;
  color: black !important;
  border-bottom: 1px solid #000000;
}

.collection {
  border: initial !important;
  overflow: hidden;
  position: relative;
}
</style>