<template>
  <div>
    <h1>Hello {{user ? user : "stranger"}}</h1>
  </div>
</template>

<script lang="ts">
import {defineComponent, inject} from "@vue/composition-api";
import {AuthModule} from "@/use/authModule";

export default defineComponent({
  setup() {
    const auth = inject<AuthModule>("auth");
    return {user: auth.getUser()}
  },
});
</script>