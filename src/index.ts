import { App } from 'vue';
import SteemAuth from './components/SteemAuth.vue';
import SteemTransactions from './components/SteemTransactions.vue';
import EchelonTransactions from './components/EchelonTransactions.vue';
import { useAuthStore, provideAuthStore } from './stores/auth';
import TransactionService from './services/transaction';

// Import global CSS
import './assets/styles/global.css';

// Export all components and utilities
export {
    SteemAuth,
    SteemTransactions,
    EchelonTransactions,
    useAuthStore,
    provideAuthStore,
    TransactionService
};

// Plugin installation function
const install = (app: App): void => {
    app.component('SteemAuth', SteemAuth);
    app.component('SteemTransactions', SteemTransactions);
    app.component('EchelonTransactions', EchelonTransactions);
};

export default {
    install
}; 