<template>
  <div ref="monster" class="monster">
    <p style="font-size: 30px; text-align: center">{{ word }}</p>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, ref} from "@vue/composition-api";

export default defineComponent({
  props: {
    word: String,
    speed: Number
  },
  setup(props, ctx) {
    const monster = ref<HTMLDivElement>(null);
    let yPos = -20;
    let myInterval;

    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

    onMounted(() => {
      monster.value.style.left = `${getRandomArbitrary(10, 90)}%`
      startMoving();
    })

    function startMoving() {
      myInterval = setInterval(function () {
        yPos += props.speed;
        monster.value.style.top = `${yPos}%`
        if (yPos >= 90) ctx.emit("damage", props.word)
      }, 30);
    }

    onUnmounted(() => {
      clearInterval(myInterval);
    })


    return {monster}
  },
});
</script>

<style scoped>

.monster {
  /*outline-style: solid;*/
  /*outline-color: red;*/
  background-color: #ead9a1;
  top: -20%;
  position: fixed;
  z-index: -1;
}

</style>