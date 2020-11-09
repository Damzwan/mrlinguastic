<template>
  <div style="z-index: 1005">
    <nav>
      <div class="nav-wrapper green darken-4">
        <router-link to="/" class="brand-logo center hide-on-med-and-down">Mr Linguastic</router-link>
        <router-link to="/" class="brand-logo center hide-on-large-only">ML</router-link>

        <ul class="left">
          <li>
            <a v-on:click="openSideNav(true)">
              <i class="material-icons" style="font-size: 30px;">menu</i>
            </a>
          </li>
        </ul>

        <!--        if we are on the Voc create Page we should display other content-->
        <div v-if="!isVocCreatePage">
          <ul class="right">
            <li>
              <a @click="openSideNav(false)">
                <img :src="require(`@/assets/country-flags/china.svg`)" width="30px" height="30px" v-if="loggedIn"
                     style="top: 10px; position: relative;">
                <i class="material-icons" style="font-size: 30px;" v-else>account_circle</i>
              </a>
            </li>
          </ul>
          <ul class="right hide-on-med-and-down">
            <li>
              <router-link to="donate" style="font-size: 1.6rem">Donate</router-link>
            </li>
            <li>
              <router-link to="about" style="font-size: 1.6rem">About</router-link>
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
              <a href="#configModal" class="modal-trigger tooltipped" data-tooltip="Settings">
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

    <ul class="sidenav green darken-4" ref="nav1">
      <li v-for="(item, index) in sidenavObjects" :key="index" v-on:click="closeSideNav(true)">
        <div class="divider light-green darken-4" v-if="item.title === 'Donate'"></div>

        <router-link v-bind:to="item.path">
          <span class="white-text center">{{ item.title }}</span>
          <span class="badge" v-if="item.badge">Coming soon</span>
          <i class="material-icons left">{{ item.icon }}</i>
        </router-link>
      </li>
    </ul>

    <ul class="sidenav green darken-4" ref="nav2">
      <li>
        <div class="user-view">
          <a><img class="circle" src="../assets/country-flags/china.svg"></a>
          <a v-if="user"><span class="white-text name">{{ user }}</span></a>
          <a v-else @click="logIn" class="btn green" style="width: 60px; height: 35px;">log in!</a>
        </div>
      </li>
      <div class="divider" style="background-color: #33691e !important"></div>
      <li>
        <a @click="openGroupModal" class="unselectable">
          <span class="white-text center unselectable">Create Group</span>
          <i class="material-icons unselectable">group_add</i>
        </a>
      </li>
      <li>
        <a v-for="(group, i) in groups" :key="i" @click="goToGroup(group._id)" class="unselectable">
          <span class="white-text center unselectable">{{ group.name }}</span>
          <i class="material-icons unselectable">group</i></a>
      </li>
    </ul>

    <div class="modal" ref="modalElement">
      <div class="modal-content">
        <h4 class="center">Create Group</h4>
        <div class="divider"></div>
        <div class="row">
          <div class="input-field col s12">
            <input placeholder="Placeholder" id="groupName" type="text">
            <label for="groupName">Name</label>
          </div>
          <div class="input-field col s12">
            <input id="description" type="text">
            <label for="description">Description</label>
          </div>
        </div>
        <div class="modal-footer">
          <div class="modal-close waves-effect waves-green btn" @click="createGroup">Create group</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject, onMounted, ref} from "@vue/composition-api";
import M from "materialize-css";
import {correctMessage, wrongMessage} from "@/use/general";
import {AuthModule} from "@/use/authModule";
import {Route} from "vue-router";
import {useCreateGroupMutation} from "@/gen-types";
import {addGroup, groups} from "@/use/state";

export default defineComponent({
  setup(props, context) {
    const auth = inject<AuthModule>("auth");
    const sidenav1 = ref<M.Sidenav>(null);
    const sidenav2 = ref<M.Sidenav>(null);

    const nav1 = ref<HTMLElement>(null)
    const nav2 = ref<HTMLElement>(null)

    const groupModal = ref<M.Modal>(null);
    const modalElement = ref<HTMLElement>(null);

    const {mutate: createGroupMutation} = useCreateGroupMutation(null);

    onMounted(() => {
      sidenav1.value = M.Sidenav.init(nav1.value);
      sidenav2.value = M.Sidenav.init(nav2.value, {edge: "right"});
      groupModal.value = M.Modal.init(modalElement.value)
    });

    function openSideNav(left: boolean) {
      if (left) sidenav1.value.open();
      else sidenav2.value.open();
    }

    function closeSideNav(left: boolean) {
      if (left) sidenav1.value.close();
      else sidenav2.value.close();
    }

    function saveList() {
      correctMessage("Saved!");
    }

    function logIn() {
      if (!auth.getOid().value) auth.login();
    }

    async function createGroup() {
      const name = document.getElementById("groupName") as HTMLInputElement;
      const description = document.getElementById("description") as HTMLInputElement;
      if (name.value != "") {
        const id = await createGroupMutation({
          groupInfo: {name: name.value, description: description.value},
          userId: auth.getOid().value
        })
        correctMessage("created group!")
        if (id.data.createGroup) addGroup({name: name.value, _id: id.data.createGroup});
      }
    }

    function openGroupModal() {
      if (!navigator.onLine) wrongMessage("must be online to create a list");
      else if (!auth.getOid().value) wrongMessage("can't make groups when not logged in!");
      else groupModal.value.open();
    }

    function goToGroup(id: string) {
      closeSideNav(false);
      if (!navigator.onLine) wrongMessage("must be online")
      if (context.root.$route.path == "/group" || !navigator.onLine) return;
      localStorage.setItem("group", id);
      context.root.$router.push("group")
    }

    const sidenavObjects = [
      {title: "Vocabulary", icon: "translate", badge: false, path: "/"},
      {title: "Grammer", icon: "border_color", badge: true, path: "/"},
      {title: "Donate", icon: "attach_money", badge: false, path: "/donate"},
      {title: "About", icon: "info", badge: false, path: "/about"},
    ];

    const isVocCreatePage = ref(context.root.$route.path.includes("create")); //flip boolean if we are on the voc create page

    return {
      openSideNav,
      closeSideNav,
      sidenavObjects,
      isVocCreatePage,
      saveList,
      logIn,
      loggedIn: auth.getOid(),
      user: auth.getUser(),
      nav1,
      nav2,
      createGroup,
      openGroupModal,
      modalElement,
      goToGroup,
      groups
    };
  },
  watch: {
    $route(to: Route) {
      this.isVocCreatePage = to.path.includes("create"); //flip boolean if we route to the voc create page
    }
  }
});
</script>