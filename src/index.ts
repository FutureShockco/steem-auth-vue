import { App } from 'vue';
import SteemAuth from './components/SteemAuth.vue';
import SteemTransactions from './components/SteemTransactions.vue';
import MeerayTransactions from './components/MeerayTransactions.vue';
import { useAuthStore, provideAuthStore } from './stores/auth';
import TransactionService from './services/transaction';

// Import global CSS
import './assets/styles/global.css';

// Export all components and utilities
export { SteemAuth, SteemTransactions, MeerayTransactions, useAuthStore, provideAuthStore, TransactionService };

// Plugin installation function
export const install = (app: App): void => {
        app.component('SteemAuth', SteemAuth);
    app.component('SteemTransactions', SteemTransactions);
    app.component('MeerayTransactions', MeerayTransactions);
}; 