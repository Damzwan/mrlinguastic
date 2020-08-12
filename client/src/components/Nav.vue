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
    </nav>

    <ul class="sidenav invesible-top green darken-4">
      <li v-for="(item, index) in sidenavObjects" :key="index" v-on:click="closeSideNav">
        <div class="divider light-green darken-4" v-if="item.title == 'Install'"></div>

        <router-link to="/vocabulary">
          <span class="white-text center">{{ item.title }}</span>
          <span class="badge" v-if="item.badge">Coming soon</span>
          <i class="material-icons left">{{ item.icon }}</i>
        </router-link>
      </li>
    </ul>

    <div id="login" class="modal">
      <div class="modal-content">
        <h4>Login Page</h4>
        <p>Fill in your details</p>
        <div class="row">
          <form class="col s12">
            <div class="row">
              <div class="input-field col s12">
                <i class="material-icons prefix">account_circle</i>
                <input id="username" type="text" class="validate" onchange="allFieldsLogin()"/>
                <label for="username">Username</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <i class="material-icons prefix">lock</i>
                <input id="password" type="password" class="validate" onchange="allFieldsLogin()"/>
                <label for="password">Password</label>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <a
            href="#register"
            class="modal-close waves-effect waves-green btn-flat modal-trigger"
        >Register</a>
        <a
            href="#!"
            id="loginbutton"
            onclick="LoginCLient()"
            class="modal-close waves-effect waves-green btn-flat disabled"
        >Log in</a>
      </div>
    </div>

    <div id="register" class="modal">
      <div class="modal-content">
        <h4>Register Page</h4>
        <p>Fill in the fields to create your account</p>
        <div class="row">
          <form class="col s12">
            <div class="row">
              <div class="input-field col s12">
                <i class="material-icons prefix">account_circle</i>
                <input
                    id="create-username"
                    type="text"
                    class="validate"
                    onchange="allFieldsFilledIn();"
                />
                <label for="create-username">Username</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <i class="material-icons prefix">lock</i>
                <input
                    id="create-password"
                    type="password"
                    class="validate"
                    onchange="checkpasswords(); allFieldsFilledIn();"
                />
                <label for="create-password">Password</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <i class="material-icons prefix">lock</i>
                <input
                    id="repeat-create-password"
                    type="password"
                    class="validate"
                    onchange="checkpasswords(); allFieldsFilledIn();"
                />
                <label for="repeat-create-password">Repeat Password</label>
                <span
                    class="helper-text"
                    data-error="Seems like you made a typo"
                    data-success="Good Job"
                >Both passwords need to be the same</span>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#login" class="modal-close waves-effect waves-green btn-flat modal-trigger">Go Back</a>
        <a
            href="#!"
            id="register-button"
            onclick="Register()"
            class="modal-close waves-effect waves-green btn-flat disabled"
        >Register</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from "@vue/composition-api";
import M from "materialize-css";
import router from "@/router";

export default defineComponent({
  setup() {
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

    return {sidenav, openSideNav, closeSideNav, sidenavObjects};
  },
});
</script>