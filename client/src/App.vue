<template>
  <div id="app">
    <Nav></Nav>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {useCopyVoclistMutation, User, Voclist} from "@/gen-types";
import {provide, watch} from "@vue/composition-api";
import {groups, setUser, userLists, setDownloadedLists} from "@/use/state";
import {AuthModule} from "@/use/authModule";
import {Localdb, UserDbObject} from "@/use/localdb";
import Nav from "./components/Nav.vue";
import {useUrlHandler} from "@/use/urlHandler";
import {useGetUserQueryLazy} from "@/use/lazyQueries";
import {convertToBasicVoclist} from "@/use/general";

export default Vue.extend({
  components: {
    Nav,
  },
  setup() {
    const auth = new AuthModule();
    const db = new Localdb();

    provide("db", db);
    provide("auth", auth);

    const {result, load} = useGetUserQueryLazy();
    const {checkForSharedItems} = useUrlHandler();

    const {mutate: copyVoclist} = useCopyVoclistMutation({}); //we need this for some fucking reason and i do not understand

    async function handleLoggedOutMode() {
      let user: UserDbObject = await db.getItem("0", "user");
      if (!user) user = await db.createUser();
      setUser({
        _id: user._id,
        voclists: (await Promise.all(user.voclists.map(vocId => db.getItem<Voclist>(vocId, "voclists"))))
            .map(list => convertToBasicVoclist(list)),
        groups: user.groups
      });
      if (navigator.onLine) await checkForSharedItems(auth.getOid().value);
    }

    async function handleLoggedInMode() {
      load(null, {oid: auth.getOid().value})
      watch(result, async () => {
        setUser(result.value.user as User);
        await checkForSharedItems(auth.getOid().value);
      })
    }

    Promise.all([auth.loadAuthModule(), db.connect()]).then(() => {
      db.getItems<Voclist>("downloadedVoclists").then(lists => setDownloadedLists(lists));
      if (!auth.getOid().value || !navigator.onLine) handleLoggedOutMode()
      else handleLoggedInMode();
    })
  }
});
</script>

<style>
body {
  background-image: url('assets/triangle2.svg');
}
</style>