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
    | 'remove_proposal'
    | 'limit_order_create'
    | 'limit_order_cancel'
    | 'feed_publish'
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
    | 'update_proposal_votes'
    

type AuthType = 'posting' | 'active' | 'owner';

interface FieldDefinition {
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'json';
    value: string | number | boolean | object;
    label?: string;
    required?: boolean;
}

export interface OperationDefinition {
    type: OperationType;
    requiredAuth: AuthType;
    fields: {
        [key: string]: FieldDefinition;
    };
    label: string;
    description: string;
}

// List of all operations with their respective fields and required auths
export const operations: OperationDefinition[] = [
    {
        type: 'transfer',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: 'futureshock', label: 'To', required: true },
            amount: { type: 'string', value: '0.001 STEEM', label: 'Amount', required: true },
            memo: { type: 'string', value: 'simple memo', label: 'Memo', required: false },
        },
        label: 'Transfer',
        description: 'Send STEEM or SBD to another account.'
    },
    {
        type: 'vote',
        requiredAuth: 'posting',
        fields: {
            voter: { type: 'string', value: '', label: 'Voter', required: true },
            author: { type: 'string', value: 'futureshock', label: 'Author', required: true },
            permlink: { type: 'string', value: 'sidechain-proposal-second-and-third-weeks-summary', label: 'Permlink', required: true },
            weight: { type: 'number', value: 10000, label: 'Weight', required: true },
        },
        label: 'Vote',
        description: 'Cast a vote on a post or comment.'
    },
    {
        type: 'comment',
        requiredAuth: 'posting',
        fields: {
            parent_author: { type: 'string', value: 'guest123', label: 'Parent Author', required: false },
            parent_permlink: { type: 'string', value: '20230710t182903218z-post', label: 'Parent Permlink', required: false },
            author: { type: 'string', value: authStore.username, label: 'Author', required: true },
            permlink: { type: 'string', value: 'unique-permlink-' + new Date().getTime(), label: 'Permlink', required: true },
            title: { type: 'string', value: '', label: 'Title', required: false },
            body: { type: 'string', value: 'This is a test', label: 'Body', required: true },
            json_metadata: { type: 'string', value: '', label: 'JSON Metadata', required: false },
        },
        label: 'Comment',
        description: 'Post a new comment on a post or reply to an existing comment.'
    },
    {
        type: 'delete_comment',
        requiredAuth: 'posting',
        fields: {
            author: { type: 'string', value: '', label: 'Author', required: true },
            permlink: { type: 'string', value: '', label: 'Permlink', required: true },
        },
        label: 'Delete Comment',
        description: 'Delete a comment.'
    },
    {
        type: 'follow',
        requiredAuth: 'posting',
        fields: {
            follower: { type: 'string', value: '', label: 'Follower', required: true },
            following: { type: 'string', value: 'futureshock', label: 'Following', required: true },
            what: { type: 'string', value: 'blog', label: 'What', required: false },
        },
        label: 'Follow',
        description: 'Follow a user or blog.'
    },
    {
        type: 'unfollow',
        requiredAuth: 'posting',
        fields: {
            follower: { type: 'string', value: '', label: 'Follower', required: true },
            following: { type: 'string', value: 'futureshock', label: 'Following', required: true },
        },
        label: 'Unfollow',
        description: 'Unfollow a user or blog.'
    },
    {
        type: 'custom_json',
        requiredAuth: 'posting',
        fields: {
            required_auths: { type: 'array', value: [], label: 'Required Auths', required: false },
            required_posting_auths: { type: 'array', value: [authStore.username], label: 'Required Posting Auths', required: false },
            id: { type: 'string', value: 'test', label: 'ID', required: true },
            json: { type: 'string', value: {
                app: 'future.app',
                payload: {
                    action: 'upgradeBuilding',
                    building: 'headquarters',
                    level: 2
                }
            }, label: 'JSON', required: true },
        },
        label: 'Custom JSON',
        description: 'Create a custom JSON operation.'
    },
    {
        type: 'transfer_to_savings',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            amount: { type: 'string', value: '', label: 'Amount', required: true },
            memo: { type: 'string', value: '', label: 'Memo', required: false },
        },
        label: 'Transfer to Savings',
        description: 'Transfer funds to your savings account.'
    },
    {
        type: 'transfer_from_savings',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            amount: { type: 'string', value: '', label: 'Amount', required: true },
            memo: { type: 'string', value: '', label: 'Memo', required: false },
        },
        label: 'Transfer from Savings',
        description: 'Withdraw funds from your savings account.'
    },
    {
        type: 'escrow_transfer',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: 'futureshock', label: 'To', required: true },
            agent: { type: 'string', value: 'future.witness', label: 'Agent', required: true },
            escrow_id: { type: 'number', value: new Date().getTime() /1000, label: 'Escrow ID', required: true },
            sbd_amount: { type: 'string', value: '0.000 SBD', label: 'SBD Amount', required: false },
            steem_amount: { type: 'string', value: '0.005 STEEM', label: 'STEEM Amount', required: false },
            fee: { type: 'string', value: '0.001 STEEM', label: 'Fee', required: false },
            ratification_deadline: { type: 'date', value: '', label: 'Ratification Deadline', required: false },
            escrow_expiration: { type: 'date', value: '', label: 'Escrow Expiration', required: false },
            json_meta: { type: 'string', value: '{"message":"escrow for services"}', label: 'JSON Meta', required: false },
        },
        label: 'Escrow Transfer',
        description: 'Send funds to an escrow account for conditional release.'
    },
    {
        type: 'escrow_release',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            agent: { type: 'string', value: 'futureshock', label: 'Agent', required: true },
            escrow_id: { type: 'number', value: 0, label: 'Escrow ID', required: true },
            memo: { type: 'string', value: '', label: 'Memo', required: false },
        },
        label: 'Escrow Release',
        description: 'Release funds from escrow to the recipient.'
    },
    {
        type: 'escrow_approve',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            agent: { type: 'string', value: '', label: 'Agent', required: false },
            escrow_id: { type: 'number', value: 0, label: 'Escrow ID', required: true },
            approve: { type: 'boolean', value: false, label: 'Approve', required: true },
        },
        label: 'Escrow Approve',
        description: 'Approve an escrow transaction.'
    },
    {
        type: 'escrow_cancel',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            agent: { type: 'string', value: '', label: 'Agent', required: false },
            escrow_id: { type: 'number', value: 0, label: 'Escrow ID', required: true },
            memo: { type: 'string', value: '', label: 'Memo', required: false },
        },
        label: 'Escrow Cancel',
        description: 'Cancel an escrow transaction.'
    },
    {
        type: 'delegate_vesting_shares',
        requiredAuth: 'active',
        fields: {
            delegator: { type: 'string', value: '', label: 'Delegator', required: true },
            delegatee: { type: 'string', value: '', label: 'Delegatee', required: true },
            vesting_shares: { type: 'string', value: '12020.000000 VESTS', label: 'Vesting Shares', required: true },
        },
        label: 'Delegate Vesting Shares',
        description: 'Delegate vesting shares (Steem Power) to another account.'
    },
    {
        type: 'set_withdraw_vesting_route',
        requiredAuth: 'active',
        fields: {
            from_account: { type: 'string', value: '', label: 'From Account', required: true },
            to_account: { type: 'string', value: '', label: 'To Account', required: true },
            percent: { type: 'number', value: 0, label: 'Percent', required: true },
            auto_vest: { type: 'boolean', value: false, label: 'Auto Vest', required: true },
        },
        label: 'Set Withdraw Vesting Route',
        description: 'Set up a route for vesting withdrawals to another account.'
    },
    {
        type: 'witness_update',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            url: { type: 'string', value: '', label: 'URL', required: false },
            block_signing_key: { type: 'string', value: '', label: 'Block Signing Key', required: false },
            props: { type: 'string', value: '', label: 'Props', required: false },
            fee: { type: 'string', value: '', label: 'Fee', required: false },
        },
        label: 'Witness Update',
        description: 'Update witness properties and signing key.'
    },
    {
        type: 'create_claimed_account',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '', label: 'Creator', required: true },
            new_account_name: { type: 'string', value: '', label: 'New Account Name', required: true },
            json_metadata: { type: 'string', value: '', label: 'JSON Metadata', required: false },
            fee: { type: 'string', value: '', label: 'Fee', required: false },
        },
        label: 'Create Claimed Account',
        description: 'Create a new account using a previously claimed account token.'
    },
    {
        type: 'create_proposal',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '', label: 'Creator', required: true },
            receiver: { type: 'string', value: '', label: 'Receiver', required: true },
            start_date: { type: 'string', value: '', label: 'Start Date', required: false },
            end_date: { type: 'string', value: '', label: 'End Date', required: false },
            daily_pay: { type: 'string', value: '', label: 'Daily Pay', required: false },
            subject: { type: 'string', value: '', label: 'Subject', required: false },
            permlink: { type: 'string', value: '', label: 'Permlink', required: true },
        },
        label: 'Create Proposal',
        description: 'Create a new proposal for funding from the Steem DAO.'
    },
    {
        type: 'update_proposal',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '', label: 'Creator', required: true },
            proposal_id: { type: 'number', value: 0, label: 'Proposal ID', required: true },
            daily_pay: { type: 'string', value: '', label: 'Daily Pay', required: false },
            subject: { type: 'string', value: '', label: 'Subject', required: false },
            permlink: { type: 'string', value: '', label: 'Permlink', required: true },
        },
        label: 'Update Proposal',
        description: 'Update an existing proposal.'
    },
    {
        type: 'remove_proposal',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '', label: 'Creator', required: true },
            proposal_id: { type: 'number', value: 0, label: 'Proposal ID', required: true },
        },
        label: 'Remove Proposal',
        description: 'Remove a proposal from the Steem DAO.'
    },
    {
        type: 'limit_order_create',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            orderid: { type: 'number', value: 0, label: 'Order ID', required: true },
            amount_to_sell: { type: 'string', value: '', label: 'Amount to Sell', required: true },
            min_to_receive: { type: 'string', value: '', label: 'Min to Receive', required: true },
            fill_or_kill: { type: 'boolean', value: false, label: 'Fill or Kill', required: true },
            expiration: { type: 'date', value: '', label: 'Expiration', required: false },
        },
        label: 'Limit Order Create',
        description: 'Create a limit order on the internal market.'
    },
    {
        type: 'limit_order_cancel',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            orderid: { type: 'number', value: 0, label: 'Order ID', required: true },
        },
        label: 'Limit Order Cancel',
        description: 'Cancel an existing limit order.'
    },
    {
        type: 'transfer_to_vesting',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            amount: { type: 'string', value: '', label: 'Amount', required: true }
        },
        label: 'Transfer to Vesting',
        description: 'Convert STEEM to Steem Power (vesting).'
    },
    {
        type: 'withdraw_vesting',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '', label: 'Account', required: true },
            vesting_shares: { type: 'string', value: '', label: 'Vesting Shares', required: true }
        },
        label: 'Withdraw Vesting',
        description: 'Withdraw Steem Power (vesting shares) to liquid STEEM.'
    },
    {
        type: 'price',
        requiredAuth: 'active',
        fields: {
            base: { type: 'string', value: '', label: 'Base', required: true },
            quote: { type: 'string', value: '', label: 'Quote', required: true }
        },
        label: 'Price',
        description: 'Set the price for a market operation.'
    },
    {
        type: 'feed_publish',
        requiredAuth: 'active',
        fields: {
            publisher: { type: 'string', value: '', label: 'Publisher', required: true },
            exchange_rate: { type: 'string', value: '', label: 'Exchange Rate', required: true }
        },
        label: 'Feed Publish',
        description: 'Publish a price feed for the market.'
    },
    {
        type: 'convert',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            requestid: { type: 'number', value: 0, label: 'Request ID', required: true },
            amount: { type: 'string', value: '', label: 'Amount', required: true }
        },
        label: 'Convert',
        description: 'Convert SBD to STEEM or vice versa.'
    },
    {
        type: 'account_create',
        requiredAuth: 'active',
        fields: {
            fee: { type: 'string', value: '', label: 'Fee', required: true },
            creator: { type: 'string', value: '', label: 'Creator', required: true },
            new_account_name: { type: 'string', value: '', label: 'New Account Name', required: true },
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            active: { type: 'string', value: '', label: 'Active', required: true },
            posting: { type: 'string', value: '', label: 'Posting', required: true },
            memo_key: { type: 'string', value: '', label: 'Memo Key', required: true },
            json_metadata: { type: 'string', value: '', label: 'JSON Metadata', required: false }
        },
        label: 'Account Create',
        description: 'Create a new Steem account.'
    },
    {
        type: 'account_update',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '', label: 'Account', required: true },
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            active: { type: 'string', value: '', label: 'Active', required: true },
            posting: { type: 'string', value: '', label: 'Posting', required: true },
            memo_key: { type: 'string', value: '', label: 'Memo Key', required: true },
            json_metadata: { type: 'string', value: '', label: 'JSON Metadata', required: false }
        },
        label: 'Account Update',
        description: 'Update account authorities and metadata.'
    },
    {
        type: 'account_witness_vote',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '', label: 'Account', required: true },
            witness: { type: 'string', value: '', label: 'Witness', required: true },
            approve: { type: 'boolean', value: false, label: 'Approve', required: true }
        },
        label: 'Account Witness Vote',
        description: 'Vote for or against a witness.'
    },
    {
        type: 'account_witness_proxy',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '', label: 'Account', required: true },
            proxy: { type: 'string', value: '', label: 'Proxy', required: true }
        },
        label: 'Account Witness Proxy',
        description: 'Delegate witness voting power to another account.'
    },
    {
        type: 'pow',
        requiredAuth: 'active',
        fields: {
            worker: { type: 'string', value: '', label: 'Worker', required: true },
            input: { type: 'string', value: '', label: 'Input', required: true },
            signature: { type: 'string', value: '', label: 'Signature', required: true },
            work: { type: 'string', value: '', label: 'Work', required: true }
        },
        label: 'Proof of Work',
        description: 'Submit a proof of work for mining.'
    },
    {
        type: 'custom',
        requiredAuth: 'active',
        fields: {
            required_auths: { type: 'array', value: [], label: 'Required Auths', required: false },
            id: { type: 'string', value: '', label: 'ID', required: true },
            data: { type: 'string', value: '', label: 'Data', required: false }
        },
        label: 'Custom',
        description: 'Broadcast a custom operation.'
    },
    {
        type: 'comment_options',
        requiredAuth: 'posting',
        fields: {
            author: { type: 'string', value: '', label: 'Author', required: true },
            permlink: { type: 'string', value: '', label: 'Permlink', required: true },
            max_accepted_payout: { type: 'string', value: '', label: 'Max Accepted Payout', required: false },
            percent_steem_dollars: { type: 'number', value: 0, label: 'Percent STEEM Dollars', required: false },
            allow_votes: { type: 'boolean', value: true, label: 'Allow Votes', required: true },
            allow_curation_rewards: { type: 'boolean', value: true, label: 'Allow Curation Rewards', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Comment Options',
        description: 'Set options for a comment or post.'
    },
    {
        type: 'limit_order_create2',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            orderid: { type: 'number', value: 0, label: 'Order ID', required: true },
            amount_to_sell: { type: 'string', value: '', label: 'Amount to Sell', required: true },
            exchange_rate: { type: 'string', value: '', label: 'Exchange Rate', required: true },
            fill_or_kill: { type: 'boolean', value: false, label: 'Fill or Kill', required: true },
            expiration: { type: 'date', value: '', label: 'Expiration', required: false }
        },
        label: 'Limit Order Create 2',
        description: 'Create a limit order with a specific exchange rate.'
    },
    {
        type: 'claim_account',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '', label: 'Creator', required: true },
            fee: { type: 'string', value: '', label: 'Fee', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Claim Account',
        description: 'Claim a discounted account creation token.'
    },
    {
        type: 'request_account_recovery',
        requiredAuth: 'active',
        fields: {
            recovery_account: { type: 'string', value: '', label: 'Recovery Account', required: true },
            account_to_recover: { type: 'string', value: '', label: 'Account to Recover', required: true },
            new_owner_authority: { type: 'string', value: '', label: 'New Owner Authority', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Request Account Recovery',
        description: 'Request recovery for a compromised account.'
    },
    {
        type: 'recover_account',
        requiredAuth: 'owner',
        fields: {
            account_to_recover: { type: 'string', value: '', label: 'Account to Recover', required: true },
            new_owner_authority: { type: 'string', value: '', label: 'New Owner Authority', required: true },
            recent_owner_authority: { type: 'string', value: '', label: 'Recent Owner Authority', required: false },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Recover Account',
        description: 'Recover a compromised account using owner authority.'
    },
    {
        type: 'change_recovery_account',
        requiredAuth: 'owner',
        fields: {
            account_to_recover: { type: 'string', value: '', label: 'Account to Recover', required: true },
            new_recovery_account: { type: 'string', value: '', label: 'New Recovery Account', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Change Recovery Account',
        description: 'Change the recovery account for an account.'
    },
    {
        type: 'escrow_dispute',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            agent: { type: 'string', value: '', label: 'Agent', required: true },
            who: { type: 'string', value: '', label: 'Who', required: true },
            escrow_id: { type: 'number', value: 0, label: 'Escrow ID', required: true }
        },
        label: 'Escrow Dispute',
        description: 'Raise a dispute on an escrow transaction.'
    },
    {
        type: 'pow2',
        requiredAuth: 'active',
        fields: {
            input: { type: 'string', value: '', label: 'Input', required: true },
            pow_summary: { type: 'string', value: '', label: 'Pow Summary', required: true }
        },
        label: 'Proof of Work 2',
        description: 'Submit a second version of proof of work.'
    },
    {
        type: 'cancel_transfer_from_savings',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            request_id: { type: 'number', value: 0, label: 'Request ID', required: true }
        },
        label: 'Cancel Transfer from Savings',
        description: 'Cancel a pending transfer from savings.'
    },
    {
        type: 'custom_binary',
        requiredAuth: 'posting',
        fields: {
            required_auths: { type: 'array', value: [], label: 'Required Auths', required: false },
            required_posting_auths: { type: 'array', value: [], label: 'Required Posting Auths', required: false },
            required_active_auths: { type: 'array', value: [], label: 'Required Active Auths', required: false },
            required_owner_auths: { type: 'array', value: [], label: 'Required Owner Auths', required: false },
            id: { type: 'string', value: '', label: 'ID', required: true },
            data: { type: 'string', value: '', label: 'Data', required: false }
        },
        label: 'Custom Binary',
        description: 'Broadcast a custom binary operation.'
    },
    {
        type: 'decline_voting_rights',
        requiredAuth: 'owner',
        fields: {
            account: { type: 'string', value: '', label: 'Account', required: true },
            decline: { type: 'boolean', value: false, label: 'Decline', required: true }
        },
        label: 'Decline Voting Rights',
        description: 'Permanently decline voting rights for an account.'
    },
    {
        type: 'reset_account',
        requiredAuth: 'active',
        fields: {
            reset_account: { type: 'string', value: '', label: 'Reset Account', required: true },
            account_to_reset: { type: 'string', value: '', label: 'Account to Reset', required: true },
            new_owner_authority: { type: 'string', value: '', label: 'New Owner Authority', required: true }
        },
        label: 'Reset Account',
        description: 'Reset an account to a new owner authority.'
    },
    {
        type: 'set_reset_account',
        requiredAuth: 'owner',
        fields: {
            account: { type: 'string', value: '', label: 'Account', required: true },
            current_reset_account: { type: 'string', value: '', label: 'Current Reset Account', required: true },
            reset_account: { type: 'string', value: '', label: 'Reset Account', required: true }
        },
        label: 'Set Reset Account',
        description: 'Set the reset account for an account.'
    },
    {
        type: 'claim_reward_balance2',
        requiredAuth: 'posting',
        fields: {
            account: { type: 'string', value: '', label: 'Account', required: true },
            reward_tokens: { type: 'array', value: [], label: 'Reward Tokens', required: false },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Claim Reward Balance 2',
        description: 'Claim multiple types of reward tokens.'
    },
    {
        type: 'vote2',
        requiredAuth: 'posting',
        fields: {
            voter: { type: 'string', value: '', label: 'Voter', required: true },
            author: { type: 'string', value: '', label: 'Author', required: true },
            permlink: { type: 'string', value: '', label: 'Permlink', required: true },
            rshares: { type: 'number', value: 0, label: 'Rshares', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Vote 2',
        description: 'Cast a vote with multiple assets.'
    },
    {
        type: 'smt_create',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '', label: 'Control Account', required: true },
            symbol: { type: 'string', value: '', label: 'Symbol', required: true },
            smt_creation_fee: { type: 'string', value: '', label: 'SMT Creation Fee', required: true },
            precision: { type: 'number', value: 0, label: 'Precision', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'SMT Create',
        description: 'Create a new Smart Media Token (SMT).'
    },
    {
        type: 'smt_setup',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '', label: 'Control Account', required: true },
            symbol: { type: 'string', value: '', label: 'Symbol', required: true },
            max_supply: { type: 'string', value: '', label: 'Max Supply', required: true },
            contribution_begin_time: { type: 'date', value: '', label: 'Contribution Begin Time', required: false },
            contribution_end_time: { type: 'date', value: '', label: 'Contribution End Time', required: false },
            launch_time: { type: 'date', value: '', label: 'Launch Time', required: false },
            steem_units_min: { type: 'string', value: '', label: 'Steem Units Min', required: true },
            min_unit_ratio: { type: 'number', value: 0, label: 'Min Unit Ratio', required: true },
            max_unit_ratio: { type: 'number', value: 0, label: 'Max Unit Ratio', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'SMT Setup',
        description: 'Set up parameters for a Smart Media Token (SMT).'
    },
    {
        type: 'smt_setup_emissions',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '', label: 'Control Account', required: true },
            symbol: { type: 'string', value: '', label: 'Symbol', required: true },
            schedule_time: { type: 'date', value: '', label: 'Schedule Time', required: false },
            emissions_unit: { type: 'string', value: '', label: 'Emissions Unit', required: true },
            interval_seconds: { type: 'number', value: 0, label: 'Interval Seconds', required: true },
            interval_count: { type: 'number', value: 0, label: 'Interval Count', required: true },
            lep_time: { type: 'date', value: '', label: 'LEP Time', required: false },
            rep_time: { type: 'date', value: '', label: 'REP Time', required: false },
            lep_abs_amount: { type: 'string', value: '', label: 'LEP Absolute Amount', required: false },
            rep_abs_amount: { type: 'string', value: '', label: 'REP Absolute Amount', required: false },
            lep_rel_amount_numerator: { type: 'number', value: 0, label: 'LEP Relative Amount Numerator', required: true },
            rep_rel_amount_numerator: { type: 'number', value: 0, label: 'REP Relative Amount Numerator', required: true },
            rel_amount_denom_bits: { type: 'number', value: 0, label: 'Relative Amount Denom Bits', required: true },
            remove: { type: 'boolean', value: false, label: 'Remove', required: true },
            floor_emissions: { type: 'boolean', value: false, label: 'Floor Emissions', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'SMT Setup Emissions',
        description: 'Configure emissions (inflation) for a Smart Media Token (SMT).'
    },
    {
        type: 'smt_setup_ico_tier',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '', label: 'Control Account', required: true },
            symbol: { type: 'string', value: '', label: 'Symbol', required: true },
            steem_units_cap: { type: 'string', value: '', label: 'Steem Units Cap', required: true },
            generation_policy: { type: 'string', value: '', label: 'Generation Policy', required: false },
            remove: { type: 'boolean', value: false, label: 'Remove', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'SMT Setup ICO Tier',
        description: 'Set up ICO tiers for a Smart Media Token (SMT).'
    },
    {
        type: 'smt_set_setup_parameters',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '', label: 'Control Account', required: true },
            symbol: { type: 'string', value: '', label: 'Symbol', required: true },
            setup_parameters: { type: 'string', value: '', label: 'Setup Parameters', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'SMT Set Setup Parameters',
        description: 'Set setup parameters for a Smart Media Token (SMT).'
    },
    {
        type: 'smt_set_runtime_parameters',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '', label: 'Control Account', required: true },
            symbol: { type: 'string', value: '', label: 'Symbol', required: true },
            runtime_parameters: { type: 'string', value: '', label: 'Runtime Parameters', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'SMT Set Runtime Parameters',
        description: 'Set runtime parameters for a Smart Media Token (SMT).'
    },
    {
        type: 'smt_contribute',
        requiredAuth: 'active',
        fields: {
            contributor: { type: 'string', value: '', label: 'Contributor', required: true },
            symbol: { type: 'string', value: '', label: 'Symbol', required: true },
            contribution_id: { type: 'number', value: 0, label: 'Contribution ID', required: true },
            contribution: { type: 'string', value: '', label: 'Contribution', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'SMT Contribute',
        description: 'Contribute to a Smart Media Token (SMT) ICO.'
    },
    {
        type: 'fill_convert_request',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            requestid: { type: 'number', value: 0, label: 'Request ID', required: true },
            amount_in: { type: 'string', value: '', label: 'Amount In', required: true },
            amount_out: { type: 'string', value: '', label: 'Amount Out', required: true }
        },
        label: 'Fill Convert Request',
        description: 'Fill a conversion request between STEEM and SBD.'
    },
    {
        type: 'comment_reward',
        requiredAuth: 'posting',
        fields: {
            author: { type: 'string', value: '', label: 'Author', required: true },
            permlink: { type: 'string', value: '', label: 'Permlink', required: true },
            payout: { type: 'string', value: '', label: 'Payout', required: true }
        },
        label: 'Comment Reward',
        description: 'Reward for a comment.'
    },
    {
        type: 'liquidity_reward',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            payout: { type: 'string', value: '', label: 'Payout', required: true }
        },
        label: 'Liquidity Reward',
        description: 'Reward for providing liquidity.'
    },
    {
        type: 'interest',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            interest: { type: 'string', value: '', label: 'Interest', required: true }
        },
        label: 'Interest',
        description: 'Receive interest payment on SBD balance.'
    },
    {
        type: 'fill_vesting_withdraw',
        requiredAuth: 'active',
        fields: {
            from_account: { type: 'string', value: '', label: 'From Account', required: true },
            to_account: { type: 'string', value: '', label: 'To Account', required: true },
            withdrawn: { type: 'string', value: '', label: 'Withdrawn', required: true },
            deposited: { type: 'string', value: '', label: 'Deposited', required: true }
        },
        label: 'Fill Vesting Withdraw',
        description: 'Fill a vesting withdrawal operation.'
    },
    {
        type: 'fill_order',
        requiredAuth: 'posting',
        fields: {
            current_owner: { type: 'string', value: '', label: 'Current Owner', required: true },
            current_orderid: { type: 'number', value: 0, label: 'Current Order ID', required: true },
            current_pays: { type: 'string', value: '', label: 'Current Pays', required: true },
            open_owner: { type: 'string', value: '', label: 'Open Owner', required: true },
            open_orderid: { type: 'number', value: 0, label: 'Open Order ID', required: true },
            open_pays: { type: 'string', value: '', label: 'Open Pays', required: true }
        },
        label: 'Fill Order',
        description: 'Fill a limit order on the internal market.'
    },
    {
        type: 'fill_transfer_from_savings',
        requiredAuth: 'posting',
        fields: {
            from: { type: 'string', value: '', label: 'From', required: true },
            to: { type: 'string', value: '', label: 'To', required: true },
            amount: { type: 'string', value: '', label: 'Amount', required: true },
            request_id: { type: 'number', value: 0, label: 'Request ID', required: true },
            memo: { type: 'string', value: '', label: 'Memo', required: false }
        },
        label: 'Fill Transfer from Savings',
        description: 'Fill a transfer from savings operation.'
    },
    {
        type: 'account_create_with_delegation',
        requiredAuth: 'active',
        fields: {
            fee: { type: 'string', value: '', label: 'Fee', required: true },
            delegation: { type: 'string', value: '', label: 'Delegation', required: true },
            creator: { type: 'string', value: '', label: 'Creator', required: true },
            new_account_name: { type: 'string', value: '', label: 'New Account Name', required: true },
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            active: { type: 'string', value: '', label: 'Active', required: true },
            posting: { type: 'string', value: '', label: 'Posting', required: true },
            memo_key: { type: 'string', value: '', label: 'Memo Key', required: true },
            json_metadata: { type: 'string', value: '', label: 'JSON Metadata', required: false },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Account Create with Delegation',
        description: 'Create a new account with delegated Steem Power.'
    },
    {
        type: 'witness_set_properties',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            props: { type: 'string', value: '', label: 'Props', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Witness Set Properties',
        description: 'Set properties for a witness.'
    },
    {
        type: 'account_update2',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '', label: 'Account', required: true },
            owner: { type: 'string', value: '', label: 'Owner', required: true },
            active: { type: 'string', value: '', label: 'Active', required: true },
            posting: { type: 'string', value: '', label: 'Posting', required: true },
            memo_key: { type: 'string', value: '', label: 'Memo Key', required: true },
            json_metadata: { type: 'string', value: '', label: 'JSON Metadata', required: false },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Account Update 2',
        description: 'Update account authorities and metadata (version 2).'
    },
    {
        type: 'update_proposal_votes',
        requiredAuth: 'active',
        fields: {
            voter: { type: 'string', value: '', label: 'Voter', required: true },
            proposal_ids: { type: 'array', value: [], label: 'Proposal IDs', required: true },
            approve: { type: 'boolean', value: false, label: 'Approve', required: true },
            extensions: { type: 'array', value: [], label: 'Extensions', required: false }
        },
        label: 'Update Proposal Votes',
        description: 'Vote for or against proposals.'
    }
]; 