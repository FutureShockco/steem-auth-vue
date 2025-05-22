<template>
    <div class="steem-auth steem-auth-component">
        <!-- Button Group (Theme Toggle + Login/User Info) -->
        <div class="steem-auth-container" :class="{ 'steem-auth--dark': isDarkTheme }">
            <!-- Theme Toggle Button -->
            <button v-if="props.displayDarkModeToggle" class="steem-auth-theme-toggle" @click="toggleTheme"
                type="button" :title="isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'">
                {{ isDarkTheme ? '☀️' : '🌙' }}
            </button>

            <!-- Login Button / User Info -->
            <template v-if="!store.state.isAuthenticated">
                <button @click="openLoginModal" class="steem-auth-button">
            <slot name="trigger">
                        <span>Login</span>
            </slot>
        </button>
            </template>
            <template v-else>
                <div class="steem-auth-user-info">
            <slot name="user-info">
                        <div class="steem-auth-user-profile">
                            <div class="steem-auth-dropdown-wrapper">
                                <button class="steem-auth-button" @click="showDropdown = !showDropdown">
                                    {{ store.state.username }}
                                </button>
                                <div v-if="showDropdown" class="steem-auth-dropdown-menu">
                                    <div class="steem-auth-dropdown-current">
                                        <strong>Current:</strong> {{ store.state.username }} ({{ store.state.loginAuth
                                        }})
                                    </div>
                                    <div class="steem-auth-dropdown-list">
                                        <div v-for="acc in store.accounts" :key="acc.username">
                                            <button class="steem-auth-dropdown-item"
                                                :disabled="acc.username === store.state.username"
                                                @click="switchAccountFromDropdown(acc.username)">
                                                {{ acc.username }} ({{ acc.loginAuth }})
                    </button>
                </div>
        </div>
                                    <button class="steem-auth-dropdown-item" @click="openAddAccountModal">
                                        Add Account
                                    </button>
                                    <button class="steem-auth-dropdown-item" @click="handleManageAccounts">
                                        Manage Accounts
                                    </button>
                                    <div class="steem-auth-dropdown-divider"></div>
                                    <button class="steem-auth-dropdown-item steem-auth-button-danger"
                                        @click="handleLogout">
                                        Logout
                        </button>
                        </div>
                            </div>
                            </div>
                    </slot>
                </div>
            </template>
        </div>

        <!-- Login Modal -->
        <LoginModal :visible="showModal" :loading="loading" :error="error" :username="username" :postingKey="postingKey"
            :useKeychain="useKeychain" :hasKeychain="hasKeychain" :usernameError="usernameError"
            :postingKeyError="postingKeyError" :enableSteemLogin="enableSteemLogin"
            :enableDirectLogin="enableDirectLogin" :enableKeychain="enableKeychain" :addingAccount="addingAccount"
            :loginAuth="store.state.loginAuth" :currentUsername="store.state.username" :accounts="store.accounts"
            @close="showModal = false" @submit="handleSubmit" @steemlogin="handleSteemLogin"
            @update:username="username = $event" @update:postingKey="postingKey = $event"
            @update:useKeychain="useKeychain = $event" @auto-login="handleAutoLogin" />

        <ManageAccountsModal v-if="showManageAccountsModal && store.state.isAuthenticated"
            :visible="showManageAccountsModal" :accounts="store.accounts" :currentUsername="store.state.username"
            @close="handleManageAccountsClose" @switch="handleManageAccountsSwitch"
            @delete="handleManageAccountsDelete" />

        <PinModal v-if="showPinModal" :show="showPinModal" :mode="pinMode" @close="handlePinClose"
            @submit="handlePinSubmit" />

        <slot :requestActiveKey="requestActiveKey"></slot>
        <ActiveKeyModal v-if="showActiveKeyModal && pendingOperation" :show="showActiveKeyModal"
            :operation="pendingOperation!" @close="closeActiveKeyModal" @submit="handleActiveKeySubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { configureSteemLogin, getSteemLoginClient } from '../helpers/steemlogin';
import ActiveKeyModal from './ActiveKeyModal.vue';
import ManageAccountsModal from './ManageAccountsModal.vue';
import LoginModal from './LoginModal.vue';
import PinModal from './PinModal.vue';
import { EncryptionService } from '../services/encryption';
import type { ExtendedOperation } from './ActiveKeyModal.vue';
import type { AuthStore } from '../stores/auth';
import { setPinRequestHandler } from '../services/transaction';
import { initClient } from '@/helpers/client';

// Define configuration props with defaults
const props = withDefaults(defineProps<{
    // Auth method configuration
    displayDarkModeToggle?: boolean;
    enableSteemLogin?: boolean;
    enableKeychain?: boolean;
    enableDirectLogin?: boolean;
    // Default theme
    defaultDarkMode?: boolean;
    appName: string;
    callbackURL: string;
    steemApi?: string;
    steemApiOptions?: object;
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
const selectedAccount = ref(store.state.username);
const showDropdown = ref(false);
const addingAccount = ref(false);
const showManageAccountsModal = ref(false);
const showPinModal = ref(false);
const pinMode = ref<'set' | 'unlock'>('set');
const pendingPinCallback = ref<null | ((pin: string) => void)>(null);

// Add isClient ref to track client-side rendering
const isClient = ref(false);

const checkKeychain = (): boolean => {
    if (typeof window === 'undefined') return false;
    const keychain = (window as any).steem_keychain;
    return keychain && typeof keychain.requestSignBuffer === 'function';
};

const handleSteemLogin = (): void => {
    if (typeof window !== 'undefined') {
        const client = getSteemLoginClient();
        window.location.href = client.getLoginURL();
    }
};

const handleSteemLoginCallback = (): void => {
    if (typeof window === 'undefined') return;
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
        // If using Steem direct login, show PIN modal after posting key validation
        if (!useKeychain.value && props.enableDirectLogin) {
            // Validate posting key first (simulate what handleLogin does)
            const isValid = await store.validatePostingKey(username.value, postingKey.value);
            if (!isValid) {
                postingKeyError.value = 'Invalid posting key';
                loading.value = false;
                return;
            }
            // Show PIN modal in 'set' mode
            pinMode.value = 'set';
            showPinModal.value = true;
            pendingPinCallback.value = async (pin: string) => {
                loading.value = true;
                // Derive encryption key from PIN
                await EncryptionService.generatePinKey(username.value, pin);
                // Encrypt posting key
                const encryptedPk = await EncryptionService.encryptAndReturnPrivateKey(postingKey.value);
                // Now call handleLogin with postingKey (legacy, for state/account setup)
                await store.handleLogin(username.value, false, postingKey.value);
                // Overwrite the encryptedPk in the stored account (handleLogin will use legacy method)
                const accIdx = store.accounts.findIndex(a => a.username === username.value && a.loginAuth === 'steem');
                if (accIdx !== -1) {
                    store.accounts[accIdx].encryptedPk = encryptedPk;
                }
                showPinModal.value = false;
                showModal.value = false;
                loading.value = false;
            };
            loading.value = false;
            return;
        }
        await store.handleLogin(username.value, useKeychain.value, postingKey.value);
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
watch(() => [props.appName, props.callbackURL, props.steemApi, props.steemApiOptions], ([newAppName, newCallbackURL, newSteemApi, newSteemApiOptions]) => {
    const safeSteemApi = typeof newSteemApi === 'string' ? newSteemApi : undefined;
    const safeSteemApiOptions = (newSteemApiOptions && typeof newSteemApiOptions === 'object' && !Array.isArray(newSteemApiOptions)) ? newSteemApiOptions : undefined;
    initClient(safeSteemApi, safeSteemApiOptions);
    const safeAppName = typeof newAppName === 'string' ? newAppName : '';
    const safeCallbackURL = typeof newCallbackURL === 'string' ? newCallbackURL : '';
    store.setConfig(safeAppName, safeCallbackURL);
    configureSteemLogin(safeAppName, safeCallbackURL);
}, { immediate: true });

onMounted(() => {
    isClient.value = true;
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

    // Hide dropdown on outside click
    if (typeof document !== 'undefined') {
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.steem-auth-dropdown-wrapper');
            if (dropdown && !dropdown.contains(e.target as Node)) {
                showDropdown.value = false;
            }
        });
    }

    setPinRequestHandler((username, callback) => {
        console.log('[PIN HANDLER] Showing PIN modal for user:', username);
        pinMode.value = 'unlock';
        showPinModal.value = true;
        pendingPinCallback.value = (pin: string) => {
            console.log('[PIN HANDLER] PIN entered:', pin);
            showPinModal.value = false;
            callback(pin);
        };
    });
});

// Theme management
const THEME_STORAGE_KEY = 'steem-auth-theme';

const applyTheme = (isDark: boolean) => {
    if (typeof document !== 'undefined') {
        if (isDark) {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    }
    emit('theme-change', isDark);
};

const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value;
    applyTheme(isDarkTheme.value);
};

const initTheme = () => {
    if (typeof window === 'undefined') return;
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
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-change if user hasn't manually set a theme
            if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                isDarkTheme.value = e.matches;
                applyTheme(isDarkTheme.value);
            }
        });
    }
};

const showActiveKeyModal = ref(false);
const pendingOperation = ref<ExtendedOperation | null>(null);
let onKeyProvided: ((key: string) => void) | null = null;

function requestActiveKey(operation: ExtendedOperation, callback: (key: string) => void) {
    pendingOperation.value = operation;
    showActiveKeyModal.value = true;
    onKeyProvided = callback;
}

function handleActiveKeySubmit(activeKey: string) {
    showActiveKeyModal.value = false;
    if (onKeyProvided) {
        onKeyProvided(activeKey);
        onKeyProvided = null;
    }
}

function closeActiveKeyModal() {
    showActiveKeyModal.value = false;
    onKeyProvided = null;
}

watch(
    () => store.state.username,
    (newVal) => {
        selectedAccount.value = newVal;
    }
);

const switchAccountFromDropdown = async (username: string) => {
    if (username !== store.state.username) {
        await store.switchAccount(username);
        showDropdown.value = false;
    }
};

watch(
    () => store.state.isAuthenticated,
    () => {
        showDropdown.value = false;
    }
);

const openLoginModal = () => {
    showModal.value = true;
    addingAccount.value = false;
};

const openAddAccountModal = () => {
    showModal.value = true;
    showDropdown.value = false;
    addingAccount.value = true;
};

watch(showModal, (val) => {
    if (!val) addingAccount.value = false;
});

const handleManageAccounts = () => {
    showManageAccountsModal.value = true;
    showDropdown.value = false;
};

const handleManageAccountsClose = () => {
    showManageAccountsModal.value = false;
};

const handleManageAccountsSwitch = async (username: string) => {
    await store.switchAccount(username);
    showManageAccountsModal.value = false;
};

const handleManageAccountsDelete = (username: string) => {
    store.removeAccount(username);
    // If the deleted account was the current, logout
    if (username === store.state.username) {
        store.logout();
    }
};

const handleAutoLogin = async (acc: { username: string; loginAuth: string; accessToken?: string; encryptedPk?: string }) => {
    if (acc.loginAuth === 'steemlogin' && acc.accessToken) {
        await store.slogin(acc.accessToken);
        showModal.value = false;
        return;
    }
    username.value = acc.username;
    if (acc.loginAuth === 'keychain') {
        useKeychain.value = true;
        await handleSubmit();
        showModal.value = false;
        return;
    }
    if (acc.loginAuth === 'steem') {
        useKeychain.value = false;
        await handleSubmit();
        showModal.value = false;
        return;
    }
    // fallback: just prefill username
    showModal.value = false;
};

function handlePinSubmit(pin: string) {
    console.log('[PIN MODAL] handlePinSubmit called with:', pin);
    if (pendingPinCallback.value) {
        pendingPinCallback.value(pin);
        pendingPinCallback.value = null;
    }
}

function handlePinClose() {
    showPinModal.value = false;
    pendingPinCallback.value = null;
}
</script>

<style scoped>
.steem-auth-account-switcher {
    margin-bottom: 1em;
    display: flex;
    align-items: center;
    gap: 0.5em;
}

.steem-auth-button-danger {
    background: #e53e3e;
    color: #fff;
}

.steem-auth-dropdown-wrapper {
    position: relative;
    display: inline-block;
}

.steem-auth-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-width: 180px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    z-index: 1000;
    padding: 0.5em 0;
}

.steem-auth-dropdown-current {
    padding: 0.5em 1em;
    font-size: 0.95em;
    color: #333;
    border-bottom: 1px solid #eee;
}

.steem-auth-dropdown-list {
    max-height: 180px;
    overflow-y: auto;
}

.steem-auth-dropdown-item {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 0.5em 1em;
    font-size: 1em;
    cursor: pointer;
    color: #333;
    transition: background 0.15s;
}

.steem-auth-dropdown-item:disabled {
    color: #aaa;
    cursor: not-allowed;
}

.steem-auth-dropdown-item:not(:disabled):hover {
    background: #f5f5f5;
}

.steem-auth-dropdown-divider {
    border-top: 1px solid #eee;
    margin: 0.5em 0;
}

.steem-auth-add-account-heading {
    margin-bottom: 1em;
    text-align: left;
}

.steem-auth-current-account-msg {
    font-size: 0.98em;
    color: #444;
    margin-bottom: 0.25em;
}

.steem-auth-button {
    min-width: 160px;
    max-width: 220px;
    width: 180px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
}
</style> 