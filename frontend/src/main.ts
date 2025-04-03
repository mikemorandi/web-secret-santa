import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { BootstrapVueNext } from 'bootstrap-vue-next'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import moment from 'moment'
import { API_BASEPATH } from './components/config'

// eslint-disable-next-line no-console
console.log('API_BASEPATH:', API_BASEPATH)

const app = createApp(App)

app.use(router)
app.use(BootstrapVueNext)
app.config.globalProperties.$moment = moment

app.mount('#app')
