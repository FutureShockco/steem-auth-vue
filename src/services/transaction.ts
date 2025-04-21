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
                    
                    client.broadcast.sendOperations(
                        transaction.operations as [],
                        PrivateKey.fromString(privateKey)
                    )
                        .then((result) => {
                            console.log('Transaction sent:', result);
                            resolve(result as ITransaction);
                        })
                        .catch((error: any) => {
                            console.error('Error sending transaction:', error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    public async sendWithActiveKey(trx: string, payload: any, activeKey: string) {
        return new Promise<ITransaction>(async (resolve, reject) => {
            const transaction = {
                operations: [
                    [
                        trx,
                        payload
                    ]
                ]
            }

            try {
                // Use the provided active key directly
                client.broadcast.sendOperations(
                    transaction.operations as [],
                    PrivateKey.fromString(activeKey)
                )
                    .then((result) => {
                        console.log('Transaction sent with active key:', result);
                        resolve(result as ITransaction);
                    })
                    .catch((error: any) => {
                        console.error('Error sending transaction with active key:', error);
                        reject(error);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default new TransactionService();
