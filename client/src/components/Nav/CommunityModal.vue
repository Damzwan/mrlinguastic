<template>
  <div class="modal" ref="communityModalElem" id="communityModal">
    <div class="modal-content" v-if="communities">
      <h4 class="center">Join a community</h4>
      <div class="divider"></div>
      <div class="collection">
        <a class="collection-item row" v-for="(community, i) in getCommunities()" :key="i">
          <div class="col s9 m10">
            <img :src="require(`@/assets/country-flags/${community.country}.svg`)" alt="flag" class="left"
                 width="24px" height="24px" style="position: relative; margin-right: 10px">
            {{ community.name }} community
          </div>
          <div class="col s3 m2">
            <a class="waves-effect waves-green btn" @click="joinCommunity(community)"
               :class="{disabled: communities.includes(community)}">Join</a>
          </div>
        </a>
      </div>
      <div class="modal-footer">
        <div class="modal-close waves-effect waves-green btn-flat">Close</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent, inject, onMounted, ref} from "@vue/composition-api";
import {addGroup, changeProfilePicState, communities} from "@/use/state";
import {Community, correctMessage, getBlobUrl, getCommunities, newLastUpdated} from "@/use/general";
import Modal = M.Modal;
import {useAddUserToGroupMutation, useChangeProfilePicMutation} from "@/gen-types";
import {Localdb} from "@/use/localdb";
import {AuthModule} from "@/use/authModule";
import M from "materialize-css";

export default defineComponent({
  setup() {
    const communityModalElem = ref<HTMLElement>(null);
    const {mutate: addUserToGroup} = useAddUserToGroupMutation({});
    const db = inject<Localdb>("db");
    const auth = inject<AuthModule>("auth");

    function joinCommunity(community: Community) {
      addGroup({_id: community._id, name: community.name})
      auth.getOid().value ? addUserToGroup({
            userId: auth.getOid().value,
            groupId: community._id,
            lastUpdated: newLastUpdated()
          }) :
          db.addGroupToUser({_id: community._id, name: community.name});
      correctMessage("Joined community!");
    }

    onMounted(() => {
      M.Modal.init(communityModalElem.value)
    });

    return {
      communities,
      getCommunities,
      communityModalElem,
      joinCommunity
    }

  },
});
</script>
