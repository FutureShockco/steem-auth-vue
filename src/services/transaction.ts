import { getSteemLoginClient } from '../helpers/steemlogin';
import client from '../helpers/client';
import { EncryptionService } from "@/services/encryption";
import type { ITransaction } from "@/interfaces";
import { PrivateKey } from "dsteem";
import { useAuthStore } from '@/stores/auth';
import { useTransactionStore } from '@/stores/transaction';

declare global {
    interface Window {
        steem_keychain: {
            requestBroadcast: (
                username: string,
                operations: any[],
                keyType: string,
                callback: (response: any) => void
            ) => void;
            requestSignBuffer: (
                username: string,
                message: string,
                keyType: string,
                callback: (response: { success: boolean; result: string; message: string }) => void
            ) => void;
        };
    }
}

let pinRequestHandler: ((username: string, callback: (pin: string) => void) => void) | null = null;
let activeKeyRequestHandler: ((username: string, operationType: string, payload: any, callback: (activeKey: string) => void) => void) | null = null;

export const setPinRequestHandler = (handler: (username: string, callback: (pin: string) => void) => void) => {
    pinRequestHandler = handler;
};

export const setActiveKeyRequestHandler = (handler: (username: string, operationType: string, payload: any, callback: (activeKey: string) => void) => void) => {
    activeKeyRequestHandler = handler;
};

/**
 * Transaction hook callback signature
 * @param txId - The transaction ID from the blockchain
 * @param operation - The operation type (e.g., 'custom_json', 'transfer')
 * @param params - The operation parameters
 * @param options - Additional options passed to send()
 */
export type TransactionHookCallback = (
    txId: string,
    operation: string,
    params: any,
    options?: any
) => void;

class TransactionService {
    /**
     * Global transaction hooks that get called whenever a transaction is sent
     * Allows external apps to track all transactions without modifying code
     */
    private static transactionHooks: Array<TransactionHookCallback> = [];

    /**
     * Register a global transaction hook
     * The callback will be invoked for every transaction sent via TransactionService
     * 
     * @param callback - Function to call when transactions are sent
     * @returns Cleanup function to unregister the hook
     * 
     * @example
     * ```typescript
     * const unregister = TransactionService.registerTransactionHook((txId, operation, params) => {
     *   console.log('Transaction sent:', txId, operation)
     *   // Track transaction, show notification, etc.
     * })
     * 
     * // Later, to stop listening:
     * unregister()
     * ```
     */
    static registerTransactionHook(callback: TransactionHookCallback): () => void {
        if (typeof callback !== 'function') {
            throw new TypeError('Transaction hook must be a function');
        }
        
        this.transactionHooks.push(callback);
        console.log(`[TransactionService] Hook registered (${this.transactionHooks.length} active)`);
        
        // Return unregister function
        return () => this.unregisterTransactionHook(callback);
    }

    /**
     * Unregister a transaction hook
     * 
     * @param callback - The callback function to remove
     */
    static unregisterTransactionHook(callback: TransactionHookCallback): void {
        const initialLength = this.transactionHooks.length;
        this.transactionHooks = this.transactionHooks.filter(hook => hook !== callback);
        
        if (this.transactionHooks.length < initialLength) {
            console.log(`[TransactionService] Hook unregistered (${this.transactionHooks.length} active)`);
        }
    }

    /**
     * Clear all transaction hooks
     * Useful for testing or cleanup
     */
    static clearTransactionHooks(): void {
        const count = this.transactionHooks.length;
        this.transactionHooks = [];
        console.log(`[TransactionService] Cleared ${count} hook(s)`);
    }

    /**
     * Get the number of active transaction hooks
     */
    static getHookCount(): number {
        return this.transactionHooks.length;
    }
    public async send(trx: string, payload: any, options: { requiredAuth?: 'posting' | 'active' | 'owner', activeKey?: string } = {}) {
        const authStore = useAuthStore();
        const transactionStore = useTransactionStore();
        const username = authStore.state.username;

        if (!username) {
            const errMsg = 'User is not authenticated.';
            transactionStore.finishTransaction(false, undefined, undefined, errMsg);
            return Promise.reject(new Error(errMsg));
        }

        // Build the full transaction
        const transaction = [
            [trx, payload]
        ];

        transactionStore.startTransaction(trx, payload);

        return new Promise<ITransaction>((resolve, reject) => {
            if (options.activeKey) {
                this._sendWithKey(trx, transaction, options.activeKey, resolve, reject);
            } else if (authStore.loginAuth === 'keychain') {
                this._sendWithKeychain(trx, transaction, username, options, resolve, reject);
            } else if (authStore.loginAuth === 'steemlogin') {
                this._sendWithSteemLogin(trx, transaction, resolve, reject);
            } else if (authStore.loginAuth === 'steem') { // Direct key login
                // Check if this requires active/owner key
                if (options.requiredAuth === 'active' || options.requiredAuth === 'owner') {
                    // For active/owner operations, request active key directly
                    if (!activeKeyRequestHandler) {
                        const errMsg = "Active key request handler not set for active/owner operations.";
                        transactionStore.finishTransaction(false, undefined, undefined, errMsg);
                        return reject(new Error(errMsg));
                    }
                    activeKeyRequestHandler(username, trx, payload, (activeKey: string) => {
                        this._sendWithKey(trx, transaction, activeKey, resolve, reject);
                    });
                } else {
                    // For posting operations, use PIN to decrypt posting key
                    if (!pinRequestHandler) {
                        const errMsg = "PIN request handler not set for direct key login.";
                        transactionStore.finishTransaction(false, undefined, undefined, errMsg);
                        return reject(new Error(errMsg));
                    }
                    const account = authStore.accounts.find(a => a.username === username && a.loginAuth === 'steem');
                    if (!account || !account.encryptedPk) {
                         const errMsg = "Encrypted posting key not found for direct login.";
                         transactionStore.finishTransaction(false, undefined, undefined, errMsg);
                         return reject(new Error(errMsg));
                    }
                    pinRequestHandler(username, async (pin) => {
                        try {
                            await EncryptionService.generatePinKey(username, pin);
                            const privateKey = await EncryptionService.decryptPrivateKey(account.encryptedPk!);
                            if (!privateKey) {
                                const errMsg = "Failed to decrypt key with PIN.";
                                transactionStore.finishTransaction(false, undefined, undefined, errMsg);
                                return reject(new Error(errMsg));
                            }
                            this._sendWithKey(trx, transaction, privateKey, resolve, reject);
                        } catch (e: any) {
                            transactionStore.finishTransaction(false, undefined, undefined, e.message || "PIN decryption or send error.");
                            reject(e);
                        }
                    });
                }
            } else {
                const errMsg = 'Unsupported login method or user not properly authenticated.';
                transactionStore.finishTransaction(false, undefined, undefined, errMsg);
                reject(new Error(errMsg));
            }
        });
    }

    /**
     * Helper method to call all registered transaction hooks
     * @private
     */
    private _callTransactionHooks(txId: string, operation: string, params: any, options?: any): void {
        const hooks = (this.constructor as typeof TransactionService).transactionHooks;
        
        if (txId && hooks.length > 0) {
            // Call hooks asynchronously to not block the return
            setImmediate(() => {
                hooks.forEach((hook, index) => {
                    try {
                        hook(txId, operation, params, options);
                    } catch (error) {
                        console.error(
                            `[TransactionService] Hook #${index} error:`, 
                            error instanceof Error ? error.message : error
                        );
                        // Don't let hook errors break the transaction flow
                    }
                });
            });
        }
    }

    private async _sendWithKeychain(trx: string, transaction: any, username: string, options: any, resolve: any, reject: any) {
        const transactionStore = useTransactionStore();
        if (typeof window !== 'undefined' && window.steem_keychain) {
            // Determine the role based on requiredAuth
            const role = options.requiredAuth === 'active' || options.requiredAuth === 'owner' ? 'Active' : 'Posting';
            
            window.steem_keychain.requestBroadcast(
                username,
                transaction,
                role,
                (response: any) => {
                    if (response.success) {
                        transactionStore.finishTransaction(true, response.result.id, `Transaction ${trx} sent via Keychain!`);
                        
                        // Call transaction hooks
                        this._callTransactionHooks(response.result.id, trx, transaction[0][1], options);
                        
                        resolve(response.result as ITransaction);
                    } else {
                        transactionStore.finishTransaction(false, undefined, undefined, response.message || 'Keychain broadcast failed.');
                        reject(new Error(response.message || 'Keychain broadcast failed'));
                    }
                }
            );
        } else {
            const errMsg = 'Steem Keychain extension not found.';
            transactionStore.finishTransaction(false, undefined, undefined, errMsg);
            reject(new Error(errMsg));
        }
    }

    private _sendWithSteemLogin(trx: string, transaction: any, resolve: any, reject: any) {
        const transactionStore = useTransactionStore();
        const steemLoginClient = getSteemLoginClient();
        if (!steemLoginClient) {
            const errMsg = 'SteemLogin client not initialized.';
            transactionStore.finishTransaction(false, undefined, undefined, errMsg);
            return reject(new Error(errMsg));
        }

        steemLoginClient.broadcast(transaction, (err: any, result: any) => {
            if (err) {
                transactionStore.finishTransaction(false, undefined, undefined, err.message || 'SteemLogin broadcast failed.');
                reject(err);
            } else {
                transactionStore.finishTransaction(true, result.id, `Transaction ${trx} sent via SteemLogin!`);
                
                // Call transaction hooks
                this._callTransactionHooks(result.id, trx, transaction[0][1], {});
                
                resolve(result as ITransaction);
            }
        });
    }

    private async _sendWithKey(trx: string, transaction: any, privateKey: string, resolve: any, reject: any) {
        const transactionStore = useTransactionStore();
        try {
            const result = await client.broadcast.sendOperations(
                transaction,
                PrivateKey.fromString(privateKey)
            );
            transactionStore.finishTransaction(
                true, 
                result.id, 
                `Transaction ${trx} completed successfully!`
            );
            
            // Call transaction hooks
            this._callTransactionHooks(result.id, trx, transaction[0][1], {});
            
            resolve(result as ITransaction);
        } catch (error: any) {
            let errorMessage = 'Failed to send transaction with key.';
            if (error.jse_info && error.jse_info.stack && error.jse_info.stack.length > 0) {
                const firstStack = error.jse_info.stack[0];
                if (firstStack.format) {
                    errorMessage = firstStack.format;
                    if (firstStack.data) {
                        errorMessage += `: ${JSON.stringify(firstStack.data)}`;
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            transactionStore.finishTransaction(false, undefined, undefined, errorMessage);
            reject(error);
        }
    }
}

// Export the class for static methods (hooks)
export { TransactionService };

// Export instance for transaction sending
export default new TransactionService();
