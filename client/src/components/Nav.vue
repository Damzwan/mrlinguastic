<template>
  <div style="z-index: 1005">
    <nav>
      <div class="nav-wrapper green darken-4">
        <a href="/" class="brand-logo center hide-on-med-and-down">Learn Language Now</a>
        <a href="/" class="brand-logo center hide-on-large-only">LLN</a>
        <ul class="left">
          <li>
            <a href="#" v-on:click="openSideNav">
              <i class="material-icons" style="font-size: 30px;">menu</i>
            </a>
          </li>
        </ul>

        <div v-if="!isVocCreatePage">
          <ul class="right">
            <li>
              <a href="#login" class="modal-trigger">
                <i class="material-icons" style="font-size: 30px;">account_circle</i>
              </a>
            </li>
          </ul>
          <ul class="right hide-on-med-and-down">
            <li>
              <a href="donate" style="font-size: 1.6rem;">Donate</a>
            </li>
            <li>
              <a href="about" style="font-size: 1.6rem;">About</a>
            </li>
          </ul>
        </div>

        <div v-else>
          <ul class="right">
            <li>
              <a href="#ocr" class="modal-trigger">
                <i class="material-icons" style="font-size: 30px;">attach_file</i>
              </a>
            </li>
            <li>
              <a href="#configuration" class="modal-trigger">
                <i class="material-icons" style="font-size: 30px;">settings</i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <ul class="sidenav invesible-top green darken-4">
      <li v-for="(item, index) in sidenavObjects" :key="index" v-on:click="closeSideNav">
        <div class="divider light-green darken-4" v-if="item.title === 'Install'"></div>

        <router-link to="/vocabulary">
          <span class="white-text center">{{ item.title }}</span>
          <span class="badge" v-if="item.badge">Coming soon</span>
          <i class="material-icons left">{{ item.icon }}</i>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "@vue/composition-api";
import M from "materialize-css";
import router from "@/router";

export default defineComponent({
  setup(props, context) {
    const sidenav = ref<M.Sidenav>(null);

    onMounted(() => {
      //M.AutoInit();
      sidenav.value = M.Sidenav.init(document.querySelectorAll(".sidenav")[0]);
    });

    function openSideNav() {
      sidenav.value.open();
    }

    function closeSideNav() {
      sidenav.value.close();
    }

    const sidenavObjects = [
      {title: "Vocabulary", icon: "translate", badge: false},
      {title: "Grammer", icon: "border_color", badge: true},
      {title: "Install", icon: "file_download", badge: false},
      {title: "Donate", icon: "attach_money", badge: false},
      {title: "About", icon: "info", badge: false},
    ];

    const isVocCreatePage = ref(context.root.$route.name == "Create Voc");

    return {sidenav, openSideNav, closeSideNav, sidenavObjects, isVocCreatePage};
  },
  watch: {
    $route(to) {
      this.isVocCreatePage = to.name == "Create Voc";
    }
  }
});
</script>