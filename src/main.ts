import { createApp } from 'vue'
import App from './App.vue'
import { provideAuthStore } from './stores/auth'
import './assets/main.css'

const app = createApp(App)

provideAuthStore()
app.mount('#app') 