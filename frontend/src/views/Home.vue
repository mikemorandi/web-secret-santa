<template>
  <div class="jumbotron col-lg-6 col-md-6 col-sm-6 col-xs-6 offset-3 float-md-center" style="width: 700px">
    <h1 class="display-4">Wichteln</h1>
    <p class="lead">Gib die ID ein, die du per E-Mail erhalten hast.</p>
    <hr class="my-4">
    <b-form-input v-model="id" placeholder="deine ID ein"></b-form-input>
    <b-button v-on:click="showDetails">Weiter</b-button>
  </div>
</template>

<script>

export default {
  name: 'home',
  data () {
    return {
      id: ''
    }
  },
  methods: {
    showDetails: function (event) {
      this.$router.push({ name: 'register', params: { userId: this.id } })
    }
  }
}
</script>
