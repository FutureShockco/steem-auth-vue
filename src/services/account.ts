import client from '@/helpers/client';

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