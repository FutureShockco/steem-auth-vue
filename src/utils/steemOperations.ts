// Removed: import { type OperationDefinition as BaseOperationDefinition } from './operationTypes';

// Ensure this OperationType is comprehensive for all Steem operations
export type OperationType =
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
    | 'remove_proposal'
    | 'limit_order_create'
    | 'limit_order_cancel'
    | 'feed_publish'
    // Add any other Steem operation types here to ensure the OperationDefinition is complete
    // For example, from previous context (ensure these are valid Steem operation names):
    | 'market_order_create'
    | 'market_order_cancel'
    | 'claim_reward_balance'
    | 'transfer_to_vesting'
    | 'withdraw_vesting'
    | 'price'
    | 'convert'
    | 'account_create'
    | 'account_update'
    | 'account_witness_vote'
    | 'account_witness_proxy'
    | 'pow'
    | 'custom'
    | 'comment_options'
    | 'limit_order_create2'
    | 'claim_account'
    | 'request_account_recovery'
    | 'recover_account'
    | 'change_recovery_account'
    | 'escrow_dispute'
    | 'pow2'
    | 'cancel_transfer_from_savings'
    | 'custom_binary'
    | 'decline_voting_rights'
    | 'reset_account'
    | 'set_reset_account'
    | 'claim_reward_balance2'
    | 'vote2'
    | 'smt_create'
    | 'smt_setup'
    | 'smt_setup_emissions'
    | 'smt_setup_ico_tier'
    | 'smt_set_setup_parameters'
    | 'smt_set_runtime_parameters'
    | 'smt_contribute'
    | 'fill_convert_request'
    | 'comment_reward'
    | 'liquidity_reward'
    | 'interest'
    | 'fill_vesting_withdraw'
    | 'fill_order'
    | 'fill_transfer_from_savings'
    | 'account_create_with_delegation'
    | 'witness_set_properties'
    | 'account_update2'
    | 'update_proposal_votes';

export type AuthType = 'posting' | 'active' | 'owner';

export interface FieldDefinition {
    type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'date';
    value: any; // Static default value, e.g., '', 0, false. Not from authStore.
    label: string;
    required?: boolean;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
}

export interface OperationDefinition {
    type: OperationType; // Reinstated type property
    requiredAuth: AuthType;
    fields: Record<string, FieldDefinition>;
    label: string;
    description?: string;
}

// List of all operations with their respective fields and required auths
// All field.value properties should be static defaults.
export const operations: OperationDefinition[] = [
    {
        type: 'transfer',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            amount: { type: 'string', value: '0.001 STEEM', label: 'Amount', required: true },
            memo: { type: 'string', value: '', label: 'Memo', required: false },
        },
        label: 'Transfer',
        description: 'Send STEEM or SBD to another account.'
    },
    {
        type: 'vote',
        requiredAuth: 'posting',
        fields: {
            voter: { type: 'string', value: '', label: 'Voter', required: true },
            author: { type: 'string', value: '', label: 'Author', required: true },
            permlink: { type: 'string', value: '', label: 'Permlink', required: true },
            weight: { type: 'number', value: 10000, label: 'Weight', required: true },
        },
        label: 'Vote',
        description: 'Cast a vote on a post or comment.'
    },
    {
        type: 'comment',
        requiredAuth: 'posting',
        fields: {
            parent_author: { type: 'string', value: '', label: 'Parent Author', required: false }, // Static default
            parent_permlink: { type: 'string', value: '', label: 'Parent Permlink', required: false }, // Static default
            author: { type: 'string', value: '', label: 'Author', required: true }, // Static default, will be filled by component
            permlink: { type: 'string', value: '', label: 'Permlink', required: true }, // Component might generate this or require user input
            title: { type: 'string', value: '', label: 'Title', required: false },
            body: { type: 'string', value: '', label: 'Body', required: true },
            json_metadata: { type: 'string', value: '{}', label: 'JSON Metadata', required: false },
        },
        label: 'Comment',
        description: 'Create a new post or comment.'
    },
    {
        type: 'delete_comment',
        requiredAuth: 'posting',
        fields: {
            author: { type: 'string', value: '', label: 'Author', required: true },
            permlink: { type: 'string', value: '', label: 'Permlink', required: true },
        },
        label: 'Delete Comment',
        description: 'Delete an existing comment or post.'
    },
    {
        type: 'follow',
        requiredAuth: 'posting',
        fields: {
            follower: { type: 'string', value: '', label: 'Follower', required: true },
            following: { type: 'string', value: '', label: 'Following', required: true },
            what: { type: 'string', value: 'blog', label: 'What', required: false }, // 'blog', 'ignore', or empty
        },
        label: 'Follow/Unfollow',
        description: 'Follow or unfollow another account. Set \'what\' to empty string or [\'ignore\'] to unfollow/mute.'
    },
    {
        type: 'unfollow', // This is often handled by 'follow' with what: [''] or ['ignore']
        requiredAuth: 'posting',
        fields: {
            follower: { type: 'string', value: '', label: 'Follower', required: true },
            following: { type: 'string', value: '', label: 'Following', required: true },
            // 'what' is usually empty or ['ignore'] for unfollow, often part of 'follow' op
        },
        label: 'Unfollow (Legacy - use Follow)',
        description: 'Unfollow an account (typically done via the follow operation with empty \'what\').'
    },
    {
        type: 'custom_json',
        requiredAuth: 'posting', // Default, can be changed by radio button in component
        fields: {
            required_auths: { type: 'array', value: [], label: 'Required Auths', required: false },
            required_posting_auths: { type: 'array', value: [], label: 'Required Posting Auths', required: false }, // Component will populate this based on authStore.username if posting is selected
            id: { type: 'string', value: '', label: 'ID', required: true },
            json: { type: 'json', value: '{}', label: 'JSON', required: true },
        },
        label: 'Custom JSON',
        description: 'Broadcast a custom JSON operation.'
    },
    {
        type: 'transfer_to_savings',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true }, // Usually same as 'from'
            amount: { type: 'string', value: '0.001 STEEM', label: 'Amount', required: true },
            memo: { type: 'string', value: '', label: 'Memo', required: false },
        },
        label: 'Transfer to Savings',
        description: 'Transfer STEEM or SBD to savings account.'
    },
    {
        type: 'transfer_from_savings',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            request_id: { type: 'number', value: 0, label: 'Request ID', required: true }, // User needs to provide this, or auto-generate if sensible
            to: { type: 'string', value: '', label: 'To', required: true }, // Usually same as 'from'
            amount: { type: 'string', value: '0.001 STEEM', label: 'Amount', required: true },
            memo: { type: 'string', value: '', label: 'Memo', required: false },
        },
        label: 'Transfer from Savings',
        description: 'Initiate a transfer from savings. Completes in 3 days.'
    },
    {
        type: 'escrow_transfer',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            agent: { type: 'string', value: '', label: 'Agent', required: true },
            escrow_id: { type: 'number', value: 0, label: 'Escrow ID', required: true }, // User needs to provide a unique ID
            sbd_amount: { type: 'string', value: '0.000 SBD', label: 'SBD Amount', required: false },
            steem_amount: { type: 'string', value: '0.000 STEEM', label: 'STEEM Amount', required: false },
            fee: { type: 'string', value: '0.000 STEEM', label: 'Fee', required: true }, // Fee for the agent
            ratification_deadline: { type: 'date', value: '', label: 'Ratification Deadline', required: true },
            escrow_expiration: { type: 'date', value: '', label: 'Escrow Expiration', required: true },
            json_meta: { type: 'string', value: '{}', label: 'JSON Metadata', required: false },
        },
        label: 'Escrow Transfer',
        description: 'Create an escrow transaction.'
    },
    {
        type: 'escrow_release',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true }, // Party initiating release
            to: { type: 'string', value: '', label: 'To', required: true }, // Party receiving funds
            agent: { type: 'string', value: '', label: 'Agent', required: true },
            who: { type: 'string', value: '', label: 'Who', required: true }, // Account authorizing release (from, to, or agent)
            receiver: { type: 'string', value: '', label: 'Receiver', required: true }, // Actual account receiving funds
            escrow_id: { type: 'number', value: 0, label: 'Escrow ID', required: true },
            sbd_amount: { type: 'string', value: '0.000 SBD', label: 'SBD Amount', required: false },
            steem_amount: { type: 'string', value: '0.000 STEEM', label: 'STEEM Amount', required: false },
        },
        label: 'Escrow Release',
        description: 'Release funds from an escrow.'
    },
    {
        type: 'escrow_approve',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            agent: { type: 'string', value: '', label: 'Agent', required: true },
            who: { type: 'string', value: '', label: 'Who Approves', required: true }, // Account approving (from, to, or agent)
            escrow_id: { type: 'number', value: 0, label: 'Escrow ID', required: true },
            approve: { type: 'boolean', value: true, label: 'Approve', required: true },
        },
        label: 'Escrow Approve',
        description: 'Approve or disapprove an escrow transaction.'
    },
    {
        type: 'escrow_cancel', // Note: This operation might not exist; escrow_dispute is more common
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            agent: { type: 'string', value: '', label: 'Agent', required: true },
            escrow_id: { type: 'number', value: 0, label: 'Escrow ID', required: true },
            memo: { type: 'string', value: '', label: 'Memo', required: false },
        },
        label: 'Escrow Cancel (Review if op exists)',
        description: 'Cancel an escrow (check Steem docs for current op name, might be dispute).'
    },
    {
        type: 'delegate_vesting_shares',
        requiredAuth: 'active',
        fields: {
            delegator: { type: 'string', value: '', label: 'Delegator', required: true },
            delegatee: { type: 'string', value: '', label: 'Delegatee', required: true },
            vesting_shares: { type: 'string', value: '0.000000 VESTS', label: 'Vesting Shares', required: true },
        },
        label: 'Delegate Vesting Shares',
        description: 'Delegate SP to another account.'
    },
    {
        type: 'create_claimed_account',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '', label: 'Creator', required: true },
            new_account_name: { type: 'string', value: '', label: 'New Account Name', required: true },
            json_metadata: { type: 'string', value: '{}', label: 'JSON Metadata', required: false },
            owner: { type: 'json', value: '{}', label: 'Owner Authority', required: true },
            active: { type: 'json', value: '{}', label: 'Active Authority', required: true },
            posting: { type: 'json', value: '{}', label: 'Posting Authority', required: true },
            memo_key: { type: 'string', value: '', label: 'Memo Key', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
            // Removed 'fee' as it's not standard in create_claimed_account, but in account_create_with_delegation
        },
        label: 'Create Claimed Account',
        description: 'Create a new account using a previously claimed account token.'
    },
    // ... Add ALL other operation definitions here, ensuring field.value are static defaults
    // Example: limit_order_create
    {
        type: 'limit_order_create',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            orderid: { type: 'number', value: 0, label: 'Order ID', required: true }, // User defined or from client.database.getOrderBook
            amount_to_sell: { type: 'string', value: '0.000 STEEM', label: 'Amount to Sell', required: true },
            min_to_receive: { type: 'string', value: '0.000 SBD', label: 'Min to Receive', required: true },
            fill_or_kill: { type: 'boolean', value: false, label: 'Fill or Kill', required: true },
            expiration: { type: 'date', value: '', label: 'Expiration', required: false },
        },
        label: 'Limit Order Create',
        description: 'Create a limit order on the internal market.'
    }
];

// If there were helper functions here that used the top-level authStore,
// they would need to be refactored to accept the store instance or required data as arguments.
// For now, it seems this file is primarily for static operation definitions. 