import { createApp } from 'vue';
import 'regenerator-runtime/runtime';
import App from './App.vue';
// Import from the built distribution files
//@ts-ignore
import { useAuthStore } from '../dist/steem-auth-vue.es.js';
//import './styles/steem-auth-custom.css';

// Create the app instance
const app = createApp(App);

// Provide the auth store
useAuthStore();

// Mount the app
app.mount('#app'); 
