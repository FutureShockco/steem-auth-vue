import { Client } from 'dsteem';

const client = new Client('https://api.steemit.com');

export default class AccountService {
    static async find(username: string) {
        try {
            const account = await client.database.getAccounts([username]);
            return account[0];
        } catch (error) {
            console.error('Error fetching account:', error);
            throw error;
        }
    }
}