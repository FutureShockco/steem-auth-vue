import { Component } from 'vue';
import { IAccount } from '../interfaces';

export interface SteemAuthProps {
    appName?: string;
}

export interface SteemAuthState {
    isAuthenticated: boolean;
    username: string;
    account: IAccount | null;
    loginAuth: string;
}

export const SteemAuth: Component<SteemAuthProps>;
export const useAuthStore: () => {
    isAuthenticated: boolean;
    username: string;
    account: IAccount | null;
    loginAuth: string;
    slogin: (access_token: string) => Promise<void>;
    logout: () => void;
    handleLogin: (username: string, keychainLogin: boolean, posting_key?: string) => Promise<void>;
    checkUser: () => Promise<void>;
}; 