<template>
  <div>
    <div class="section">
      <h5 class="center-align hide-on-large-only">🐉 Choose or create a voc list 🐉</h5>
      <h4 class="center-align hide-on-med-and-down">🐉 Choose or create a voc list 🐉</h4>
    </div>

    <div class="fixed-action-btn">
      <router-link to="/vocabulary/create" class="btn-floating btn-large red">
        <i class="large material-icons" style="font-size: 35px;">add</i>
      </router-link>
    </div>

    <!-- use VFOR and a list of voc lists -->
    <div class="row" v-if="lists">
      <div class="col l4 m6 s12" v-for="(list, index) in lists" :key="index">
        <VoclistCard v-bind:list="list" v-on:removeList="removeList"></VoclistCard>
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
import {defineComponent, inject, reactive, ref, watch} from "@vue/composition-api";
import VoclistCard from "./VoclistCard.vue";
import {getDb} from "@/use/localdb";
import {useDeleteVoclistMutation, useGetUsersQuery, Voclist} from "@/gen-types";
import {AuthModule} from "@/use/authModule";

export default defineComponent({
  components: {
    VoclistCard,
  },
  setup() {
    localStorage.removeItem("_id");

    const auth = inject<AuthModule>("auth");
    const lists = ref<Voclist[]>(null)
    const db = getDb();

    const {mutate: removeVoclist} = useDeleteVoclistMutation(null);

    async function getListsOffline() {
      if (db.db) lists.value = await db.getAllVoclists();
      else db.connect().then(async () => lists.value = await db.getAllVoclists());
    }

    async function getListsOnline(newLists: Voclist[]) {
      lists.value = newLists;
      db.connect().then(() => {
        db.clearStore().then(() => {
          lists.value.forEach(list => {
            db.save("voclists", list)
          })
        })
      })
    }

    const {result} = useGetUsersQuery({oid: auth.getOid()}); //TODO should use the enabled option but it fails...
    if (auth.getUser() && navigator.onLine) {
      if (result.value) getListsOnline(result.value.user.voclists);
      watch(result, () => getListsOnline(result.value.user.voclists))
    } else getListsOffline();


    function removeList(list: Voclist) {
      lists.value.splice(lists.value.indexOf(list), 1);
      db.deleteVoclist(list._id);
      if (auth.getUser() && navigator.onLine) removeVoclist({vocId: list._id, userId: auth.getOid()})
    }

    return {lists, removeList}

  },
});
</script>

<style scoped>
</style>