<template>
    <div class="steem-auth">
        <!-- Trigger Button -->
        <button v-if="!store.state.isAuthenticated" @click="showModal = true" class="auth-trigger">
            <slot name="trigger">
                <span>Login to Steem</span>
            </slot>
        </button>

        <!-- User Info (when authenticated) -->
        <div v-else class="user-info">
            <slot name="user-info">
                <div class="user-profile">
                    <span class="username">{{ store.state.username }}</span>
                    <button @click="handleLogout" class="logout-button">
                        <span>Logout</span>
                    </button>
                </div>
            </slot>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay" @click="showModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2>Steem Authentication</h2>
                    <button class="close-button" @click="showModal = false">&times;</button>
                </div>

                <div class="modal-body">
                    <div class="auth-options">
                        <button @click="handleSteemLogin" class="auth-option steemlogin-button">
                            <span class="icon">🔑</span>
                            <span>Login with SteemLogin</span>
                        </button>

                        <div class="divider">
                            <span>or</span>
                        </div>

                        <form @submit.prevent="handleSubmit" class="login-form">
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input
                                    id="username"
                                    v-model="username"
                                    type="text"
                                    required
                                    placeholder="Enter your Steem username"
                                    :class="{ 'error': usernameError }"
                                />
                                <span v-if="usernameError" class="error-text">{{ usernameError }}</span>
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
                                    :class="{ 'error': postingKeyError }"
                                />
                                <span v-if="postingKeyError" class="error-text">{{ postingKeyError }}</span>
                            </div>

                            <div class="form-group keychain-option">
                                <label class="checkbox-container">
                                    <input
                                        type="checkbox"
                                        v-model="useKeychain"
                                        :disabled="!hasKeychain"
                                    />
                                    <span class="checkmark"></span>
                                    <span class="label-text">Use Steem Keychain</span>
                                    <span :class="['keychain-status', keychainStatus]">
                                        {{ keychainStatusText }}
                                    </span>
                                </label>
                            </div>

                            <button type="submit" class="submit-button" :disabled="loading">
                                <span v-if="loading" class="spinner"></span>
                                <span>{{ loading ? 'Authenticating...' : 'Login' }}</span>
                            </button>
                        </form>
                    </div>

                    <div v-if="error" class="error-message">
                        <span class="error-icon">⚠️</span>
                        <span>{{ error }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import sc from '../helpers/steemlogin';

// Define types
interface AuthState {
    isAuthenticated: boolean;
    username: string;
}

interface AuthStore {
    state: AuthState;
    slogin: (token: string) => Promise<void>;
    handleLogin: (username: string, useKeychain: boolean, postingKey: string) => Promise<void>;
    logout: () => void;
    checkUser: () => void;
}

// Initialize store with proper typing
const store = useAuthStore() as AuthStore;

// Define reactive refs with proper types
const showModal = ref<boolean>(false);
const username = ref<string>('');
const postingKey = ref<string>('');
const useKeychain = ref<boolean>(false);
const hasKeychain = ref<boolean>(false);
const loading = ref<boolean>(false);
const error = ref<string>('');
const keychainStatus = ref<'checking' | 'available' | 'unavailable'>('checking');
const usernameError = ref<string>('');
const postingKeyError = ref<string>('');

const keychainStatusText = computed(() => {
    switch (keychainStatus.value) {
        case 'checking': return 'Checking for Keychain...';
        case 'available': return 'Keychain available';
        default: return 'Keychain not detected';
    }
});

const checkKeychain = (): boolean => {
    if (typeof window === 'undefined') return false;
    const keychain = (window as any).steem_keychain;
    return keychain && typeof keychain.requestSignBuffer === 'function';
};

const handleSteemLogin = (): void => {
    window.location.href = sc.getLoginURL();
};

const handleSteemLoginCallback = (): void => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const username = urlParams.get('username');

    if (accessToken && username) {
        loading.value = true;
        error.value = '';
        store.slogin(accessToken)
            .then(() => {
                showModal.value = false;
            })
            .catch((err: Error | unknown) => {
                error.value = err instanceof Error ? err.message : 'Login failed';
            })
            .finally(() => {
                loading.value = false;
                window.history.replaceState({}, document.title, window.location.pathname);
            });
    }
};

const validateForm = (): boolean => {
    let isValid = true;
    usernameError.value = '';
    postingKeyError.value = '';

    if (!username.value) {
        usernameError.value = 'Username is required';
        isValid = false;
    }

    if (!useKeychain.value && !postingKey.value) {
        postingKeyError.value = 'Posting key is required';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    loading.value = true;
    error.value = '';

    try {
        await store.handleLogin(username.value, useKeychain.value, postingKey.value);
        showModal.value = false;
    } catch (err: Error | unknown) {
        error.value = err instanceof Error ? err.message : 'Login failed';
    } finally {
        loading.value = false;
    }
};

const handleLogout = (): void => {
    store.logout();
};

onMounted(() => {
    hasKeychain.value = checkKeychain();
    keychainStatus.value = hasKeychain.value ? 'available' : 'unavailable';
    
    setTimeout(() => {
        hasKeychain.value = checkKeychain();
        keychainStatus.value = hasKeychain.value ? 'available' : 'unavailable';
    }, 1000);

    handleSteemLoginCallback();
    store.checkUser();
});
</script>

<style scoped>
.steem-auth {
    display: inline-block;
}

.auth-trigger {
    padding: 8px 16px;
    background-color: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.auth-trigger:hover {
    background-color: #1557b0;
    transform: translateY(-1px);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
}

.username {
    font-weight: 500;
    color: #333;
}

.logout-button {
    padding: 6px 12px;
    background-color: #f1f3f4;
    color: #5f6368;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.logout-button:hover {
    background-color: #e8eaed;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
    color: #202124;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    color: #5f6368;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
}

.close-button:hover {
    color: #202124;
}

.modal-body {
    padding: 24px;
}

.auth-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.auth-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    width: 100%;
}

.steemlogin-button {
    background-color: #1a73e8;
    color: white;
}

.steemlogin-button:hover {
    background-color: #1557b0;
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: #5f6368;
    margin: 8px 0;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e0e0e0;
}

.divider span {
    padding: 0 16px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

label {
    font-size: 14px;
    color: #202124;
    font-weight: 500;
}

input[type="text"],
input[type="password"] {
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.2s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

input.error {
    border-color: #d93025;
}

.error-text {
    color: #d93025;
    font-size: 12px;
    margin-top: 4px;
}

.keychain-option {
    margin-top: 8px;
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-container input[type="checkbox"] {
    display: none;
}

.checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #5f6368;
    border-radius: 4px;
    display: inline-block;
    position: relative;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark {
    background-color: #1a73e8;
    border-color: #1a73e8;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark::after {
    content: '✓';
    position: absolute;
    color: white;
    font-size: 12px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.label-text {
    font-size: 14px;
    color: #202124;
}

.keychain-status {
    font-size: 12px;
    margin-left: 4px;
}

.keychain-status.checking {
    color: #5f6368;
}

.keychain-status.available {
    color: #34a853;
}

.keychain-status.unavailable {
    color: #d93025;
}

.submit-button {
    padding: 12px;
    background-color: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.submit-button:hover {
    background-color: #1557b0;
}

.submit-button:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-message {
    margin-top: 16px;
    padding: 12px;
    background-color: #fce8e6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #d93025;
}

.error-icon {
    font-size: 16px;
}
</style> 