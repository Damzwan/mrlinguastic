<template>
  <div class="col l4 m6 s12">
    <div class="card" style="background-color: #ead9a1; height: 130px">
      <div class="card-tabs">
        <ul class="tabs tabs-fixed-width" ref="tabs">
          <li class="tab" v-for="(i) in filterRoutes(exerciseMethod)" :key="i">
            <a v-bind:href="`#${exerciseMethod.icon}${i}`" class="active white-text">{{
                exerciseMethod.tabTitles[i]
              }}</a>
          </li>
        </ul>
      </div>

      <div v-for="(i) in filterRoutes(exerciseMethod)" :key="i"
           v-bind:id="`${exerciseMethod.icon}${i}`">
        <div class="card-content center-align" @click="goToExercise(exerciseMethod.routes[i])" style="cursor: pointer; padding: 7px 10px 5px 24px" >
          <div class="row">
            <div class="col s1"><i class="material-icons unselectable rounded-icon" style="font-size: 3.4rem">{{ exerciseMethod.icon }}</i>
            </div>
            <div class="col s8 offset-s2">
              <h4 class="unselectable architects-daughter">{{ exerciseMethod.text }}</h4>
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
  type: string;
  tabTitles: string[];
  routes: string[];
  icon: string;
  text: string;
  requirements: Requirement[]
}

interface Requirement {
  condition: boolean
  message: string
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
      localStorage.setItem("exerciseType", props.exerciseMethod.type)
      context.root.$router.push(`exercises/${route}`);
    }

    function filterRoutes(exerciseMethod: ExerciseMethods) {
      const routes = [];
      for (let i = 0; i < exerciseMethod.routes.length; i++)
        if (exerciseMethod.requirements[i].condition) routes.push(i);
      return routes;
    }

    return {goToExercise, tabs, filterRoutes}
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
  background-color: #526c66;
  color: #000;
}

.tabs .tab a:focus.active {
  background-color: #526c66  ;
  color: #000;
}

.tabs {
  background-color: #48605a !important;
}
</style>