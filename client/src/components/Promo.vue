<template>
  <div>
    <!--    <img :src="require('@/assets/notduolingologo.png')" alt="Mr.Linguastic Logo" width="100px" class="centered-img" style="margin-bottom: -30px; margin-top: 20px">-->
    <h1 class="center-align">Mr.Linguastic</h1>
    <h3 class="center-align">A Community Driven Language Learning Platform</h3>

    <div class="row section container">
      <div class="col s12 m4">
        <div class="center promo">
          <div class="big-icon">👷‍♂</div>️
          <p class="promo-caption">Create!</p>
          <p class="light center promo-description">Create high quality vocabulary lists in an instant!</p>
        </div>
      </div>
      <div class="col s12 m4">
        <div class="center promo">
          <div class="big-icon">📜🖋</div>️
          <p class="promo-caption">Practice!</p>
          <p class="light center promo-description">Up to 10 ways to practice your vocabulary lists!</p>
        </div>
      </div>
      <div class="col s12 m4">
        <div class="center promo">
          <div class="big-icon">📨</div>
          <p class="promo-caption">Share!</p>
          <p class="light center promo-description">Share your creations with your students, friends and family!</p>
        </div>
      </div>
    </div>

    <div class="row section">
      <div class="col m2 s6 offset-m5 offset-s3">
        <router-link to="home" class="waves-effect waves-light btn rounded" style="width: 100%; font-size: 23px; height: 40px">Start now</router-link>
      </div>
    </div>

    <div class="row section">
      <div class="col m6 s12 center-align offset-m3">
        <h4 style="font-weight: bold">Study what you want, how you want it!</h4>
        <p class="flow-text">Mr.Linguastic gives you complete freedom to study whatever you like. No content is locked
          behind a progression system or a paywall.</p>
      </div>
    </div>

    <div class="row section hide-on-small-and-down">️
      <div class="col m6 center-align offset-m3">
        <h4 style="font-weight: bold">We do the heavy lifting for you 🏋️‍♂️🏋️‍♀</h4>
        <p class="flow-text">For every word, Mr.Linguastic automatically:</p>
        <div class="row">
          <div class="col m5 valign-wrapper offset-m1"><i class="material-icons promo-advantage-icon">translate</i> <span
              class="promo-advantage-text">Translates</span></div>
          <div class="col m5 valign-wrapper"><i class="material-icons promo-advantage-icon">image</i> <span
              class="promo-advantage-text">Finds an Image</span></div>
        </div>
        <div class="row">
          <div class="col m5 valign-wrapper offset-m1"><i class="material-icons promo-advantage-icon">format_list_numbered</i> <span
              class="promo-advantage-text">Finds examples</span></div>
          <div class="col m5 valign-wrapper"><i class="material-icons promo-advantage-icon">info_outline</i> <span
              class="promo-advantage-text">Finds information</span></div>
        </div>
        <div class="row">
          <div class="col m5 valign-wrapper offset-m1"><i class="material-icons promo-advantage-icon">volume_up</i> <span
              class="promo-advantage-text">Adds audio</span></div>
        </div>
      </div>
    </div>

    <div class="row section hide-on-med-and-up">️
      <div class="col m6 center-align offset-m3">
        <h4 style="font-weight: bold">We do the heavy lifting for you 🏋️‍♂️🏋️‍♀</h4>
        <p class="flow-text">For every word, Mr.Linguastic automatically:</p>
        <div class="row">
          <div class="col s10 valign-wrapper offset-s2">
            <i class="material-icons promo-advantage-icon">translate</i> <span class="promo-advantage-text">Translates</span>
          </div>
        </div>
        <div class="row">
          <div class="col s10 valign-wrapper offset-s2">
            <i class="material-icons promo-advantage-icon">image</i> <span class="promo-advantage-text">Finds an Image</span>
          </div>
        </div>
        <div class="row">
          <div class="col s10 valign-wrapper offset-s2">
            <i class="material-icons promo-advantage-icon">format_list_numbered</i> <span class="promo-advantage-text">Finds examples</span>
          </div>
        </div>
        <div class="row">
          <div class="col s10 valign-wrapper offset-s2">
            <i class="material-icons promo-advantage-icon">info_outline</i> <span class="promo-advantage-text">Finds information</span>
          </div>
        </div>
        <div class="row">
          <div class="col s10 valign-wrapper offset-s2">
            <i class="material-icons promo-advantage-icon">volume_up</i> <span class="promo-advantage-text">Adds audio</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row section">
      <div class="col m6 s12 center-align offset-m3">
        <h3 style="font-weight: bold">Features</h3>
      </div>
    </div>

    <div class="row section container">
      <div class="col s12 m4">
        <div class="center promo">
          <div class="big-icon">📸</div>️
          <p class="promo-caption">Import words</p>
          <p class="light center promo-description">Take a picture from your textbook to easily add the words you need to study</p>
        </div>
      </div>

      <div class="col s12 m4">
        <div class="center promo">
          <div class="big-icon">🃏</div>️
          <p class="promo-caption">Flashcards</p>
          <p class="light center promo-description">Create flashcards from your vocabulary lists to practice offline</p>
        </div>
      </div>

      <div class="col s12 m4">
        <div class="center promo">
          <div class="big-icon">👩‍🏫</div>️
          <p class="promo-caption">Perfect for teachers</p>
          <p class="light center promo-description">Share your vocabulary lists with your students</p>
        </div>
      </div>
    </div>

    <div class="row section container">
      <div class="col s12 m4">
        <div class="center promo">
          <div class="big-icon">🤸‍♂</div>️
          <p class="promo-caption">Flexible</p>
          <p class="light center promo-description">Study on any device that has a browser or download the app</p>
        </div>
      </div>

      <div class="col s12 m4">
        <div class="center promo">
          <div class="big-icon">💸</div>️
          <p class="promo-caption">Free</p>
          <p class="light center promo-description">No premium bullsh*t and no ads</p>
        </div>
      </div>

      <div class="col s12 m4">
        <div class="center promo">
          <div class="big-icon">🌍</div>️
          <p class="promo-caption">9 languages</p>
          <p class="light center promo-description">With more to come</p>
        </div>
      </div>
    </div>

    <div class="row container valign-wrapper hide-on-small-and-down section">
      <div class="col m1"><img :src="require('@/assets/country-flags/netherlands.svg')" alt="Dutch" width="50px"></div>
      <div class="col m1"><img :src="require('@/assets/country-flags/united-kingdom.svg')" alt="English" width="50px"></div>
      <div class="col m1"><img :src="require('@/assets/country-flags/france.svg')" alt="French" width="50px"></div>
      <div class="col m1"><img :src="require('@/assets/country-flags/germany.svg')" alt="German" width="50px"></div>
      <div class="col m1"><img :src="require('@/assets/country-flags/italy.svg')" alt="Italian" width="50px"></div>
      <div class="col m1"><img :src="require('@/assets/country-flags/portugal.svg')" alt="Portuguese" width="50px"></div>
      <div class="col m1"><img :src="require('@/assets/country-flags/romania.svg')" alt="Romanian" width="50px"></div>
      <div class="col m1"><img :src="require('@/assets/country-flags/russia.svg')" alt="Russian" width="50px"></div>
      <div class="col m1"><img :src="require('@/assets/country-flags/spain.svg')" alt="Spanish" width="50px"></div>
    </div>

    <div class="container hide-on-med-and-up section">
      <div class="row valign-wrapper">
        <div class="col m1"><img :src="require('@/assets/country-flags/netherlands.svg')" alt="Dutch" width="50px"></div>
        <div class="col m1"><img :src="require('@/assets/country-flags/united-kingdom.svg')" alt="English" width="50px"></div>
        <div class="col m1"><img :src="require('@/assets/country-flags/france.svg')" alt="French" width="50px"></div>
        <div class="col m1"><img :src="require('@/assets/country-flags/germany.svg')" alt="German" width="50px"></div>
        <div class="col m1"><img :src="require('@/assets/country-flags/italy.svg')" alt="Italian" width="50px"></div>
      </div>

      <div class="row valign-wrapper" style="justify-content: center !important;">
        <div class="col m1"><img :src="require('@/assets/country-flags/portugal.svg')" alt="Portuguese" width="50px"></div>
        <div class="col m1"><img :src="require('@/assets/country-flags/romania.svg')" alt="Romanian" width="50px"></div>
        <div class="col m1"><img :src="require('@/assets/country-flags/russia.svg')" alt="Russian" width="50px"></div>
        <div class="col m1"><img :src="require('@/assets/country-flags/spain.svg')" alt="Spanish" width="50px"></div>
      </div>
    </div>

    <div class="row section">
      <div class="col m2 s6 offset-m5 offset-s3">
        <router-link to="home" class="waves-effect waves-light btn rounded" style="width: 100%; font-size: 23px; height: 40px">Start now</router-link>
      </div>
    </div>

  </div>
</template>

<style scoped>
.promo {
  width: 100%;
}

.promo-caption {
  font-size: 1.7rem;
  font-weight: 500;
  margin-top: 5px;
  margin-bottom: 0;
}

.promo-advantage-text {
  font-size: 1.5rem;
  font-weight: 500;
  margin-left: 20px;
}

.promo-advantage-icon {
  font-size: 3rem;
  font-weight: 500;
}

.promo-description {
  font-size: 20px;
}

.promo i {
  font-size: 7rem;
}

.big-icon{
  font-size: 7rem;
}

.rounded {
  padding: 3px;
  border-radius: 10px;
}

.material-icons {
  display: inline-flex;
  vertical-align: top;
}

.valign-wrapper{
  justify-content: left !important;
}
</style>