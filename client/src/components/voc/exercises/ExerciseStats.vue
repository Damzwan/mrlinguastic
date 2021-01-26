<template>
  <div>
    <i class="material-icons unselectable" style="position: absolute; font-size: 45px; color: black"
       @click="$router.push('/')">home</i>
    <i class="material-icons unselectable" style="position: absolute; font-size: 45px; color: black; right: 0"
       @click="$router.back()">replay</i>
    <div style="margin-bottom: 20px">
      <h4 class="center-align">🏆 Stats 🏆</h4>
      <div class="divider"></div>
    </div>

    <div class="row flex" v-if="!isMobile()" style="margin-left: 30px; margin-right: 30px">
      <div class="col l4">
        <div class="row" v-for="(stat, index) in stats" :key="index">
          <div class="z-depth-1 rounded stat" style="background-color: #ead9a1">
            <div class="rounded-icon" style="position: absolute;">
              <i class="material-icons" style="font-size: 70px; margin-top: 5px" v-bind:style="{color: stat.iconColor}">{{
                  stat.icon
                }}</i>
            </div>
            <div class="row stat">
              <div class="col s9 offset-l3 valign-wrapper" style="height: 80px; width: 70%">
                <p class="flow-text stat-text"><b>{{ stat.boldText }}</b> {{ stat.normalText }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col l7 offset-l1">
        <canvas style="width: 100%" id="cnvs"></canvas>
      </div>
    </div>

    <div v-else style="margin-left: 20px; margin-right: 20px">
      <div class="col s12 m5 fade-enter-active" v-for="(stat, index) in stats" :key="index"
           v-bind:class="{'offset-m2': index % 2 !== 0}">
        <div class="row">
          <div class="z-depth-1 rounded stat" style="background-color: #ead9a1">
            <div class="rounded-icon" style="position: absolute;">
              <i class="material-icons" style="font-size: 70px; margin-top: 5px" v-bind:style="{color: stat.iconColor}">{{
                  stat.icon
                }}</i>
            </div>
            <div class="row stat">
              <div class="col s8 offset-s4 valign-wrapper" style="height: 80px; width: 70%">
                <p class="flow-text stat-text"><b>{{ stat.boldText }}</b> {{ stat.normalText }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="row" v-if="isMobile()">
      <div class="col s12">
        <canvas style="width: 100%" id="cnvs-mobile"></canvas>
        <div class="divider"></div>
      </div>
    </div>

    <div v-if="ordered.length > 0">
      <h4 class="center">👹 Failed attempts 👹</h4>
      <div style="margin-left: 10px; margin-right: 10px; margin-top: 20px">
        <ul class="collapsible" ref="failureCollapsible">
          <li v-for="(word, index) in ordered" :key="index">
            <div class="collapsible-header" style="background-color: #ead9a1">
              {{ word }}
              <div style="right: 50px; font-weight: bold; position: absolute;">{{ failedAttempts[word].length }}</div>
            </div>
            <div class="collapsible-body" style="background-color: #ead9a1">
              <ul class="collection">
                <li class="collection-item center" v-for="(failure, j) in failedAttempts[word]" :key="j"
                    style="background-color: #ead9a1">
                  {{ failure }}
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <h4 class="center">You made no mistakes!</h4>
      <h4 class="center">🤓🤓🤓</h4>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, reactive, ref} from "@vue/composition-api";
import Chart, {LinearScale} from 'chart.js';
import M from "materialize-css";
import Collapsible = M.Collapsible;

export interface Stat {
  boldText: string;
  normalText: string;
  icon: string;
  iconColor: string;
}


export default defineComponent({
  setup() {
    const failedAttempts: { [word: string]: string[] } = JSON.parse(localStorage.getItem("failedAttempts"));
    const wordAmount = parseInt(localStorage.getItem("wordAmount"));

    const stats = reactive<Stat[]>([
      {
        boldText: (Math.round((1 - Object.keys(failedAttempts).length / wordAmount) * 100)).toString() + "%",
        normalText: "correct from the first time",
        icon: "done",
        iconColor: "green"
      },
      {boldText: localStorage.getItem("mistakes"), normalText: "mistakes", icon: "close", iconColor: "red"},
      {
        boldText: localStorage.getItem("wordAmount"),
        normalText: "words translated",
        icon: "g_translate",
        iconColor: "black"
      },
      {boldText: localStorage.getItem("duration"), normalText: "minute(s)", icon: "access_time", iconColor: "black"}]);

    const failureCollapsible = ref(null);
    const collapsibleInstance = ref<Collapsible>(null);
    const ordered = Object.keys(failedAttempts).sort((a, b) => failedAttempts[a].length > failedAttempts[b].length ? 1 : -1).reverse();

    function createChart(ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ordered.slice(0, ordered.length > 20 ? 20 : ordered.length),
          datasets: [{
            label: '# of Mistakes',
            data: ordered.map(word => failedAttempts[word].length).slice(0, ordered.length > 20 ? 20 : ordered.length),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              type: "linear",
              ticks: {
                beginAtZero: true,
                precision: 0
              } as LinearScale
            }]
          }
        }
      });
    }

    onMounted(() => {

      collapsibleInstance.value = M.Collapsible.init(failureCollapsible.value);

      let cnvs: HTMLCanvasElement = null;
      if (!isMobile()) cnvs = document.getElementById('cnvs') as HTMLCanvasElement;
      else cnvs = document.getElementById('cnvs-mobile') as HTMLCanvasElement;

      createChart(cnvs.getContext("2d"))
    })

    onUnmounted(() => {
      collapsibleInstance.value.destroy();
    })

    function isMobile() {
      return window.screen.width < 1000;
    }


    return {stats, failureCollapsible, ordered, failedAttempts, isMobile}
  },
});
</script>

<style scoped>
.rounded {
  border-radius: 40px;
}

.rounded-icon {
  border-radius: 100px;
  box-shadow: 0 0 2px #888;
  width: 80px;
  height: 80px;
  text-align: center;
}

.stat {
  width: 100%;
  height: 80px;
}

.stat-text {
  line-height: 1;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease-out;
}

.collapsible-body {
  padding: 0.5rem;
}

.collapsible .collection {
  margin: 0;
  border: 1px solid #e0e0e0 !important;
}

.divider {
  background-color: black;
}

.collapsible .collection {
  margin: 0;
  border: 1px solid #000000 !important;
}

.collection .collection-item {
  border-bottom: 1px solid #000000;
}

.collapsible-header {
  border-bottom: 0;
}

</style>