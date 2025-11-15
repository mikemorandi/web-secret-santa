<template>
  <BApp>
    <router-view />
  </BApp>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BApp } from 'bootstrap-vue-next'

export default defineComponent({
  name: 'App',
  components: {
    BApp
  }
})
</script>
