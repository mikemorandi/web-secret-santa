<template>
  <div class="jumbotron col-lg-6 col-md-6 col-sm-6 col-xs-6 offset-3 float-md-center" style="width: 700px">
    <h1 class="display-4">Wichteln</h1>
    <p class="lead">Hallo! Gib bitte deine Wichtel-ID ein, die du per E-Mail erhalten hast.</p>
    <hr class="my-4">
    <div class="d-flex">
      <b-form-input v-model="id" placeholder="deine Wichtel-ID" class="me-3"></b-form-input>
      <b-button variant="primary" @click="showDetails">Weiter</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'HomePage',
  setup () {
    const id = ref('')
    const router = useRouter()

    const showDetails = () => {
      router.push({ name: 'register', params: { userId: id.value } })
    }

    return {
      id,
      showDetails
    }
  }
})
</script>
