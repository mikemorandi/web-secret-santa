<template>
  <div class="container">
    <div v-if="user !== null && assignment != null" class="jumbotron">
      <h1 class="display-4">Hallo {{ user.firstName }}</h1>
      <hr class="my-4">
      <p class="lead">Für dich wurde <strong>{{ assignment.firstName }}</strong> ausgelost</p>
    </div>
    <div v-if="user == null || assignment == null" class="jumbotron">
      <h1 class="display-4">Fehler</h1>
      <hr class="my-4">
      <p class="lead">Du wurdest noch nicht ausgelost</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { API_BASEPATH } from '../components/config'

axios.defaults.headers.put['Content-Type'] = 'application/json'

export default defineComponent({
  name: 'AssignmentPage',
  setup () {
    const route = useRoute()
    const user = ref(null)
    const userId = ref<string | null>(null)
    const assignment = ref(null)
    const errorMessage = ref(null)
    const basepath = API_BASEPATH

    const setUserId = (id: string) => {
      userId.value = id
      fetchUserDetails()
      fetchAssignment()
    }

    const fetchUserDetails = () => {
      axios.get(`${basepath}/users/${userId.value}`)
        .then(response => {
          user.value = response.data
        })
        .catch(() => {
          user.value = null
        })
    }

    const fetchAssignment = () => {
      axios.get(`${basepath}/assignments/${userId.value}`)
        .then(response => {
          assignment.value = response.data
        })
        .catch(() => {
          user.value = null
        })
    }

    watch(() => route.params.userId, (newId) => {
      setUserId(newId as string)
    })

    onMounted(() => {
      setUserId(route.params.userId as string)
    })

    return {
      user,
      userId,
      assignment,
      errorMessage
    }
  }
})
</script>
