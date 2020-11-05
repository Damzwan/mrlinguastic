<template>
  <div id="app">
    <Nav></Nav>
    <router-view v-if="isLoaded"></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  GetUserQuery,
  useAddUserToGroupMutation,
  useCopyVoclistMutation, useGetBasicGroupInfoQuery, useGetGroupQuery,
  useGetUserQuery,
  useGetVoclistQuery,
  User,
  Voclist
} from "@/gen-types";
import {provide, ref, watch} from "@vue/composition-api";
import {addGroup, addVoclist, BasicGroupInfo, groups, setUser, userLists} from "@/use/state";
import {AuthModule} from "@/use/authModule";
import {Localdb, UserDbObject} from "@/use/localdb";
import {correctMessage, wrongMessage} from "@/use/general";
import Nav from "./components/Nav.vue";

export default Vue.extend({
  components: {
    Nav,
  },
  setup() {
    const auth = new AuthModule();
    const db = new Localdb();

    provide("db", db);
    provide("auth", auth);

    const isLoaded = ref(false);

    const {result, refetch} = useGetUserQuery({oid: ""}, {fetchPolicy: "cache-and-network"});

    const {result: voclist, refetch: getVoclist} = useGetVoclistQuery({voclistId: ""}); //TODO ugly
    const {result: group, refetch: getGroup} = useGetBasicGroupInfoQuery({groupId: ""}); //TODO ugly

    const {mutate: copyVoclist} = useCopyVoclistMutation({});
    const {mutate: addUserToGroup} = useAddUserToGroupMutation({});


    async function getSharedVoclist(voclistId: string) {
      console.log("activated")
      //TODO big ugly :(
      if (auth.getOid().value) {
        const voclist = await copyVoclist({voclistId: voclistId})
        if (voclist) {
          addVoclist(voclist.data?.copyVoclist as Voclist);
          correctMessage("added voclist");
        } else wrongMessage("list does not exist");
      } else {
        await getVoclist({voclistId: voclistId})
        if (voclist.value) {
          addVoclist(voclist.value.voclist as Voclist);
          await db.save("voclists", voclist.value.voclist as Voclist)
          await db.addListToUser(voclistId);
          correctMessage("added voclist");
        } else wrongMessage("list does not exist");
      }
    }

    async function getSharedGroup(groupId: string) {
      if (auth.getOid().value) addUserToGroup({userId: auth.getOid().value, groupId: groupId}).then(item => {
        if (item.data.addUserToGroup) {
          addGroup({_id: groupId, name: item.data.addUserToGroup});
          correctMessage("added group!");
        } else wrongMessage("group does not exist");
      })
      else {
        await getGroup({groupId: groupId});
        if (group.value) {
          addGroup({_id: groupId, name: group.value.group.name});
          await db.addGroupToUser({_id: groupId, name: group.value.group.name});
          correctMessage("added group!");
        } else wrongMessage("group does not exist");
      }
    }

    async function checkForSharedItems() {
      const sharedLink = window.location.search;
      if (!sharedLink) return;
      const voclistId = new URLSearchParams(sharedLink).get("oid");
      const groupId = new URLSearchParams(sharedLink).get("groupId");
      console.log(voclistId);
      console.log(groupId);
      await Promise.all([voclistId ? getSharedVoclist(voclistId) : null, groupId ? getSharedGroup(groupId) : null])
      window.history.replaceState({}, document.title, "/#/"); //remove url parameters
    }

    async function resetLocalDb(voclists: Voclist[], groups: BasicGroupInfo[]) {
      db.clearStore("voclists").then(() => {
        voclists.forEach(list => {
          db.save("voclists", list)
        })
      })
      db.resetUser(voclists.map(list => list._id), groups).then();
    }

    Promise.all([auth.loadAuthModule(), db.connect()]).then(async () => {
      isLoaded.value = true;
      if (!auth.getOid().value || !navigator.onLine) {
        let user: UserDbObject = await db.getItem("0", "user");
        if (!user) user = await db.createUser();
        setUser({
          _id: user._id,
          voclists: await Promise.all(user.voclists.map(vocId => db.getItem<Voclist>(vocId, "voclists"))),
          groups: user.groups
        });
        if (navigator.onLine) await checkForSharedItems();
      } else {
        await refetch({oid: auth.getOid().value})
        watch(result, async () => {
          setUser(result.value.user);
          await checkForSharedItems();
          await resetLocalDb(userLists.value, groups.value)
        })
      }
    })
    return {isLoaded}
  }
});
</script>