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
        <Card v-bind:list="list"></Card>
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
import {defineComponent, reactive, ref, watch} from "@vue/composition-api";
import Card from "./Card.vue";
import moment from 'moment';
import {getDb} from "@/use/localdb";
import {useGetVoclistsQuery, Voclist, VoclistInput} from "@/gen-types";
import {useResult} from "@vue/apollo-composable";

export default defineComponent({
  components: {
    Card,
  },
  setup() {
    localStorage.removeItem("_id");
    const lists = ref<Voclist[]>(null)
    const db = getDb();

    const {result} = useGetVoclistsQuery();

    async function getLists() {
      lists.value = await db.getAllVoclists();
    }

    if (db.db) getLists();
    else db.connect().then(() => getLists())

    watch(result, () => {
      lists.value = result.value.getVoclists;
      lists.value.forEach(list => {
        db.save("voclists", list)
      })
    })


    return {lists}

  },
});
</script>

<style scoped>
</style>