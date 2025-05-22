import { createApp } from 'vue'
import App from './App.vue'
// import { provideAuthStore } from './stores/auth' // Do NOT call provideAuthStore here
import './assets/main.css'

const app = createApp(App)

// provideAuthStore() // Do NOT call here. Call from a component's setup() instead.

app.mount('#app') 