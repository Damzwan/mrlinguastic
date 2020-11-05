<template>
  <div>
    <h2 class="center-align">Donate</h2>

    <div class="row section">
      <div class="col s6 m4">
        <div class="center promo promo-example">
          <i class="material-icons" style="font-size: 100px;">money_off</i>
          <p style="font-size: 25px">Free To All!</p>
          <p class="light center" style="font-size: 20px;">Our goal is to deliver an ad-free website without any
            premium features.</p>
        </div>
      </div>
      <div class="col s6 m4">
        <div class="center promo promo-example">
          <i class="material-icons" style="font-size: 100px;">group</i>
          <p style="font-size: 25px">Two students!</p>
          <p class="light center" style="font-size: 20px">Mr Linguastic was fully created by 2 students during their free
            time.</p>
        </div>
      </div>
      <div class="col s6 m4">
        <div class="center promo promo-example">
          <i class="material-icons" style="font-size: 100px;">euro_symbol</i>
          <p style="font-size: 25px">Nothing is free!</p>
          <p class="light center" style="font-size: 20px;">Several costs such as website hosting, database
            management and translation services are not free and are currently being paid by us.</p>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col offset-s1 s10 offset-m2 m8 center">
        <p class="flow-text">Due tot the reasons specified above, we humbly ask you for your support! Financial
          support, feedback, wanted features, sharing or leaving a positive comment will all help :)</p>

        <p class="flow-text">Would you like to play an active role during development? Support us on patreon!</p>
      </div>
    </div>

    <div class="row">
      <div class="col offset-s2 offset-m3 s3 m2">
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_s-xclick"/>
          <input type="hidden" name="hosted_button_id" value="TAG9KYWG9N262"/>
          <input type="image" src="https://www.paypalobjects.com/en_US/BE/i/btn/btn_donateCC_LG.gif" border="0"
                 name="submit" title="PayPal - The safer, easier way to pay online!"
                 alt="Donate with PayPal button"/>
          <img alt="" border="0" src="https://www.paypal.com/en_BE/i/scr/pixel.gif" width="1" height="1"/>
        </form>
      </div>
      <div class="col offset-s1 offset-m2 s4 m2">
        <a href="https://www.patreon.com/LearnLanguageNow"><img src="../assets/patreon.png" alt="patreon" width="100%"></a>
      </div>
    </div>
  </div>
</template>