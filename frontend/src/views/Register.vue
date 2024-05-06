<template>
  <div class="container">
    <b-alert dismissible fade :show="errorMessage" @dismissed="errorMessage=null" variant="danger">{{errorMessage}}</b-alert>
    <b-alert :show="throttlingAlert.dismissCountDown" dismissible fade variant="warning" @dismissed="onAlertDismissed" @dismiss-count-down="countDownChanged">
      <p>Du hast deine Meinung zu schnell geändert, bitte warte {{ throttlingAlert.dismissCountDown }} Sekunden...</p>
      <b-progress variant="warning" :max="throttlingAlert.dismissSecs" :value="throttlingAlert.dismissCountDown" height="4px" ></b-progress>
    </b-alert>
    <div class="jumbotron">
      <h1 v-if="user !== null" class="display-4">Hallo {{user.firstName}}</h1>
      <h1 v-if="user == null" class="display-4">Hoppla!</h1>
      <p v-if="user && !participating && modified" class="lead">Schade, du nimmst beim Wichteln nicht teil. Bis am {{ drawingTime | moment("DD.MM.YYYY")}} kannst du dich hier wieder anmelden</p>
      <p v-if="user && !participating && !modified" class="lead">Nimmst du beim Wichteln teil? Die Ziehung findet am {{ drawingTime | moment("DD.MM.YYYY")}} statt</p>
      <p v-if="user && participating" class="lead">Super, du nimmst beim Wichteln teil. Die Auslosung wird am {{ drawingTime | moment("DD.MM.YYYY")}} durchgeführt und du wirst per E-Mail erfahren, wen du beschenken darfst. Bis dahin kannst du dich hier wieder abmelden.</p>
      <p v-if="user == null" class="lead">Da lief was schief. Deine ID ist uns unbekannt</p>
      <hr class="my-4">
      <b-button v-on:click="toggleParticipation" v-if="user !== null"
        v-bind:disabled="throttlingAlert.dismissCountDown > 0"
        v-bind:class="{ 'btn-success': !participating, 'btn-secondary': participating }">
        {{participating ? 'Nein, ich mache nicht mehr mit' : 'Ja, ich mache mit'}}
      </b-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import User from '../model/user'
import { API_BASEPATH } from '../components/config'

const moment = require('moment')

axios.defaults.headers.put['Content-Type'] = 'application/json'

export default {
  name: 'Register',
  data () {
    return {
      user: null,
      userId: null,
      participating: false,
      modified: false,
      drawingTime: null,
      throttlingAlert: {
        dismissSecs: 5,
        dismissCountDown: 0,
        showDismissibleAlert: false
      },
      errorMessage: null,
      basepath: API_BASEPATH
    }
  },
  watch: {
    $route (to, from) {
      this.setUserId(to.params.userId)
    }
  },
  mounted () {
    this.setUserId(this.$route.params.userId)
    axios.get(`${this.basepath}/api/v1/settings`)
      .then(response => {
        this.throttlingAlert.dismissSecs = response.data.retrySec
        this.drawingTime = response.data.drawingTime

        let now = moment()
        let dtime = moment(this.drawingTime)

        if (now.isAfter(dtime)) {
          this.$router.push({ name: 'assignment', params: { userId: this.userId } })
        }
      })
      .catch(e => {
        this.user = null
      })
  },
  methods: {
    setUserId (userId) {
      this.userId = userId
      this.fetchUserDetails()
      this.fetchParticipation()
    },
    fetchUserDetails () {
      axios.get(`${this.basepath}/api/v1/users/${this.userId}`)
        .then(response => {
          this.user = response.data
        })
        .catch(e => {
          this.user = null
        })
    },
    fetchParticipation () {
      axios.get(`${this.basepath}/api/v1/participations/${this.userId}`)
        .then(response => {
          this.participating = response.data.participating
          this.modified = response.data.modified
        })
        .catch(e => {
          this.user = null
        })
    },
    toggleParticipation (event) {
      let body = { participating: !this.participating }
      axios.put(`${this.basepath}/api/v1/participations/${this.userId}`, JSON.stringify(body))
        .then(response => {
          if (response.status === 204) {
            this.fetchParticipation()
          }
        })
        .catch(e => {
          if (e.response && e.response.status === 429) {
            this.showThrottlingAlert()
          } else if (e.response && e.response.status === 500) {
            this.errorMessage = e.response.detail
          } else {
            this.user = null
          }
        })
    },
    countDownChanged (dismissCountDown) {
      this.throttlingAlert.dismissCountDown = dismissCountDown
    },
    showThrottlingAlert () {
      this.throttlingAlert.dismissCountDown = this.throttlingAlert.dismissSecs
    },
    onAlertDismissed () {
      this.throttlingAlert.dismissCountDown = 0
    }
  }
}

</script>
