<template>
    <div class="steem-auth steem-auth-component">
        <!-- Button Group (Theme Toggle + Login/User Info) -->
        <div class="steem-auth-container" :class="{ 'steem-auth--dark': isDarkTheme }">
            <!-- Theme Toggle Button -->
            <button class="steem-auth-theme-toggle" @click="toggleTheme" type="button" :title="isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'">
                {{ isDarkTheme ? '☀️' : '🌙' }}
            </button>

            <!-- Login Button / User Info -->
            <template v-if="!store.state.isAuthenticated">
                <button @click="showModal = true" class="steem-auth-button">
            <slot name="trigger">
                <span>Login to Steem</span>
            </slot>
        </button>
            </template>
            <template v-else>
                <div class="steem-auth-user-info">
            <slot name="user-info">
                        <div class="steem-auth-user-profile">
                            <button @click="handleLogout" class="steem-auth-button">
                        <span>Logout</span>
                    </button>
                </div>
            </slot>
                </div>
            </template>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="steem-auth-modal-overlay" @click="showModal = false">
            <div class="steem-auth-modal-content" @click.stop>
                <div class="steem-auth-modal-header">
                    <h2>Steem Authentication</h2>
                    <button class="steem-auth-close-button" @click="showModal = false">&times;</button>
                </div>

                <div class="steem-auth-modal-body">
                    <div class="steem-auth-options">
                        <!-- SteemLogin option (conditionally displayed) -->
                        <button v-if="enableSteemLogin" @click="handleSteemLogin" class="steem-auth-button full-width">
                            <span>Login with SteemLogin</span>
                        </button>

                        <!-- Only show divider if multiple auth methods are enabled -->
                        <div v-if="enableSteemLogin && (enableDirectLogin || enableKeychain)" class="steem-auth-divider">
                            <span>or</span>
                        </div>

                        <!-- Direct login and Keychain options (conditionally displayed) -->
                        <form v-if="enableDirectLogin || enableKeychain" @submit.prevent="handleSubmit" class="steem-auth-login-form">
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input
                                    id="username"
                                    v-model="username"
                                    type="text"
                                    required
                                    placeholder="Enter your Steem username"
                                    class="steem-auth-input"
                                    :class="{ 'error': usernameError }"
                                />
                                <span v-if="usernameError" class="steem-auth-error-text">{{ usernameError }}</span>
                            </div>

                            <div class="form-group" v-if="!useKeychain && enableDirectLogin">
                                <label for="posting-key">Posting Key</label>
                                <input
                                    id="posting-key"
                                    v-model="postingKey"
                                    type="password"
                                    required
                                    placeholder="Enter your posting key"
                                    class="steem-auth-input"
                                    :class="{ 'error': postingKeyError }"
                                />
                                <span v-if="postingKeyError" class="steem-auth-error-text">{{ postingKeyError }}</span>
                            </div>

                            <div v-if="enableKeychain" class="form-group steem-auth-keychain-option">
                                <label class="steem-auth-checkbox-container">
                                    <input
                                        type="checkbox"
                                        v-model="useKeychain"
                                        :disabled="!hasKeychain"
                                    />
                                    <span class="steem-auth-checkmark"></span>
                                    <span class="steem-auth-label-text">Use Steem Keychain</span>
                                    <div class="steem-auth-keychain-container">
                                        <div :class="['steem-auth-keychain-status', hasKeychain ? 'available' : 'unavailable']">
                                            <span v-if="hasKeychain">Keychain Available</span>
                                            <span v-else>Keychain Not Found</span>
                                        </div>
                                        <div v-if="!hasKeychain" class="steem-auth-keychain-download">
                                            <a href="https://chrome.google.com/webstore/detail/steem-keychain/lkcjlnjfpbikmcmbachjpdbijejflpcm" target="_blank">
                                                Download Steem Keychain
                                            </a>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <button type="submit" class="steem-auth-button full-width" :disabled="loading">
                                <span v-if="loading" class="steem-auth-spinner"></span>
                                <span>{{ loading ? 'Authenticating...' : 'Login' }}</span>
                            </button>
                        </form>
                    </div>

                    <div v-if="error" class="steem-auth-error-message">
                        <span class="steem-auth-error-icon">⚠️</span>
                        <span>{{ error }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { configureSteemLogin, getSteemLoginClient } from '../helpers/steemlogin';

// Define configuration props with defaults
const props = withDefaults(defineProps<{
    // Auth method configuration
    enableSteemLogin?: boolean;
    enableKeychain?: boolean;
    enableDirectLogin?: boolean;
    // Default theme
    defaultDarkMode?: boolean;
    appName: string;
    callbackURL: string;
}>(), {
    enableSteemLogin: true,
    enableKeychain: true,
    enableDirectLogin: true,
    defaultDarkMode: false,
});

// Emit events for theme changes
const emit = defineEmits<{
    (e: 'theme-change', isDark: boolean): void;
}>();

// Define types
interface AuthState {
    isAuthenticated: boolean;
    username: string;
    account: any | null;
    loginAuth: 'steem' | 'keychain' | 'steemlogin';
    appName: string;
    callbackURL: string;
}

interface AuthStore {
    state: AuthState;
    slogin: (token: string) => Promise<void>;
    handleLogin: (username: string, useKeychain: boolean, postingKey: string) => Promise<void>;
    logout: () => void;
    checkUser: () => void;
    setConfig: (appName: string, callbackURL: string) => void;
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
const usernameError = ref<string>('');
const postingKeyError = ref<string>('');
const isDarkTheme = ref<boolean>(props.defaultDarkMode);

const checkKeychain = (): boolean => {
    if (typeof window === 'undefined') return false;
    const keychain = (window as any).steem_keychain;
    return keychain && typeof keychain.requestSignBuffer === 'function';
};

const handleSteemLogin = (): void => {
    const client = getSteemLoginClient();
    window.location.href = client.getLoginURL();
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

    if (!useKeychain.value && !postingKey.value && props.enableDirectLogin) {
        postingKeyError.value = 'Posting key is required';
        isValid = false;
    }

    return isValid;
};

// Watch for authentication state changes
watch(() => store.state.isAuthenticated, (newValue) => {
    if (newValue && showModal.value) {
        showModal.value = false;
    }
});

const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    loading.value = true;
    error.value = '';

    try {
        await store.handleLogin(username.value, useKeychain.value, postingKey.value);
        // Only close the modal for non-Keychain login
        if (!useKeychain.value) {
        showModal.value = false;
        }
    } catch (err: Error | unknown) {
        error.value = err instanceof Error ? err.message : 'Login failed';
        showModal.value = false;
    } finally {
        loading.value = false;
    }
};

const handleLogout = (): void => {
    store.logout();
};

// Watch for prop changes and update store
watch(() => [props.appName, props.callbackURL], ([newAppName, newCallbackURL]) => {
    store.setConfig(newAppName, newCallbackURL);
}, { immediate: true });

onMounted(() => {
    // Initialize theme
    initTheme();
    
    // Only check for keychain if it's enabled
    if (props.enableKeychain) {
        hasKeychain.value = checkKeychain();
        
        setTimeout(() => {
            hasKeychain.value = checkKeychain();
    }, 1000);
    }

    // Handle SteemLogin callback if enabled
    if (props.enableSteemLogin) {
    handleSteemLoginCallback();
    }
    
    store.checkUser();

    // Configure steemlogin when component is mounted
    configureSteemLogin(store.state.appName, store.state.callbackURL);
});

// Theme management
const THEME_STORAGE_KEY = 'steem-auth-theme';

const applyTheme = (isDark: boolean) => {
    if (isDark) {
        document.documentElement.classList.add('dark-theme');
    } else {
        document.documentElement.classList.remove('dark-theme');
    }
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    emit('theme-change', isDark);
};

const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value;
    applyTheme(isDarkTheme.value);
};

const initTheme = () => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme) {
        isDarkTheme.value = storedTheme === 'dark';
    } else if (props.defaultDarkMode) {
        isDarkTheme.value = true;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Use system preference if no stored theme
        isDarkTheme.value = true;
    }
    
    // Apply the theme
    applyTheme(isDarkTheme.value);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-change if user hasn't manually set a theme
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            isDarkTheme.value = e.matches;
            applyTheme(isDarkTheme.value);
        }
    });
};
</script> 