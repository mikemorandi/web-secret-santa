<template>
  <div class="jumbotron col-lg-6 col-md-6 col-sm-6 col-xs-6 offset-3 float-md-center" style="width: 700px">
    <h1 class="display-4">Wichteln</h1>
    <p class="lead">Hallo! Gib bitte deine Wichtel-ID ein, die du per E-Mail erhalten hast.</p>
    <hr class="my-4">
    <div class="d-flex">
      <BFormInput v-model="id" placeholder="deine Wichtel-ID" class="me-3"></BFormInput>
      <BButton variant="primary" @click="showDetails">Weiter</BButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BFormInput, BButton } from 'bootstrap-vue-next'

export default defineComponent({
  name: 'HomePage',
  components: {
    BFormInput,
    BButton
  },
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
