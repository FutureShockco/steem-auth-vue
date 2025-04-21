import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

type OperationType =
    | 'transfer'
    | 'vote'
    | 'comment'
    | 'delete_comment'
    | 'follow'
    | 'unfollow'
    | 'custom_json'
    | 'transfer_to_savings'
    | 'transfer_from_savings'
    | 'escrow_transfer'
    | 'escrow_release'
    | 'escrow_approve'
    | 'escrow_cancel'
    | 'delegate_vesting_shares'
    | 'set_withdraw_vesting_route'
    | 'witness_update'
    | 'create_claimed_account'
    | 'create_proposal'
    | 'update_proposal'
    | 'remove_proposal';

type AuthType = 'posting' | 'active' | 'owner';

interface FieldDefinition {
    type: 'string' | 'number' | 'boolean'| 'date';
    value: string | number | boolean;
}

export interface OperationDefinition {
    type: OperationType;
    requiredAuth: AuthType;
    fields: {
        [key: string]: FieldDefinition;
    };
}

// List of all operations with their respective fields and required auths
export const operations: OperationDefinition[] = [
    {
        type: 'transfer',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: 'futureshock' },
            amount: { type: 'string', value: '0.001 STEEM' },
            memo: { type: 'string', value: '' },
        },
    },
    {
        type: 'vote',
        requiredAuth: 'posting',
        fields: {
            voter: { type: 'string', value: '' },
            author: { type: 'string', value: '' },
            permlink: { type: 'string', value: '' },
            weight: { type: 'number', value: 0 },
        },
    },
    {
        type: 'comment',
        requiredAuth: 'posting',
        fields: {
            parent_author: { type: 'string', value: 'guest123' },
            parent_permlink: { type: 'string', value: '20230710t182903218z-post' },
            author: { type: 'string', value: authStore.username },
            permlink: { type: 'string', value: 'unique-permlink-' + new Date().getTime() },
            title: { type: 'string', value: '' },
            body: { type: 'string', value: 'This is a test' },
            json_metadata: { type: 'string', value: '' },
        },
    },
    {
        type: 'delete_comment',
        requiredAuth: 'posting',
        fields: {
            author: { type: 'string', value: '' },
            permlink: { type: 'string', value: '' },
        },
    },
    {
        type: 'follow',
        requiredAuth: 'posting',
        fields: {
            follower: { type: 'string', value: '' },
            following: { type: 'string', value: '' },
            what: { type: 'string', value: 'blog' },
        },
    },
    {
        type: 'unfollow',
        requiredAuth: 'posting',
        fields: {
            follower: { type: 'string', value: '' },
            following: { type: 'string', value: '' },
        },
    },
    {
        type: 'custom_json',
        requiredAuth: 'posting',
        fields: {
            requiredAuth: { type: 'string', value: '' },
            id: { type: 'string', value: '' },
            json: { type: 'string', value: '{"test": "test"}' },
        },
    },
    {
        type: 'transfer_to_savings',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            amount: { type: 'string', value: '' },
            memo: { type: 'string', value: '' },
        },
    },
    {
        type: 'transfer_from_savings',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            amount: { type: 'string', value: '' },
            memo: { type: 'string', value: '' },
        },
    },
    {
        type: 'escrow_transfer',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            agent: { type: 'string', value: '' },
            escrowId: { type: 'number', value: 0 },
            amount: { type: 'string', value: '' },
            fee: { type: 'string', value: '' },
            json: { type: 'string', value: '' },
        },
    },
    {
        type: 'escrow_release',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            agent: { type: 'string', value: '' },
            escrowId: { type: 'number', value: 0 },
            memo: { type: 'string', value: '' },
        },
    },
    {
        type: 'escrow_approve',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            agent: { type: 'string', value: '' },
            escrowId: { type: 'number', value: 0 },
            approve: { type: 'boolean', value: false },
        },
    },
    {
        type: 'escrow_cancel',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            agent: { type: 'string', value: '' },
            escrowId: { type: 'number', value: 0 },
            memo: { type: 'string', value: '' },
        },
    },
    {
        type: 'delegate_vesting_shares',
        requiredAuth: 'active',
        fields: {
            delegator: { type: 'string', value: '' },
            delegatee: { type: 'string', value: '' },
            vestingShares: { type: 'string', value: '' },
        },
    },
    {
        type: 'set_withdraw_vesting_route',
        requiredAuth: 'active',
        fields: {
            fromAccount: { type: 'string', value: '' },
            toAccount: { type: 'string', value: '' },
            percent: { type: 'number', value: 0 },
            autoVest: { type: 'boolean', value: false },
        },
    },
    {
        type: 'witness_update',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            url: { type: 'string', value: '' },
            blockSigningKey: { type: 'string', value: '' },
            props: { type: 'string', value: '' },
            fee: { type: 'string', value: '' },
        },
    },
    {
        type: 'create_claimed_account',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '' },
            newAccountName: { type: 'string', value: '' },
            jsonMetadata: { type: 'string', value: '' },
            fee: { type: 'string', value: '' },
        },
    },
    {
        type: 'create_proposal',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '' },
            receiver: { type: 'string', value: '' },
            startDate: { type: 'string', value: '' },
            endDate: { type: 'string', value: '' },
            dailyPay: { type: 'string', value: '' },
            subject: { type: 'string', value: '' },
            permlink: { type: 'string', value: '' },
        },
    },
    {
        type: 'update_proposal',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '' },
            proposalId: { type: 'number', value: 0 },
            dailyPay: { type: 'string', value: '' },
            subject: { type: 'string', value: '' },
            permlink: { type: 'string', value: '' },
        },
    },
    {
        type: 'remove_proposal',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '' },
            proposalId: { type: 'number', value: 0 },
        },
    },
]; 