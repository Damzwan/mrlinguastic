<template>
  <div style="z-index: 1005">
    <nav>
      <div class="nav-wrapper green darken-4">
        <a class="brand-logo center hide-on-med-and-down">Learn Language Now</a>
        <a class="brand-logo center hide-on-large-only">LLN</a>
        <ul class="left">
          <li>
            <a v-on:click="openSideNav">
              <i class="material-icons" style="font-size: 30px;">menu</i>
            </a>
          </li>
        </ul>

        <!--        if we are on the Voc Create Page we should display other content-->
        <div v-if="!isVocCreatePage">
          <ul class="right">
            <li>
              <a @click="logIn">
                <img :src="require(`@/assets/country-flags/china.svg`)" width="30px" height="30px" v-if="loggedIn" style="top: 10px; position: relative;">
                <i class="material-icons" style="font-size: 30px;" v-else>account_circle</i>
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
            <li class="hide-on-small-and-down">
              <a @click="saveList" class="tooltipped" data-tooltip="Save">
                <i class="material-icons" style="font-size: 30px;">save</i>
              </a>
            </li>
            <li>
              <a href="#ocr" class="modal-trigger tooltipped" data-tooltip="Import words">
                <i class="material-icons" style="font-size: 30px;">attach_file</i>
              </a>
            </li>
            <li>
              <a href="#configuration" class="modal-trigger tooltipped" data-tooltip="Settings">
                <i class="material-icons" style="font-size: 30px;">settings</i>
              </a>
            </li>
          </ul>
          <ul class="left hide-on-med-and-up">
            <li>
              <a @click="saveList" class="tooltipped" data-tooltip="Save">
                <i class="material-icons" style="font-size: 30px;">save</i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <ul class="sidenav green darken-4">
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
import {defineComponent, inject, onMounted, ref} from "vue";
import M from "materialize-css";
import {correctMessage, normalMessage} from "@/use/messages";
import {AuthModule} from "@/use/authModule";

export default defineComponent({
  setup(props, context) {
    const auth = inject<AuthModule>("auth");
    const sidenav = ref<M.Sidenav>(null);

    onMounted(() => {
      sidenav.value = M.Sidenav.init(document.querySelectorAll(".sidenav")[0]);
    });

    function openSideNav() {
      sidenav.value.open();
    }

    function closeSideNav() {
      sidenav.value.close();
    }

    function saveList() {
      correctMessage("Saved!");
    }

    function logIn() {
      if (!auth.getOid()) auth.login();
      else normalMessage("Already logged in!")
    }

    const sidenavObjects = [
      {title: "Vocabulary", icon: "translate", badge: false},
      {title: "Grammer", icon: "border_color", badge: true},
      {title: "Install", icon: "file_download", badge: false},
      {title: "Donate", icon: "attach_money", badge: false},
      {title: "About", icon: "info", badge: false},
    ];

    const isVocCreatePage = ref(context.root.$route.name == "Create Voc"); //flip boolean if we are on the voc create page

    return {
      sidenav,
      openSideNav,
      closeSideNav,
      sidenavObjects,
      isVocCreatePage,
      saveList,
      logIn,
      loggedIn: auth.getOid()
    };
  },
  watch: {
    $route(to) {
      this.isVocCreatePage = to.name == "Create Voc"; //flip boolean if we route to the voc create page
    }
  }
});
</script>