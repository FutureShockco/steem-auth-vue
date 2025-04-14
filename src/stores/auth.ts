import { reactive, readonly, inject, provide } from 'vue';
import sc from '../helpers/steemlogin';
import { IAccount } from '../interfaces';
import AccountService from '../services/account';

const appName = import.meta.env.VITE_APP_NAME;

interface AuthState {
    isAuthenticated: boolean;
    username: string;
    account: IAccount | null;
    loginAuth: string;
}

interface AuthStore {
    state: AuthState;
    slogin: (access_token: string) => Promise<void>;
    logout: () => void;
    handleLogin: (username: string, keychainLogin: boolean, posting_key?: string) => Promise<void>;
    checkUser: () => Promise<void>;
}

const createAuthStore = (): AuthStore => {
    const state = reactive<AuthState>({
        isAuthenticated: false,
        username: '',
        account: null,
        loginAuth: 'steem'
    });

    const slogin = async (access_token: string) => {
        if (localStorage.getItem(appName + '-access_token') || access_token) {
            const token = localStorage.getItem(appName + '-access_token') || access_token;
            sc.setAccessToken(token);
            try {
                const user = await sc.me();
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
                state.isAuthenticated = true;
                state.account = user;
                state.username = user.name;
                state.loginAuth = 'steem';
                localStorage.setItem(appName + '-login_auth', 'steem');
                localStorage.setItem(appName + '-auth_name', username);
                localStorage.setItem(appName + '-encryptedpk', posting_key);
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
                    state.loginAuth = loginAuth;
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
        checkUser
    };
};

const authStoreSymbol = Symbol('authStore');

// Create a default store instance
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