<template>
  <div>
    <div style="margin-bottom: 20px">
      <h4 class="center-align">🏆 Stats 🏆</h4>
      <div class="divider"></div>
    </div>

    <div class="row flex hide-on-med-and-down" style="margin-left: 30px; margin-right: 30px">
      <div class="col l4">
        <div class="row" v-for="(stat, index) in stats" :key="index">
          <div class="z-depth-1 rounded stat">
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

    <div class="row hide-on-large-only" style="margin-left: 20px; margin-right: 20px">
      <div class="col s12 m5 fade-enter-active" v-for="(stat, index) in stats" :key="index" v-bind:class="{'offset-m2': index % 2 !== 0}">
        <div class="row">
          <div class="z-depth-1 rounded stat">
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

    <div class="row hide-on-large-only">
      <div class="col s12">
        <canvas style="width: 100%" id="cnvs-mobile"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from "@vue/composition-api";
import Chart from 'chart.js';

export interface Stat {
  boldText: string;
  normalText: string;
  icon: string;
  iconColor: string;
}


export default defineComponent({
  setup() {
    const fadeInCounter = ref(0);
    const stats = reactive<Stat[]>([
      {boldText: "100%", normalText: "correct from the first time", icon: "done", iconColor: "green"},
      {boldText: "0", normalText: "mistakes", icon: "close", iconColor: "red"},
      {boldText: "10", normalText: "word translated", icon: "g_translate", iconColor: "black"},
      {boldText: "5", normalText: "minute(s)", icon: "access_time", iconColor: "black"}]);


    onMounted(() => {
      const cnvs = document.getElementById('cnvs') as HTMLCanvasElement;
      const ctx = cnvs.getContext("2d");

      const cnvsMobile = document.getElementById('cnvs-mobile') as HTMLCanvasElement;
      const ctxMobile = cnvsMobile.getContext("2d");

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: '# of Mistakes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });

      new Chart(ctxMobile, {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: '# of Mistakes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    })
    return {stats}
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

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>