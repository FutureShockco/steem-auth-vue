import { createApp } from 'vue';
import App from './App.vue';
import { provideAuthStore } from '../src/stores/auth';

// Create the app instance
const app = createApp(App);

// Provide the auth store
const store = provideAuthStore();

// Mount the app
app.mount('#app'); 