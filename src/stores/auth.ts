import { reactive, readonly, inject, provide } from 'vue';
import { getSteemLoginClient } from '../helpers/steemlogin';
import { IAccount } from '../interfaces';
import AccountService from '../services/account';
import client from '../helpers/client';
import { PrivateKey } from 'dsteem';
import { EncryptionService } from '../services/encryption';

interface StoredAccount {
    username: string;
    loginAuth: 'steem' | 'keychain' | 'steemlogin';
    accessToken?: string;
    encryptedPk?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    username: string;
    account: IAccount | null;
    loginAuth: 'steem' | 'keychain' | 'steemlogin';
    appName: string;
    callbackURL: string;
    accounts: StoredAccount[];
}

interface AuthStore {
    state: AuthState;
    slogin: (access_token: string) => Promise<void>;
    logout: () => void;
    handleLogin: (username: string, keychainLogin: boolean, posting_key?: string, pin?: string) => Promise<void>;
    checkUser: () => Promise<void>;
    validatePostingKey: (username: string, postingKey: string) => Promise<boolean>;
    setConfig: (appName: string, callbackURL: string) => void;
    addAccount: (account: StoredAccount) => void;
    removeAccount: (username: string) => void;
    switchAccount: (username: string) => Promise<void>;
    get username(): string;
    get loginAuth(): 'steem' | 'keychain' | 'steemlogin';
    get accounts(): StoredAccount[];
}

const createAuthStore = (): AuthStore => {
    const state = reactive<AuthState>({
        isAuthenticated: false,
        username: '',
        account: null,
        loginAuth: 'steem',
        appName: import.meta.env.VITE_APP_NAME || '',
        callbackURL: import.meta.env.VITE_CALLBACK_URL || '',
        accounts: []
    });

    const validatePostingKey = async (username: string, postingKey: string): Promise<boolean> => {
        try {
            const accounts = await client.database.getAccounts([username]);
            if (!accounts || accounts.length === 0) {
                throw new Error('Account not found');
            }

            const account = accounts[0];
            const accountPostingKey = account.posting.key_auths[0][0];

            const privateKey = PrivateKey.fromString(postingKey);
            const derivedPublicKey = privateKey.createPublic().toString();

            return accountPostingKey === derivedPublicKey;
        } catch (error) {
            console.error('Posting key validation error:', error);
            return false;
        }
    };

    const slogin = async (access_token: string) => {
        if (localStorage.getItem(state.appName + '-access_token') || access_token) {
            const token = localStorage.getItem(state.appName + '-access_token') || access_token;
            const client = getSteemLoginClient();
            client.setAccessToken(token);
            try {
                const user = await client.me();
                state.isAuthenticated = true;
                state.loginAuth = 'steemlogin';
                state.account = user.account;
                state.username = user.name;
                localStorage.setItem(state.appName + '-access_token', access_token);
                localStorage.setItem(state.appName + '-login_auth', 'steemlogin');
                localStorage.setItem(state.appName + '-auth_name', state.username);
                addAccount({ username: user.name, loginAuth: 'steemlogin', accessToken: access_token });
            } catch (error) {
                console.error('SteemLogin error:', error);
                localStorage.removeItem('access_token');
            }
        } else {
            localStorage.removeItem('access_token');
            console.log('no access token or expired');
        }
    };

    const logout = () => {
        state.isAuthenticated = false;
        state.username = '';
        state.account = null;
        state.loginAuth = 'steem';
        localStorage.removeItem(state.appName + '-login_auth');
        localStorage.removeItem(state.appName + '-access_token');
        localStorage.removeItem(state.appName + '-auth_name');
        localStorage.removeItem(state.appName + '-encryptedpk');
    };

    const handleLogin = async (username: string, keychainLogin: boolean, posting_key?: string, pin?: string) => {
        try {
            const user = await AccountService.find(username) as unknown as IAccount;

            if (keychainLogin) {
                localStorage.setItem(state.appName + '-login_auth', 'keychain');
                try {
                    //@ts-ignore
                    window.steem_keychain.requestSignBuffer(
                        username,
                        'hello',
                        'Posting',
                        (response: { success: any; result: any; message: any; }) => {
                            if (response.success) {
                                localStorage.setItem(state.appName + '-login_auth', 'keychain');
                                localStorage.setItem(state.appName + '-auth_name', username);
                                state.isAuthenticated = true;
                                state.loginAuth = 'keychain';
                                state.account = user;
                                state.username = user.name;
                                addAccount({ username, loginAuth: 'keychain' });
                                checkUser();
                            } else {
                                console.log("Signing failed:", response.message);
                                throw new Error(response.message || "Keychain signing failed");
                            }
                        }
                    );
                    // Return immediately after sending the request
                    return;
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            } else {
                if (!posting_key) {
                    throw new Error('Posting key is required when not using Keychain');
                }

                const isValid = await validatePostingKey(username, posting_key);
                if (!isValid) {
                    throw new Error('Invalid posting key');
                }

                // Generate encryption key using username and PIN
                await EncryptionService.generatePinKey(username, pin!);
                const encryptedPk = await EncryptionService.encryptAndReturnPrivateKey(posting_key);
                if (!encryptedPk) {
                    throw new Error('Failed to encrypt posting key.');
                }

                state.isAuthenticated = true;
                state.account = user;
                state.username = user.name;
                state.loginAuth = 'steem';
                localStorage.setItem(state.appName + '-login_auth', 'steem');
                localStorage.setItem(state.appName + '-auth_name', username);
                addAccount({ username, loginAuth: 'steem', encryptedPk });
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const checkUser = async () => {
        loadAccounts();
        const loginAuth = localStorage.getItem(state.appName + '-login_auth');
        const username = localStorage.getItem(state.appName + '-auth_name') || '';
        if (loginAuth && username) {
            await switchAccount(username);
        }
    };

    const setConfig = (appName: string, callbackURL: string) => {
        state.appName = appName;
        state.callbackURL = callbackURL;
    };

    const persistAccounts = () => {
        localStorage.setItem(state.appName + '-accounts', JSON.stringify(state.accounts));
    };

    const loadAccounts = () => {
        const raw = localStorage.getItem(state.appName + '-accounts');
        if (raw) {
            try {
                state.accounts = JSON.parse(raw);
            } catch (e) {
                state.accounts = [];
            }
        } else {
            state.accounts = [];
        }
    };

    const addAccount = (account: StoredAccount) => {
        if (!state.accounts.find(a => a.username === account.username)) {
            state.accounts.push(account);
            persistAccounts();
        }
    };

    const removeAccount = (username: string) => {
        state.accounts = state.accounts.filter(a => a.username !== username);
        persistAccounts();
    };

    const switchAccount = async (username: string) => {
        // Clear encryption key on account switch
        EncryptionService.setEncryptionKey(null);
        const accountMeta = state.accounts.find(a => a.username === username);
        if (!accountMeta) return;
        state.loginAuth = accountMeta.loginAuth;
        state.username = accountMeta.username;
        if (accountMeta.loginAuth === 'steemlogin' && accountMeta.accessToken) {
            await slogin(accountMeta.accessToken);
        } else {
            const user = await AccountService.find(username) as unknown as IAccount;
            state.account = user;
            state.isAuthenticated = true;
        }
        localStorage.setItem(state.appName + '-auth_name', username);
        localStorage.setItem(state.appName + '-login_auth', accountMeta.loginAuth);
    };

    return {
        state: readonly(state) as AuthState,
        slogin,
        logout,
        handleLogin,
        checkUser,
        validatePostingKey,
        setConfig,
        addAccount,
        removeAccount,
        switchAccount,
        get username() {
            return state.username;
        },
        get loginAuth() {
            return state.loginAuth;
        },
        get accounts() {
            return state.accounts;
        }
    };
};

const authStoreSymbol = Symbol('authStore');

const defaultStore = createAuthStore();

/**
 * Call this function ONLY from inside a component's setup() or a composable called from setup().
 * Do NOT call at the top level of a module or in main.ts.
 */
export const provideAuthStore = () => {
    const store = createAuthStore();
    provide(authStoreSymbol, store);
    return store;
};

export const useAuthStore = () => {
    const store = inject<AuthStore>(authStoreSymbol);
    return store || defaultStore;
};

export type { AuthStore }; 