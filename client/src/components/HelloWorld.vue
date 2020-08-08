<template>
  <div>
    <div v-if="user && user.voclists">{{user.voclists[0].title}}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { useGetUserQuery } from "@/gen-types";
import { useResult } from "@vue/apollo-composable";

export default defineComponent({
  setup() {
    const { result, loading } = useGetUserQuery({ username: "Damian" });
    const user = useResult(result, null, (data) => data.user);
    return { user };
  },
});
</script>