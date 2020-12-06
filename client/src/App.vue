<template>
  <div id="app">
    <Nav></Nav>
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {useCopyVoclistMutation, User, Voclist} from "@/gen-types";
import {provide, watch} from "@vue/composition-api";
import {setDownloadedLists, setUser} from "@/use/state";
import {AuthModule} from "@/use/authModule";
import {Localdb, UserDbObject} from "@/use/localdb";
import Nav from "./components/Nav.vue";
import {useUrlHandler} from "@/use/urlHandler";
import {useGetLastUpdatedQueryLazy, useGetUserQueryLazy} from "@/use/lazyQueries";
import {convertToBasicVoclist, convertToNormalVoclist, getLastUpdated} from "@/use/general";
import {useServiceWorkerRefresher} from "@/use/serviceWorkerRefresher";
import M from "materialize-css"

export default Vue.extend({
  components: {
    Nav,
  },
  setup() {
    const auth = new AuthModule();
    const db = new Localdb();

    provide("db", db);
    provide("auth", auth);

    const {result: user, load: getUserOnline} = useGetUserQueryLazy();
    const {result: lastUpdatedOnline, load: getLastUpdatedOnline} = useGetLastUpdatedQueryLazy()
    const {checkForSharedItems} = useUrlHandler();
    const {updateExists} = useServiceWorkerRefresher();

    const {mutate: copyVoclist} = useCopyVoclistMutation({}); //we need this for some fucking reason and i do not understand

    async function handleLoggedOutMode() {
      let user: UserDbObject = await db.getItem("0", "user");
      if (!user) user = await db.createUser();
      setUser({
        _id: user._id,
        voclists: (await Promise.all(user.voclists.map(vocId => db.getItem<Voclist>(vocId, "voclists")))).
        filter(list => list.lastEdited).map(list => convertToBasicVoclist(list)),
        groups: user.groups
      });
      if (navigator.onLine) await checkForSharedItems(auth.getOid().value);
    }

    async function handleLoggedInMode() {
      const lastUpdated = getLastUpdated();
      if (!lastUpdated) getUserOnline(null, {oid: auth.getOid().value})
      else {
        getLastUpdatedOnline(null, {oid: auth.getOid().value})
        watch(lastUpdatedOnline, async () => {
          if (new Date(lastUpdatedOnline.value.lastUpdated) <= new Date(lastUpdated)) {
            let user: UserDbObject = await db.getItem("0", "user");
            setUser({
              _id: user._id,
              voclists: (await Promise.all(user.voclists.map(vocId => db.getItem<Voclist>(vocId, "voclists"))))
                  .map(list => convertToBasicVoclist(list)),
              groups: user.groups
            });
          } else getUserOnline(null, {oid: auth.getOid().value})
        })
      }

      watch(user, async () => {
        setUser(user.value.user as User);
        db.updateUser(user.value.user.voclists.map(list => convertToNormalVoclist(list)), user.value.user.groups).then(() => {
          localStorage.setItem("lastUpdated", user.value.user.lastUpdated)
        })
        await checkForSharedItems(auth.getOid().value);
      })
    }

    Promise.all([auth.loadAuthModule(), db.connect()]).then(() => {
      db.getItems<Voclist>("downloadedVoclists").then(lists => setDownloadedLists(lists));
      if (!auth.getOid().value || !navigator.onLine) handleLoggedOutMode()
      else handleLoggedInMode();
    })

    watch(updateExists, () => {
      if (!updateExists.value) return;
      const toastHTML = '<span>A newer version is out, please update the app!</span><button onclick="window.location.reload(true)" class="btn-flat toast-action">Update</button>';
      M.toast({html: toastHTML, displayLength: 6000});
    })
  }
});
</script>

<style>
body {
  background-image: url('assets/triangle2.svg');
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}
</style>