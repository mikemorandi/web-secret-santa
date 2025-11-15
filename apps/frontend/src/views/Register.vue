<template>
  <div class="container">
    <BAlert dismissible fade :show="errorMessage" variant="danger" @dismissed="errorMessage = null">{{ errorMessage }}</BAlert>

    <div v-if="showToast" class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-warning text-dark">
          <strong class="me-auto">Zu schnell</strong>
          <button @click="showToast = false" type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
    <div class="jumbotron">
      <h1 v-if="user !== null" class="display-4">Hallo {{ user.firstName }}</h1>
      <h1 v-if="user == null" class="display-4">Hoppla!</h1>
      <p v-if="user && !participating && modified" class="lead">
        Schade, du nimmst beim Wichteln nicht teil. Bis am {{ formatDate(drawingTime) }} kannst du dich hier wieder anmelden
      </p>
      <p v-if="user && !participating && !modified" class="lead">
        Nimmst du beim Wichteln teil? Die Ziehung findet am {{ formatDate(drawingTime) }} statt
      </p>
      <p v-if="user && participating" class="lead">
        Super, du nimmst beim Wichteln teil. Die Auslosung wird am {{ formatDate(drawingTime) }} durchgeführt und du wirst per E-Mail erfahren, wen du beschenken darfst. Bis dahin kannst du dich hier wieder abmelden.
      </p>
      <p v-if="user == null" class="lead">Da lief was schief. Deine ID ist uns unbekannt</p>
      <hr class="my-4">
      <BButton
        v-if="user !== null"
        :disabled="throttlingAlert.dismissCountDown > 0"
        :variant="participating ? 'secondary' : 'success'"
        @click="toggleParticipation">
        {{ participating ? 'Nein, ich mache nicht mehr mit' : 'Ja, ich mache mit' }}
      </BButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import moment from 'moment'
import { API_BASEPATH } from '../components/config'
import { BButton, BAlert } from 'bootstrap-vue-next'

axios.defaults.headers.put['Content-Type'] = 'application/json'

export default defineComponent({
  name: 'RegisterPage',
  components: {
    BButton,
    BAlert
  },
  setup () {
    const route = useRoute()
    const router = useRouter()
    const showToast = ref(false)
    const toastMessage = ref('')
    const user = ref(null)
    const userId = ref<string | null>(null)
    const participating = ref(false)
    const modified = ref(false)
    const drawingTime = ref(null)
    const throttlingAlert = reactive({
      dismissSecs: 5,
      dismissCountDown: 0,
      showDismissibleAlert: false
    })
    const errorMessage = ref(null)
    const basepath = API_BASEPATH

    const formatDate = (date: string | Date) => {
      return moment(date).format('DD.MM.YYYY')
    }

    const setUserId = (id: string) => {
      userId.value = id
      fetchUserDetails()
      fetchParticipation()
    }

    const fetchUserDetails = () => {
      axios.get(`${basepath}/api/v1/users/${userId.value}`)
        .then(response => {
          user.value = response.data
        })
        .catch(() => {
          user.value = null
        })
    }

    const fetchParticipation = () => {
      axios.get(`${basepath}/api/v1/participations/${userId.value}`)
        .then(response => {
          participating.value = response.data.participating
          modified.value = response.data.modified
        })
        .catch(() => {
          user.value = null
        })
    }

    const toggleParticipation = () => {
      const body = { participating: !participating.value }
      axios.put(`${basepath}/api/v1/participations/${userId.value}`, JSON.stringify(body))
        .then(response => {
          if (response.status === 204) {
            fetchParticipation()
          }
        })
        .catch(e => {
          if (e.response && e.response.status === 429) {
            // Get the retry-after header or use default
            const retryAfter = e.response.headers['retry-after'] 
              ? parseInt(e.response.headers['retry-after'], 10) 
              : 5
              
            // Show toast without disabling button
            toastMessage.value = 'Du hast deine Meinung zu schnell geändert, bitte warte ein paar Sekunden... '
            showToast.value = true
            
            // Auto-hide toast after 5 seconds
            setTimeout(() => {
              showToast.value = false
            }, 5000)
          } else if (e.response && e.response.status === 500) {
            errorMessage.value = e.response.detail
          } else {
            user.value = null
          }
        })
    }

    const countDownChanged = (count: number) => {
      throttlingAlert.dismissCountDown = count
    }

    const showThrottlingAlert = (durationInSeconds = null) => {
      // If a specific duration is provided, use it, otherwise use the default
      const duration = durationInSeconds || throttlingAlert.dismissSecs
      throttlingAlert.dismissCountDown = duration
    }

    const onAlertDismissed = () => {
      throttlingAlert.dismissCountDown = 0
    }

    watch(() => route.params.userId, (newId) => {
      setUserId(newId as string)
    })

    onMounted(() => {
      setUserId(route.params.userId as string)
      axios.get(`${basepath}/api/v1/settings`)
        .then(response => {
          throttlingAlert.dismissSecs = response.data.retrySec
          drawingTime.value = response.data.drawingTime

          const now = moment()
          const dtime = moment(drawingTime.value)

          if (now.isAfter(dtime)) {
            router.push({ name: 'assignment', params: { userId: userId.value } })
          }
        })
        .catch(() => {
          user.value = null
        })
    })

    return {
      user,
      userId,
      participating,
      modified,
      drawingTime,
      throttlingAlert,
      errorMessage,
      showToast,
      toastMessage,
      formatDate,
      toggleParticipation,
      countDownChanged,
      onAlertDismissed
    }
  }
})
</script>
