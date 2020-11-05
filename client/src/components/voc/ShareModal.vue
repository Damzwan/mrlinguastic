<template>
  <div class="modal bottom-sheet" ref="modal" id="shareModal">
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
import {defineComponent, onMounted, reactive, ref, watch,} from "@vue/composition-api";
import {useAddVoclistToGroupMutation, Voclist, Word} from "@/gen-types";
import M from "materialize-css";
import {correctMessage} from "@/use/general";
import Modal = M.Modal;
import {groups} from "@/use/state";

export default defineComponent({
  props: {
    list: Object as () => Voclist
  },
  setup(props, context) {
    const modal = ref<HTMLElement>(null);
    const shareModal = ref<Modal>(null);
    const clickedAddToGroup = ref(false);

    const {mutate: addListToGroup} = useAddVoclistToGroupMutation({});

    function reset() {
      clickedAddToGroup.value = false;
    }

    function copyListLink() {
      const url = `${window.location.origin}/?oid=${props.list._id}#/`
      navigator.clipboard.writeText(url).then(function () {
        correctMessage("link copied!")
        shareModal.value.close();
      })
    }

    function addVoclistToGroup(groupId: string) {
      addListToGroup({vocId: props.list._id, groupId: groupId}).then(() => {
        correctMessage("added voclist to group!")
        shareModal.value.close();
      })
    }

    onMounted(() => {
      shareModal.value = M.Modal.init(modal.value, {onCloseEnd: reset})
    })

    return {modal, copyListLink, groups, addVoclistToGroup, clickedAddToGroup}
  }
});
</script>

<style scoped>
</style>