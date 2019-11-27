<template>
  <div class="container">
    <b-alert :show="dismissCountDown" dismissible fade variant="warning" @dismissed="onAlertDismissed" @dismiss-count-down="countDownChanged">
      <p>Du hast deine Meinung zu schnell geändert, bitte warte {{ dismissCountDown }} Sekunden...</p>
      <b-progress variant="warning" :max="dismissSecs" :value="dismissCountDown" height="4px" ></b-progress>
    </b-alert>
    <div class="jumbotron ">
      <h1 v-if="user !== null" class="display-4">Hallo {{user.firstName}}</h1>
      <h1 v-if="user == null" class="display-4">Hoppla!</h1>
      <p v-if="!participating" class="lead">Du nimmst beim Wichteln nicht teil</p>
      <p v-if="participating" class="lead">Du nimmst beim Wichteln nicht teil. Die Auslosung wir Anfang Dezember durchgeführt und du wirst per E-Mail erfahren, wen du beschenken darfst.</p>
      <p v-if="user == null" class="lead">Da lief was schief. Deine ID ist uns unbekannt</p>
      <hr class="my-4">
      <b-button v-on:click="toggleParticipation" v-bind:disabled="dismissCountDown > 0"  v-bind:class="{ 'btn-success': !participating, 'btn-danger': participating }">
        {{participating ? 'Nicht mehr teilnehmen' : 'Jetzt teilnehmen '}}
      </b-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import User from '../model/user'

axios.defaults.headers.put['Content-Type'] = 'application/json'

export default {
  name: 'Register',
  data () {
    return {
      user: null,
      userId: null,
      participating: false,
      dismissSecs: 5,
      dismissCountDown: 0,
      showDismissibleAlert: false
    }
  },
  watch: {
    $route (to, from) {
      this.setUserId(to.params.userId)
    }
  },
  mounted () {
    this.setUserId(this.$route.params.userId)
  },
  methods: {
    setUserId (userId) {
      this.userId = userId
      this.fetchUserDetails()
      this.fetchParticipation()
    },
    fetchUserDetails () {
      axios.get(`http://localhost:8080/api/v1/users/${this.userId}`)
        .then(response => {
          this.user = response.data
        })
        .catch(e => {
          this.user = null
        })
    },
    fetchParticipation () {
      axios.get(`http://localhost:8080/api/v1/participations/${this.userId}`)
        .then(response => {
          this.participating = response.data.participating
        })
        .catch(e => {
          this.user = null
        })
    },
    toggleParticipation (event) {
      let body = { participating: !this.participating }
      axios.put(`http://localhost:8080/api/v1/participations/${this.userId}`, JSON.stringify(body))
        .then(response => {
          if (response.status === 204) {
            this.fetchParticipation()
          }
        })
        .catch(e => {
          if (e.response && e.response.status === 429) {
            this.showAlert()
          } else {
            this.user = null
            console.log(e)
          }
        })
    },
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert () {
      this.dismissCountDown = this.dismissSecs
    },
    onAlertDismissed () {
      this.dismissCountDown = 0
    }
  }
}

</script>
