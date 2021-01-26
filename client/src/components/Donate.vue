<template>
  <div>
    <h2 class="center-align">Donate</h2>

    <div class="row section">
      <div class="col s10 m4 offset-s1">
        <div class="center promo promo-example">
          <i class="material-icons" style="font-size: 100px;">money_off</i>
          <p style="font-size: 25px">Free To All!</p>
          <p class="light center" style="font-size: 20px;">My goal is to deliver an ad-free website without any
            premium features.</p>
        </div>
      </div>
      <div class="col s10 m4 offset-s1">
        <div class="center promo promo-example">
          <i class="material-icons" style="font-size: 100px;">group</i>
          <p style="font-size: 25px">One student!</p>
          <p class="light center" style="font-size: 20px">Mr Linguastic was fully created by 1 student during his free
            time.</p>
        </div>
      </div>
      <div class="col s10 m4 offset-s1">
        <div class="center promo promo-example">
          <i class="material-icons" style="font-size: 100px;">euro_symbol</i>
          <p style="font-size: 25px">Nothing is free!</p>
          <p class="light center" style="font-size: 20px;">Several costs such as website hosting, database
            management and translation services are not free and are currently being paid by me.</p>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col offset-s1 s10 offset-m2 m8 center">
        <p class="flow-text">Due tot the reasons specified above, I humbly ask you for your support! <br> <br>  Financial
          support, feedback, wanted features, sharing or leaving a positive comment will all help :)</p>
      </div>
    </div>

    <div class="row">
      <div class="col s4 offset-s4 center">
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_s-xclick"/>
          <input type="hidden" name="hosted_button_id" value="TAG9KYWG9N262"/>
          <input type="image" src="https://www.paypalobjects.com/en_US/BE/i/btn/btn_donateCC_LG.gif" border="0"
                 name="submit" title="PayPal - The safer, easier way to pay online!"
                 alt="Donate with PayPal button"/>
          <img alt="" border="0" src="https://www.paypal.com/en_BE/i/scr/pixel.gif" width="1" height="1"/>
        </form>
      </div>
    </div>
  </div>
</template>