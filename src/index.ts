import { App } from 'vue';
import SteemAuth from './components/SteemAuth.vue';
import { useAuthStore } from './stores/auth';

export { SteemAuth, useAuthStore };

export default {
    install: (app: App) => {
        app.component('SteemAuth', SteemAuth);
    }
}; 