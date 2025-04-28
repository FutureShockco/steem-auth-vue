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
    type: 'string' | 'number' | 'boolean' | 'date' | 'array';
    value: string | number | boolean | object;
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
            memo: { type: 'string', value: 'simple memo' },
        },
    },
    {
        type: 'vote',
        requiredAuth: 'posting',
        fields: {
            voter: { type: 'string', value: '' },
            author: { type: 'string', value: 'futureshock' },
            permlink: { type: 'string', value: 'sidechain-proposal-second-and-third-weeks-summary' },
            weight: { type: 'number', value: 10000 },
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
            following: { type: 'string', value: 'futureshock' },
            what: { type: 'string', value: 'blog' },
        },
    },
    {
        type: 'unfollow',
        requiredAuth: 'posting',
        fields: {
            follower: { type: 'string', value: '' },
            following: { type: 'string', value: 'futureshock' },
        },
    },
    {
        type: 'custom_json',
        requiredAuth: 'posting',
        fields: {
            required_auths: { type: 'array', value: [] },
            required_posting_auths: { type: 'array', value: [] },
            id: { type: 'string', value: 'sidechain' },
            json: { type: 'string', value: {
                contract: 'enable_node',
                payload: {
                    pub: ''
                }
            }},
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
            to: { type: 'string', value: 'futureshock' },
            agent: { type: 'string', value: 'future.witness' },
            escrow_id: { type: 'number', value: new Date().getTime() /1000 },
            sbd_amount: { type: 'string', value: '0.000 SBD' },
            steem_amount: { type: 'string', value: '0.005 STEEM' },
            fee: { type: 'string', value: '0.001 STEEM' },
            ratification_deadline: { type: 'date', value: '' },
            escrow_expiration: { type: 'date', value: '' },
            json_meta: { type: 'string', value: '{"message":"escrow for services"}' },
        },
    },
    {
        type: 'escrow_release',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            agent: { type: 'string', value: 'futureshock' },
            escrow_id: { type: 'number', value: 0 },
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
            escrow_id: { type: 'number', value: 0 },
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
            escrow_id: { type: 'number', value: 0 },
            memo: { type: 'string', value: '' },
        },
    },
    {
        type: 'delegate_vesting_shares',
        requiredAuth: 'active',
        fields: {
            delegator: { type: 'string', value: '' },
            delegatee: { type: 'string', value: '' },
            vesting_shares: { type: 'string', value: '12020.000000 VESTS' },
        },
    },
    {
        type: 'set_withdraw_vesting_route',
        requiredAuth: 'active',
        fields: {
            from_account: { type: 'string', value: '' },
            to_account: { type: 'string', value: '' },
            percent: { type: 'number', value: 0 },
            auto_vest: { type: 'boolean', value: false },
        },
    },
    {
        type: 'witness_update',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            url: { type: 'string', value: '' },
            block_signing_key: { type: 'string', value: '' },
            props: { type: 'string', value: '' },
            fee: { type: 'string', value: '' },
        },
    },
    {
        type: 'create_claimed_account',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '' },
            new_account_name: { type: 'string', value: '' },
            json_metadata: { type: 'string', value: '' },
            fee: { type: 'string', value: '' },
        },
    },
    {
        type: 'create_proposal',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '' },
            receiver: { type: 'string', value: '' },
            start_date: { type: 'string', value: '' },
            end_date: { type: 'string', value: '' },
            daily_pay: { type: 'string', value: '' },
            subject: { type: 'string', value: '' },
            permlink: { type: 'string', value: '' },
        },
    },
    {
        type: 'update_proposal',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '' },
            proposal_id: { type: 'number', value: 0 },
            daily_pay: { type: 'string', value: '' },
            subject: { type: 'string', value: '' },
            permlink: { type: 'string', value: '' },
        },
    },
    {
        type: 'remove_proposal',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '' },
            proposal_id: { type: 'number', value: 0 },
        },
    },
]; 