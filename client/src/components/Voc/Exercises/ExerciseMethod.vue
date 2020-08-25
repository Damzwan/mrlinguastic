<template>
  <div class="col l4 m6 s12">
    <div class="card transparent">
      <div class="card-tabs">
        <ul class="tabs tabs-fixed-width blue-grey darken-4" ref="tabs">
          <li class="tab" v-for="(route, index) in exerciseMethod.routes" :key="index">
            <a v-bind:href="`#${exerciseMethod.icon}${index}`"
               class="active white-text">{{ exerciseMethod.tabTitles[index] }}</a>
          </li>
        </ul>
      </div>

      <div v-for="(routeItem, index) in exerciseMethod.routes" :key="index"
           v-bind:id="`${exerciseMethod.icon}${index}`">
        <div class="card-content center-align" @click="goToExercise(routeItem)" style="cursor: pointer;">
          <div class="row" style="margin-bottom: 0">
            <div class="col s2"><i class="material-icons medium unselectable rounded-icon">{{ exerciseMethod.icon }}</i>
            </div>
            <div class="col s8 offset-s2">
              <h4 class="unselectable">{{ exerciseMethod.text }}</h4>
<!--              <p>Exercise your vocabulary by filling in the words</p>-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "@vue/composition-api";
import M from "materialize-css";

export interface ExerciseMethods {
  tabTitles: string[];
  routes: string[];
  icon: string;
  text: string;
}

export default defineComponent({
  props: {
    exerciseMethod: Object as () => ExerciseMethods
  },
  setup(props, context) {

    const tabs = ref(null);

    onMounted(() => {
      M.Tabs.init(tabs.value)
    })

    function goToExercise(route: string) {
      context.root.$router.push(`exercises/${route}`);
    }

    return {goToExercise, tabs}
  },
});
</script>

<style scoped>
.rounded-icon {
  display: inline-block;
  border-radius: 60px;
  box-shadow: 0 0 2px #888;
  padding: 0.2em 0.2em;
}

.tabs .tab a.active {
  background-color: #455a64;
  color: #000;
}

.tabs .tab a:focus.active {
  background-color: #455a64;
  color: #000;
}
</style>