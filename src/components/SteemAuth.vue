<template>
    <div class="steem-auth">
        <div v-if="!store.state.isAuthenticated" class="login-container">
            <h2>Steem Login</h2>
            <button @click="handleSteemLogin" class="steemlogin-button">
                Login with SteemLogin
            </button>
            <p class="divider">or</p>
            <form @submit.prevent="handleSubmit" class="login-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input
                        id="username"
                        v-model="username"
                        type="text"
                        required
                        placeholder="Enter your Steem username"
                    />
                </div>
                <div class="form-group">
                    <label for="posting-key">Posting Key</label>
                    <input
                        id="posting-key"
                        v-model="postingKey"
                        type="password"
                        :required="!useKeychain"
                        placeholder="Enter your posting key"
                        :disabled="useKeychain"
                    />
                </div>
                <div class="form-group">
                    <label class="checkbox-container">
                        <input
                            type="checkbox"
                            v-model="useKeychain"
                            :disabled="!hasKeychain"
                        />
                        Use Steem Keychain
                        <span v-if="keychainStatus === 'checking'" class="keychain-status checking">
                            (Checking for Keychain...)
                        </span>
                        <span v-else-if="keychainStatus === 'available'" class="keychain-status available">
                            (Keychain available)
                        </span>
                        <span v-else class="keychain-status unavailable">
                            (Keychain not detected)
                        </span>
                    </label>
                </div>
                <button type="submit" class="login-button" :disabled="loading">
                    {{ loading ? 'Logging in...' : 'Login' }}
                </button>
            </form>
            <div v-if="error" class="error-message">
                {{ error }}
            </div>
        </div>
        <div v-else class="user-info">
            <h2>Welcome, {{ store.state.username }}!</h2>
            <button @click="handleLogout" class="logout-button">Logout</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import sc from '../helpers/steemlogin';

const store = useAuthStore();
const username = ref('');
const postingKey = ref('');
const useKeychain = ref(false);
const hasKeychain = ref(false);
const loading = ref(false);
const error = ref('');
const keychainStatus = ref('checking');

const checkKeychain = () => {
    if (typeof window === 'undefined') return false;
    const keychain = (window as any).steem_keychain;
    return keychain && typeof keychain.requestSignBuffer === 'function';
};

const handleSteemLogin = () => {
    window.location.href = sc.getLoginURL();
};

const handleSteemLoginCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const username = urlParams.get('username');

    if (accessToken && username) {
        loading.value = true;
        error.value = '';
        store.slogin(accessToken)
            .catch(err => {
                error.value = err instanceof Error ? err.message : 'Login failed';
            })
            .finally(() => {
                loading.value = false;
                // Remove sensitive information from URL
                window.history.replaceState({}, document.title, window.location.pathname);
            });
    }
};

const handleSubmit = async () => {
    loading.value = true;
    error.value = '';

    try {
        await store.handleLogin(username.value, useKeychain.value, postingKey.value);
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Login failed';
    } finally {
        loading.value = false;
    }
};

const handleLogout = () => {
    store.logout();
};

onMounted(() => {
    // Initial check
    hasKeychain.value = checkKeychain();
    keychainStatus.value = hasKeychain.value ? 'available' : 'unavailable';
    
    // Retry check after a short delay in case extension is still loading
    setTimeout(() => {
        hasKeychain.value = checkKeychain();
        keychainStatus.value = hasKeychain.value ? 'available' : 'unavailable';
    }, 1000);

    // Check if we're handling a SteemLogin callback
    handleSteemLoginCallback();
    
    store.checkUser();
});
</script>

<style scoped>
.steem-auth {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

.login-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.steemlogin-button {
    width: 100%;
    padding: 12px;
    background-color: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
}

.steemlogin-button:hover {
    background-color: #1557b0;
}

.divider {
    text-align: center;
    position: relative;
    margin: 20px 0;
}

.divider::before,
.divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background-color: #ddd;
}

.divider::before {
    left: 0;
}

.divider::after {
    right: 0;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

label {
    font-weight: 500;
}

input[type="text"],
input[type="password"] {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

input[type="text"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: #1a73e8;
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.login-button,
.logout-button {
    padding: 10px;
    background-color: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
}

.login-button:hover,
.logout-button:hover {
    background-color: #1557b0;
}

.login-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.error-message {
    color: #d32f2f;
    margin-top: 10px;
    text-align: center;
}

.user-info {
    text-align: center;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.keychain-status {
    margin-left: 8px;
    font-size: 0.8em;
}

.keychain-status.checking {
    color: #666;
}

.keychain-status.available {
    color: #4caf50;
}

.keychain-status.unavailable {
    color: #f44336;
}
</style> 