<template>
  <div class="modal" ref="modalElement" id="groupModal">
    <div class="modal-content">
      <h4 class="center">Create Group</h4>
      <div class="divider"></div>
      <div class="row">
        <div class="input-field col s12">
          <input placeholder="Placeholder" id="groupName" type="text">
          <label for="groupName">Name</label>
        </div>
        <div class="input-field col s12">
          <input id="description" type="text">
          <label for="description">Description</label>
        </div>
      </div>
      <div class="modal-footer">
        <div class="modal-close waves-effect waves-green btn" @click="createGroup">Create group</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent, inject, onMounted, ref} from "@vue/composition-api";
import {addGroup, changeProfilePicState} from "@/use/state";
import {Community, correctMessage, getBlobUrl, newLastUpdated, wrongMessage} from "@/use/general";
import Modal = M.Modal;
import {useChangeProfilePicMutation, useCreateGroupMutation} from "@/gen-types";
import {Localdb} from "@/use/localdb";
import {AuthModule} from "@/use/authModule";
import M from "materialize-css";

export default defineComponent({
  setup() {
    const groupModal = ref<M.Modal>(null);
    const modalElement = ref<HTMLElement>(null);
    const {mutate: createGroupMutation} = useCreateGroupMutation(null);
    const auth = inject<AuthModule>("auth");
    const db = inject<Localdb>("db");

    onMounted(() => {
      groupModal.value = M.Modal.init(modalElement.value, {onOpenStart: openGroupModal})
    });

    async function createGroup() {
      const name = document.getElementById("groupName") as HTMLInputElement;
      const description = document.getElementById("description") as HTMLInputElement;
      if (name.value != "") {
        const id = await createGroupMutation({
          groupInfo: {name: name.value, description: description.value},
          userId: auth.getOid().value, lastUpdated: newLastUpdated()
        })
        correctMessage("created group!")
        if (id.data.createGroup) addGroup({name: name.value, _id: id.data.createGroup});
        await db.addGroupToUser({name: name.value, _id: id.data.createGroup})
      }
    }

    function openGroupModal() {
      if (navigator.onLine && auth.getOid().value) return;
      if (!navigator.onLine) wrongMessage("must be online to create a list");
      else if (!auth.getOid().value) wrongMessage("can't make groups when not logged in!");
      groupModal.value.close();
    }

    return {
      createGroup,
      modalElement
    }

  },
});
</script>
