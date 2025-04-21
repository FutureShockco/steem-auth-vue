import client from "@/helpers/client";
import steemlogin from "@/helpers/steemlogin";
import EncryptionService from "@/services/encryption"
import type { ITransaction } from "@/interfaces";
import { PrivateKey } from "dsteem";
import { useAuthStore } from '@/stores/auth';

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

const authStore = useAuthStore();

class TransactionService {
    public async send(trx: string, payload: any, options: { requiredAuth?: 'posting' | 'active' | 'owner', activeKey?: string } = {}) {
        return new Promise<ITransaction>(async (resolve, reject) => {
            const transaction = {
                operations: [
                    [
                        trx,
                        payload
                    ]
                ]
            }
            console.log('Sending transaction with options:', options);
            console.log('Transaction payload:', payload);

            if (authStore.loginAuth === 'keychain' && window.steem_keychain) {
                const keyType = options.requiredAuth === 'active' ? 'Active' : 
                              options.requiredAuth === 'owner' ? 'Owner' : 'Posting';
                
                window.steem_keychain.requestBroadcast(
                    authStore.username,
                    transaction.operations,
                    keyType,
                    (response: any) => {
                        console.log(response);
                        resolve(response);
                    }
                );
            }
            else if (authStore.loginAuth === 'steemlogin') {
                try {
                    const result = await steemlogin.broadcast(transaction.operations);
                    console.log('Transaction broadcasted:', result);
                    resolve(result);
                } catch (error: any) {
                    console.error('Error broadcasting transaction:', error);
                    if (error.error === 'invalid_scope') {
                        // Construct the SteemLogin sign URL
                        const baseUrl = 'https://steemlogin.com/sign/';
                        const params = new URLSearchParams();
                        
                        // Add all payload fields as URL parameters
                        Object.entries(payload).forEach(([key, value]) => {
                            if (value !== undefined && value !== null) {
                                params.append(key, String(value));
                            }
                        });
                        
                        // Open the sign URL in a new window
                        const signUrl = `${baseUrl}${trx}?${params.toString()}`;
                        window.open(signUrl, '_blank');
                        reject(new Error('Please sign the transaction in the new window'));
                        return;
                    }
                    reject(error);
                }
            }
            else {
                try {
                    let privateKey: string;
                    if (options.requiredAuth === 'active' && options.activeKey) {
                        privateKey = options.activeKey;
                    } else {
                        privateKey = await EncryptionService.decryptPrivateKey();
                    }
                    
                    try {
                        const result = await client.broadcast.sendOperations(
                            transaction.operations as [],
                            PrivateKey.fromString(privateKey)
                        );
                        console.log('Transaction sent:', result);
                        resolve(result as ITransaction);
                    } catch (error: any) {
                        console.error('Error sending transaction:', error);
                        // For active key operations, we want to propagate the error with more details
                        if (options.requiredAuth === 'active' && options.activeKey) {
                            if (error.message.includes('missing required active authority')) {
                                reject(new Error('Invalid active key or insufficient authority'));
                            } else if (error.message.includes('does not have sufficient funds')) {
                                reject(new Error(error.message));
                            } else {
                                reject(error);
                            }
                        } else {
                            reject(error);
                        }
                    }
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
}

export default new TransactionService();
