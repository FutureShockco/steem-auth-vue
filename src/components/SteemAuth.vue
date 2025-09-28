<template>
    <div class="steem-auth steem-auth-component">
        <div class="steem-auth-container">
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
                                        <button class="steem-auth-dropdown-item" v-for="acc in store.accounts"
                                            :key="acc.username" :disabled="acc.username === store.state.username"
                                            @click="switchAccountFromDropdown(acc.username)">
                                            {{ acc.username }} ({{ acc.loginAuth }})
                                        </button>
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
            @update:useKeychain="useKeychain = $event" @auto-login="handleAutoLogin" @modalOpen="$emit('modalOpen')"
            @modalClose="$emit('modalClose')" />

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
import { setPinRequestHandler, setActiveKeyRequestHandler } from '../services/transaction';
import { initClient } from '@/helpers/client';

const props = withDefaults(defineProps<{
    enableSteemLogin?: boolean;
    enableKeychain?: boolean;
    enableDirectLogin?: boolean;
    appName: string;
    callbackURL: string;
    steemApi?: string;
    steemApiOptions?: object;
}>(), {
    enableSteemLogin: true,
    enableKeychain: true,
    enableDirectLogin: true
});

const emit = defineEmits<{
    (e: 'modalOpen'): void;
    (e: 'modalClose'): void;
}>();

// 'emit' is only used for type inference, not called directly in this file.

// Initialize store with proper typing
const store = useAuthStore() as AuthStore;

const showModal = ref<boolean>(false);
const username = ref<string>('');
const postingKey = ref<string>('');
const useKeychain = ref<boolean>(false);
const hasKeychain = ref<boolean>(false);
const loading = ref<boolean>(false);
const error = ref<string>('');
const usernameError = ref<string>('');
const postingKeyError = ref<string>('');
const selectedAccount = ref(store.state.username);
const showDropdown = ref(false);
const addingAccount = ref(false);
const showManageAccountsModal = ref(false);
const showPinModal = ref(false);
const pinMode = ref<'set' | 'unlock'>('set');
const pendingPinCallback = ref<null | ((pin: string) => void)>(null);
const showActiveKeyModal = ref(false);
const pendingOperation = ref<ExtendedOperation | null>(null);

const isClient = ref(false);

const activeKeyPromiseResolve = ref<null | ((value: string) => void)>(null);
const activeKeyPromiseReject = ref<null | ((reason?: any) => void)>(null);

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

    // Set up active key request handler for active/owner operations
    setActiveKeyRequestHandler((username, operationType, payload, callback) => {
        console.log('[ACTIVE KEY HANDLER] Showing Active Key modal for user:', username, 'operation:', operationType, 'payload:', payload);

        // Create operation details for the modal
        const operationDetails: ExtendedOperation = {
            type: operationType,
            fields: {},
            requiredAuth: 'active',
            fieldValues: payload || {} // Use the actual payload from TransactionService
        };

        pendingOperation.value = operationDetails;
        showActiveKeyModal.value = true;

        // Set up promise handlers for when the modal completes
        activeKeyPromiseResolve.value = callback;
        activeKeyPromiseReject.value = (error) => {
            console.error('[ACTIVE KEY HANDLER] Active key request failed:', error);
            // For now, we'll just log the error since TransactionService expects a callback
            // You might want to handle this differently depending on your error handling strategy
        };
    });
});


const promptForActiveKey = (operationDetails: ExtendedOperation): Promise<string> => {
    if (store.state.loginAuth !== 'steem') {
        return Promise.reject(new Error('Active key can only be programmatically prompted for PIN-based login. For other methods like Keychain, TransactionService.send will trigger appropriate prompts if activeKey is not supplied.'));
    }
    // Ensure pendingOperation is correctly typed if it's used by ActiveKeyModal
    // Make sure pendingOperation is declared in the setup refs
    if (!pendingOperation) { // pendingOperation should be a ref
        console.error("pendingOperation ref is not defined in SteemAuth setup.");
        return Promise.reject(new Error("pendingOperation ref is not defined."));
    }
    pendingOperation.value = operationDetails;
    showActiveKeyModal.value = true;
    return new Promise<string>((resolve, reject) => {
        activeKeyPromiseResolve.value = resolve;
        activeKeyPromiseReject.value = reject;
    });
};

const handlePinSubmit = (pin: string) => {
    console.log('[PIN MODAL] handlePinSubmit called with:', pin);
    if (pendingPinCallback.value) {
        pendingPinCallback.value(pin);
        pendingPinCallback.value = null;
    }
};

const handlePinClose = () => {
    showPinModal.value = false;
    // If there's a pending PIN callback (e.g. from login) and modal is closed, reject it or handle as needed
    if (pendingPinCallback.value) {
        // Potentially, if a login attempt was pending on PIN and modal closed, signal cancellation.
        // For now, just clearing the callback. Specific error handling might be needed based on UX.
        // Consider what handleSubmit expects if pendingPinCallback is cleared without execution.
        // If loading.value was set true expecting a PIN, it should be reset.
        if (loading.value && pinMode.value === 'set' && showModal.value) { // Specifically for login flow
            // This implies login modal was open, PIN set mode, and it was closed.
            // We don't want to break existing login flow, just clear PIN stuff.
        }
        // pendingPinCallback.value = null; // Let PinModal's own submit/close logic handle this.
    }
    // If closing PIN modal was for active key request, reject its promise
    // This case should not happen if requestActiveKey is for ActiveKeyModal,
    // but good to be defensive. PinModal is separate.
};

// This is the handler for the ActiveKeyModal's @submit event
const handleActiveKeySubmit = (activeKeyFromModal: string) => {
    showActiveKeyModal.value = false;
    if (activeKeyPromiseResolve.value) {
        activeKeyPromiseResolve.value(activeKeyFromModal);
    } else {
        // This case might occur if ActiveKeyModal was shown for a different purpose
        // not tied to promptForActiveKey. For now, we assume it's for the promise.
        console.warn('[SteemAuth] handleActiveKeySubmit called without a pending promise.');
    }
    activeKeyPromiseResolve.value = null;
    activeKeyPromiseReject.value = null;
    if (pendingOperation) pendingOperation.value = null;
};

// This is the handler for the ActiveKeyModal's @close event
const closeActiveKeyModal = () => {
    showActiveKeyModal.value = false;
    if (activeKeyPromiseReject.value) {
        activeKeyPromiseReject.value(new Error('Active Key modal was closed.'));
    }
    activeKeyPromiseResolve.value = null;
    activeKeyPromiseReject.value = null;
    if (pendingOperation) pendingOperation.value = null;
};

const requestActiveKey = (operation: ExtendedOperation, callback?: (activeKey: string) => Promise<void>) => {
    console.log('[SteemAuth] requestActiveKey (slot prop) called with operation:', operation);

    if (store.loginAuth !== 'steem') {
        console.warn('[SteemAuth] requestActiveKey slot prop is primarily intended for PIN-based (steem) login. For Keychain or SteemLogin, the transaction service or client app should handle prompts.');
        // For non-PIN logins, the active key isn't typically exposed directly to the app.
        // Keychain prompts internally. SteemLogin handles it via redirect.
        // If a callback is provided, we could indicate an error or no-op.
        if (callback) {
            // callback(null, new Error('Cannot provide raw active key for non-PIN login methods.'));
            // Or simply don't call it, and let the app proceed to TransactionService.send
            // which will trigger keychain/steemlogin specific flows.
        }
        return; // Do not proceed to show ActiveKeyModal for non-PIN logins via this legacy slot prop.
    }

    // Ensure pendingOperation is defined
    if (!pendingOperation) {
        console.error("pendingOperation ref is not defined in SteemAuth setup for requestActiveKey.");
        return;
    }

    pendingOperation.value = operation;
    showActiveKeyModal.value = true;

    // This is tricky: the existing ActiveKeyModal instance in SteemAuth's template
    // is already wired to call SteemAuth's `handleActiveKeySubmit`.
    // If a callback is provided to requestActiveKey, `handleActiveKeySubmit` needs to know about it.
    // The new `promptForActiveKey` method with Promises is cleaner for programmatic use.
    // For this slot prop, we can try to use the new promise mechanism internally
    // if a callback is provided.
    if (callback) {
        promptForActiveKey(operation)
            .then(activeKey => {
                callback(activeKey);
            })
            .catch(error => {
                console.error('[SteemAuth] Error obtaining active key via slot prop:', error);
                // Optionally, call callback with an error or empty key
                // callback('', error); depends on callback signature
            });
    }
    // If no callback, it relies on the old behavior where some other part of the system
    // might be reacting to ActiveKeyModal's events or SteemAuth's state changes.
};

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