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
    public async send(trx: string, payload: any) {
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
                window.steem_keychain.requestBroadcast(
                    authStore.username,
                    transaction.operations,
                    'Active',
                    (response: any) => {
                        console.log(response);
                        resolve(response);
                    }
                );
            }
            else if (authStore.loginAuth === 'steemlogin') {
                steemlogin.broadcast(transaction.operations)
                    .then((result: any) => {
                        console.log('Transaction broadcasted:', result);
                        resolve(result);
                    })
                    .catch((error: any) => {
                        console.error('Error broadcasting transaction:', error);
                        reject(error);
                    });
            }
            else {
                const privateKey = await EncryptionService.decryptPrivateKey();
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
            }
        });
    }
}

export default new TransactionService();
