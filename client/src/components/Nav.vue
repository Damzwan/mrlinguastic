<template>
  <div>
    <nav>
      <div class="nav-wrapper green darken-4">
        <a href="/" class="brand-logo center hide-on-med-and-down">Learn Language Now</a>
        <a href="/" class="brand-logo center hide-on-large-only">LLN</a>
        <ul class="left">
          <li>
            <a href="#" v-on:click="opensidenav">
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
      <li>
        <router-link to="/vocabulary" v-on:click="closesidenav">
          <span class="white-text center">Vocabulary</span>
          <i class="material-icons left">translate</i>
        </router-link>
      </li>
      <li>
        <a href="/vocabulary">
          <span class="white-text">Grammar</span>
          <span class="badge">Coming soon</span>
          <i class="material-icons left">border_color</i>
        </a>
      </li>
      <li>
        <a href="#!">
          <span class="white-text">Reading</span>
          <span class="badge">Coming soon</span>
          <i class="material-icons left">library_books</i>
        </a>
      </li>
      <li>
        <a href="#!">
          <span class="white-text">Listening</span>
          <span class="badge">Coming soon</span>
          <i class="material-icons left">hearing</i>
        </a>
      </li>
      <li>
        <a href="#!">
          <span class="white-text">Videos</span>
          <span class="badge">Coming soon</span>
          <i class="material-icons left">ondemand_video</i>
        </a>
      </li>
      <li>
        <a href="#!">
          <span class="white-text">Stats</span>
          <span class="badge">Coming soon</span>
          <i class="material-icons left">assessment</i>
        </a>
      </li>
      <li>
        <div class="divider light-green darken-4"></div>
      </li>

      <li>
        <a href="/install">
          <span class="white-text center">Install</span>
          <i class="material-icons left">file_download</i>
        </a>
      </li>
      <li>
        <a href="/donate">
          <span class="white-text center">Donate</span>
          <i class="material-icons left">attach_money</i>
        </a>
      </li>
      <li>
        <a href="/about">
          <span class="white-text center">About</span>
          <i class="material-icons left">info</i>
        </a>
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
                <input id="username" type="text" class="validate" onchange="allFieldsLogin()" />
                <label for="username">Username</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <i class="material-icons prefix">lock</i>
                <input id="password" type="password" class="validate" onchange="allFieldsLogin()" />
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

<script>
import M from "materialize-css";
var sidenav = null;

export default {
  name: "Nav",
  components: {},
  props: {},
  mounted() {
    M.AutoInit();
    var elems = document.querySelectorAll(".sidenav")[0];
    sidenav = M.Sidenav.init(elems, { closeOnClick: true });
  },
  methods: {
    opensidenav: function() {
      sidenav.open();
    },
    closesidenav: function() {
      console.log("fuck");
      sidenav.close();
    }
  },
  watch: {
    $route() {
      console.log("fuck");
      sidenav.close();
    }
  }
};
</script>

<style>
</style>
