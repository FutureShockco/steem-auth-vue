import { reactive, readonly, inject, provide } from 'vue';
import { getSteemLoginClient } from '../helpers/steemlogin';
import { IAccount } from '../interfaces';
import AccountService from '../services/account';
import client from '../helpers/client';
import { PrivateKey } from 'dsteem';
import EncryptionService from '../services/encryption';

const appName = import.meta.env.VITE_APP_NAME;

interface AuthState {
    isAuthenticated: boolean;
    username: string;
    account: IAccount | null;
    loginAuth: 'steem' | 'keychain' | 'steemlogin';
}

interface AuthStore {
    state: AuthState;
    slogin: (access_token: string) => Promise<void>;
    logout: () => void;
    handleLogin: (username: string, keychainLogin: boolean, posting_key?: string) => Promise<void>;
    checkUser: () => Promise<void>;
    validatePostingKey: (username: string, postingKey: string) => Promise<boolean>;
    get username(): string;
    get loginAuth(): 'steem' | 'keychain' | 'steemlogin';
}

const createAuthStore = (): AuthStore => {
    const state = reactive<AuthState>({
        isAuthenticated: false,
        username: '',
        account: null,
        loginAuth: 'steem'
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
        if (localStorage.getItem(appName + '-access_token') || access_token) {
            const token = localStorage.getItem(appName + '-access_token') || access_token;
            const client = getSteemLoginClient();
            client.setAccessToken(token);
            try {
                const user = await client.me();
                state.isAuthenticated = true;
                state.loginAuth = 'steemlogin';
                state.account = user.account;
                state.username = user.name;
                localStorage.setItem(appName + '-access_token', access_token);
                localStorage.setItem(appName + '-login_auth', 'steemlogin');
                localStorage.setItem(appName + '-auth_name', state.username);
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
        localStorage.removeItem(appName + '-login_auth');
        localStorage.removeItem(appName + '-access_token');
        localStorage.removeItem(appName + '-auth_name');
        localStorage.removeItem(appName + '-encryptedpk');
    };

    const handleLogin = async (username: string, keychainLogin: boolean, posting_key?: string) => {
        try {
            const user = await AccountService.find(username) as unknown as IAccount;

            if (keychainLogin) {
                localStorage.setItem(appName + '-login_auth', 'keychain');
                try {
                    //@ts-ignore
                    window.steem_keychain.requestSignBuffer(
                        username,
                        'hello',
                        'Posting',
                        (response: { success: any; result: any; message: any; }) => {
                            if (response.success) {
                                localStorage.setItem(appName + '-login_auth', 'keychain');
                                localStorage.setItem(appName + '-auth_name', username);
                                state.isAuthenticated = true;
                                state.loginAuth = 'keychain';
                                state.account = user;
                                state.username = user.name;
                            } else {
                                console.log("Signing failed:", response.message);
                            }
                        }
                    );
                } catch (e) {
                    console.log(e);
                }
            } else {
                if (!posting_key) {
                    throw new Error('Posting key is required when not using Keychain');
                }

                const isValid = await validatePostingKey(username, posting_key);
                if (!isValid) {
                    throw new Error('Invalid posting key');
                }

                // Generate encryption key using username and posting key as password
                await EncryptionService.generateEncryptionKey(username, posting_key);

                // Encrypt and store the posting key
                await EncryptionService.encryptAndStorePrivateKey(posting_key);

                state.isAuthenticated = true;
                state.account = user;
                state.username = user.name;
                state.loginAuth = 'steem';
                localStorage.setItem(appName + '-login_auth', 'steem');
                localStorage.setItem(appName + '-auth_name', username);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const checkUser = async () => {
        const loginAuth = localStorage.getItem(appName + '-login_auth');
        if (loginAuth) {
            if (loginAuth === 'steemlogin') {
                const token = localStorage.getItem(appName + '-access_token') || '';
                await slogin(token);
            } else {
                const username = localStorage.getItem(appName + '-auth_name') || '';
                try {
                    const user = await AccountService.find(username) as unknown as IAccount;
                    state.isAuthenticated = true;
                    state.loginAuth = loginAuth as 'steem' | 'keychain' | 'steemlogin';
                    state.account = user;
                    state.username = username;
                } catch (error) {
                    console.error('Check user error:', error);
                    logout();
                }
            }
        }
    };

    return {
        state: readonly(state) as AuthState,
        slogin,
        logout,
        handleLogin,
        checkUser,
        validatePostingKey,
        get username() {
            return state.username;
        },
        get loginAuth() {
            return state.loginAuth;
        }
    };
};

const authStoreSymbol = Symbol('authStore');

const defaultStore = createAuthStore();

export const provideAuthStore = () => {
    const store = createAuthStore();
    provide(authStoreSymbol, store);
    return store;
};

export const useAuthStore = () => {
    const store = inject<AuthStore>(authStoreSymbol);
    return store || defaultStore;
}; 