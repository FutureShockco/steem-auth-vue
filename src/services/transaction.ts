import { getSteemLoginClient } from '../helpers/steemlogin';
import client from '../helpers/client';
import EncryptionService from "@/services/encryption"
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

const authStore = useAuthStore();
const transactionStore = useTransactionStore();

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

            const steemlogin = getSteemLoginClient();

            if (authStore.loginAuth === 'keychain' && window.steem_keychain) {
                const keyType = options.requiredAuth === 'active' ? 'Active' : 
                              options.requiredAuth === 'owner' ? 'Owner' : 'Posting';
                              transactionStore.clearResults(trx);

                // Start transaction with pending state
                transactionStore.startTransaction(trx, 'Transaction sent to Keychain for signing. Please check your Keychain extension.');
                // Clear any previous results for this operation type
                
                window.steem_keychain.requestBroadcast(
                    authStore.username,
                    transaction.operations,
                    keyType,
                    (response: any) => {
                        console.log('Keychain response:', response);
                        if (response.success) {
                            transactionStore.finishTransaction(
                                true, 
                                response.result.id, 
                                `Transaction ${trx} completed successfully!`
                            );
                            resolve(response);
                        } else {
                            // Check for specific rejection message
                            if (response.message && response.message.includes('ignored')) {
                                transactionStore.finishTransaction(
                                    false, 
                                    '', 
                                    '', 
                                    'User rejected this transaction in Keychain'
                                );
                            } else {
                                transactionStore.finishTransaction(
                                    false, 
                                    '', 
                                    '', 
                                    response.message || 'Transaction failed'
                                );
                            }
                            reject(new Error(response.message || 'Transaction failed'));
                        }
                    }
                );
            }
            else if (authStore.loginAuth === 'steemlogin') {
                try {
                    // Start transaction with pending state
                    transactionStore.startTransaction(trx, 'Transaction sent to SteemLogin. Please check the popup window.');
                    // Clear any previous results for this operation type
                    transactionStore.clearResults(trx);
                    
                    // For active key operations, directly use the sign URL approach
                    if (options.requiredAuth === 'active') {
                        console.log('SteemLogin with active key operation - opening sign URL');
                        const signUrl = steemlogin.openSteemLoginSignUrl(trx, payload);
                        console.log('Opened SteemLogin sign URL:', signUrl);
                        transactionStore.finishTransaction(
                            false, 
                            '', 
                            '', 
                            'Please sign the transaction in the new window'
                        );
                        reject(new Error('Please sign the transaction in the new window'));
                        return;
                    }

                    // For posting key operations, try the standard broadcast
                    const result = await steemlogin.broadcast(transaction.operations);
                    console.log('Transaction broadcasted:', result);
                    transactionStore.finishTransaction(
                        true, 
                        result.id, 
                        `Transaction ${trx} completed successfully!`
                    );
                    resolve(result);
                } catch (error: any) {
                    console.error('Error broadcasting transaction:', error);
                    if (error.error === 'invalid_scope') {
                        // Construct the SteemLogin sign URL
                        const signUrl = steemlogin.openSteemLoginSignUrl(trx, payload);
                        console.log('Opened SteemLogin sign URL after error:', signUrl);
                        transactionStore.finishTransaction(
                            false, 
                            '', 
                            '', 
                            'Please sign the transaction in the new window'
                        );
                        reject(new Error('Please sign the transaction in the new window'));
                        return;
                    }
                    transactionStore.finishTransaction(
                        false, 
                        '', 
                        '', 
                        error instanceof Error ? error.message : 'Transaction failed'
                    );
                    reject(error);
                }
            }
            else {
                try {
                    // Start transaction with pending state
                    transactionStore.startTransaction(trx, 'Processing transaction...');
                    // Clear any previous results for this operation type
                    transactionStore.clearResults(trx);
                    
                    let privateKey: string;
                    if (options.requiredAuth === 'active' && options.activeKey) {
                        console.log('Using provided active key for transaction');
                        privateKey = options.activeKey;
                    } else {
                        console.log('Using stored key for transaction');
                        privateKey = await EncryptionService.decryptPrivateKey();
                    }
                    
                    try {
                        console.log('Sending transaction operation:', trx);
                        console.log('With auth type:', options.requiredAuth);
                        
                        // For debugging, derive and log the public key
                        if (options.requiredAuth === 'active') {
                            try {
                                const key = PrivateKey.fromString(privateKey);
                                const publicKey = key.createPublic().toString();
                                console.log('Public key derived from provided private key:', publicKey);
                            } catch (keyErr) {
                                console.error('Error deriving public key:', keyErr);
                            }
                        }
                        
                        // Use the dsteem client for direct Steem authentication
                        const result = await client.broadcast.sendOperations(
                            transaction.operations as [],
                            PrivateKey.fromString(privateKey)
                        );
                        console.log('Transaction sent successfully:', result);
                        transactionStore.finishTransaction(
                            true, 
                            result.id, 
                            `Transaction ${trx} completed successfully!`
                        );
                        resolve(result as ITransaction);
                    } catch (error: any) {
                        console.error('Error sending transaction:', error);
                        // For active key operations, we want to propagate the error with more details
                        if (options.requiredAuth === 'active' && options.activeKey) {
                            if (error.message.includes('missing required active authority')) {
                                console.error('Active authority validation failed. Transaction payload:', payload);
                                transactionStore.finishTransaction(
                                    false, 
                                    '', 
                                    '', 
                                    'Invalid active key or insufficient authority. The blockchain rejected your active key.'
                                );
                                reject(new Error('Invalid active key or insufficient authority. The blockchain rejected your active key.'));
                            } else if (error.message.includes('does not have sufficient funds')) {
                                transactionStore.finishTransaction(
                                    false, 
                                    '', 
                                    '', 
                                    error.message
                                );
                                reject(new Error(error.message));
                            } else {
                                transactionStore.finishTransaction(
                                    false, 
                                    '', 
                                    '', 
                                    error.message
                                );
                                reject(error);
                            }
                        } else {
                            transactionStore.finishTransaction(
                                false, 
                                '', 
                                '', 
                                error instanceof Error ? error.message : 'Transaction failed'
                            );
                            reject(error);
                        }
                    }
                } catch (error) {
                    transactionStore.finishTransaction(
                        false, 
                        '', 
                        '', 
                        error instanceof Error ? error.message : 'Transaction failed'
                    );
                    reject(error);
                }
            }
        });
    }
}

export default new TransactionService();
