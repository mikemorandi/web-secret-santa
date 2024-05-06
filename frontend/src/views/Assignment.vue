<template>
  <div class="container">
    <div class="jumbotron" v-if="user !== null && assignment != null">
      <h1 class="display-4">Hallo {{user.firstName}}</h1>
      <hr class="my-4">
      <p class="lead">Für dich wurde <strong>{{assignment.firstName}}</strong> ausgelost</p>
    </div>
    <div class="jumbotron" v-if="user == null || assignment == null">
      <h1 class="display-4">Fehler</h1>
      <hr class="my-4">
      <p class="lead">Du wurdest noch nicht ausgelost</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import User from '../model/user'
import { API_BASEPATH } from '../components/config'

axios.defaults.headers.put['Content-Type'] = 'application/json'

export default {
  name: 'Assignment-',
  data () {
    return {
      user: null,
      userId: null,
      assignment: null,
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
  },
  methods: {
    setUserId (userId) {
      this.userId = userId
      this.fetchUserDetails()
      this.fetchAssignment()
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
    fetchAssignment () {
      axios.get(`${this.basepath}/api/v1/assignments/${this.userId}`)
        .then(response => {
          this.assignment = response.data
        })
        .catch(e => {
          this.user = null
        })
    }
  }
}

</script>
