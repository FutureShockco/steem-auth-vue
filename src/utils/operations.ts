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
        type: 'transfer',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: 'futureshock' },
            amount: { type: 'string', value: '0.001 SBD' },
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
            id: { type: 'string', value: 'test' },
            json: { type: 'string', value: {
                app: 'future.app',
                payload: {
                    action: 'upgradeBuilding',
                    building: 'headquarters',
                    level: 2
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
    {
        type: 'limit_order_create',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            orderid: { type: 'number', value: 0 },
            amount_to_sell: { type: 'string', value: '' },
            min_to_receive: { type: 'string', value: '' },
            fill_or_kill: { type: 'boolean', value: false },
            expiration: { type: 'date', value: '' },
        },
    },
    {
        type: 'limit_order_cancel',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            orderid: { type: 'number', value: 0 },
        },
    },
    {
        type: 'transfer_to_vesting',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            amount: { type: 'string', value: '' }
        }
    },
    {
        type: 'withdraw_vesting',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '' },
            vesting_shares: { type: 'string', value: '' }
        }
    },
    {
        type: 'price',
        requiredAuth: 'active',
        fields: {
            base: { type: 'string', value: '' },
            quote: { type: 'string', value: '' }
        }
    },
    {
        type: 'feed_publish',
        requiredAuth: 'active',
        fields: {
            publisher: { type: 'string', value: '' },
            exchange_rate: { type: 'string', value: '' }
        }
    },
    {
        type: 'convert',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            requestid: { type: 'number', value: 0 },
            amount: { type: 'string', value: '' }
        }
    },
    {
        type: 'account_create',
        requiredAuth: 'active',
        fields: {
            fee: { type: 'string', value: '' },
            creator: { type: 'string', value: '' },
            new_account_name: { type: 'string', value: '' },
            owner: { type: 'string', value: '' },
            active: { type: 'string', value: '' },
            posting: { type: 'string', value: '' },
            memo_key: { type: 'string', value: '' },
            json_metadata: { type: 'string', value: '' }
        }
    },
    {
        type: 'account_update',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '' },
            owner: { type: 'string', value: '' },
            active: { type: 'string', value: '' },
            posting: { type: 'string', value: '' },
            memo_key: { type: 'string', value: '' },
            json_metadata: { type: 'string', value: '' }
        }
    },
    {
        type: 'account_witness_vote',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '' },
            witness: { type: 'string', value: '' },
            approve: { type: 'boolean', value: false }
        }
    },
    {
        type: 'account_witness_proxy',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '' },
            proxy: { type: 'string', value: '' }
        }
    },
    {
        type: 'pow',
        requiredAuth: 'active',
        fields: {
            worker: { type: 'string', value: '' },
            input: { type: 'string', value: '' },
            signature: { type: 'string', value: '' },
            work: { type: 'string', value: '' }
        }
    },
    {
        type: 'custom',
        requiredAuth: 'active',
        fields: {
            required_auths: { type: 'array', value: [] },
            id: { type: 'string', value: '' },
            data: { type: 'string', value: '' }
        }
    },
    {
        type: 'comment_options',
        requiredAuth: 'posting',
        fields: {
            author: { type: 'string', value: '' },
            permlink: { type: 'string', value: '' },
            max_accepted_payout: { type: 'string', value: '' },
            percent_steem_dollars: { type: 'number', value: 0 },
            allow_votes: { type: 'boolean', value: true },
            allow_curation_rewards: { type: 'boolean', value: true },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'limit_order_create2',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            orderid: { type: 'number', value: 0 },
            amount_to_sell: { type: 'string', value: '' },
            exchange_rate: { type: 'string', value: '' },
            fill_or_kill: { type: 'boolean', value: false },
            expiration: { type: 'date', value: '' }
        }
    },
    {
        type: 'claim_account',
        requiredAuth: 'active',
        fields: {
            creator: { type: 'string', value: '' },
            fee: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'request_account_recovery',
        requiredAuth: 'active',
        fields: {
            recovery_account: { type: 'string', value: '' },
            account_to_recover: { type: 'string', value: '' },
            new_owner_authority: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'recover_account',
        requiredAuth: 'owner',
        fields: {
            account_to_recover: { type: 'string', value: '' },
            new_owner_authority: { type: 'string', value: '' },
            recent_owner_authority: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'change_recovery_account',
        requiredAuth: 'owner',
        fields: {
            account_to_recover: { type: 'string', value: '' },
            new_recovery_account: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'escrow_dispute',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            agent: { type: 'string', value: '' },
            who: { type: 'string', value: '' },
            escrow_id: { type: 'number', value: 0 }
        }
    },
    {
        type: 'pow2',
        requiredAuth: 'active',
        fields: {
            input: { type: 'string', value: '' },
            pow_summary: { type: 'string', value: '' }
        }
    },
    {
        type: 'cancel_transfer_from_savings',
        requiredAuth: 'active',
        fields: {
            from: { type: 'string', value: '' },
            request_id: { type: 'number', value: 0 }
        }
    },
    {
        type: 'custom_binary',
        requiredAuth: 'posting',
        fields: {
            required_auths: { type: 'array', value: [] },
            required_posting_auths: { type: 'array', value: [] },
            required_active_auths: { type: 'array', value: [] },
            required_owner_auths: { type: 'array', value: [] },
            id: { type: 'string', value: '' },
            data: { type: 'string', value: '' }
        }
    },
    {
        type: 'decline_voting_rights',
        requiredAuth: 'owner',
        fields: {
            account: { type: 'string', value: '' },
            decline: { type: 'boolean', value: false }
        }
    },
    {
        type: 'reset_account',
        requiredAuth: 'active',
        fields: {
            reset_account: { type: 'string', value: '' },
            account_to_reset: { type: 'string', value: '' },
            new_owner_authority: { type: 'string', value: '' }
        }
    },
    {
        type: 'set_reset_account',
        requiredAuth: 'owner',
        fields: {
            account: { type: 'string', value: '' },
            current_reset_account: { type: 'string', value: '' },
            reset_account: { type: 'string', value: '' }
        }
    },
    {
        type: 'claim_reward_balance2',
        requiredAuth: 'posting',
        fields: {
            account: { type: 'string', value: '' },
            reward_tokens: { type: 'array', value: [] },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'vote2',
        requiredAuth: 'posting',
        fields: {
            voter: { type: 'string', value: '' },
            author: { type: 'string', value: '' },
            permlink: { type: 'string', value: '' },
            rshares: { type: 'number', value: 0 },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'smt_create',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '' },
            symbol: { type: 'string', value: '' },
            smt_creation_fee: { type: 'string', value: '' },
            precision: { type: 'number', value: 0 },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'smt_setup',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '' },
            symbol: { type: 'string', value: '' },
            max_supply: { type: 'string', value: '' },
            contribution_begin_time: { type: 'date', value: '' },
            contribution_end_time: { type: 'date', value: '' },
            launch_time: { type: 'date', value: '' },
            steem_units_min: { type: 'string', value: '' },
            min_unit_ratio: { type: 'number', value: 0 },
            max_unit_ratio: { type: 'number', value: 0 },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'smt_setup_emissions',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '' },
            symbol: { type: 'string', value: '' },
            schedule_time: { type: 'date', value: '' },
            emissions_unit: { type: 'string', value: '' },
            interval_seconds: { type: 'number', value: 0 },
            interval_count: { type: 'number', value: 0 },
            lep_time: { type: 'date', value: '' },
            rep_time: { type: 'date', value: '' },
            lep_abs_amount: { type: 'string', value: '' },
            rep_abs_amount: { type: 'string', value: '' },
            lep_rel_amount_numerator: { type: 'number', value: 0 },
            rep_rel_amount_numerator: { type: 'number', value: 0 },
            rel_amount_denom_bits: { type: 'number', value: 0 },
            remove: { type: 'boolean', value: false },
            floor_emissions: { type: 'boolean', value: false },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'smt_setup_ico_tier',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '' },
            symbol: { type: 'string', value: '' },
            steem_units_cap: { type: 'string', value: '' },
            generation_policy: { type: 'string', value: '' },
            remove: { type: 'boolean', value: false },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'smt_set_setup_parameters',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '' },
            symbol: { type: 'string', value: '' },
            setup_parameters: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'smt_set_runtime_parameters',
        requiredAuth: 'active',
        fields: {
            control_account: { type: 'string', value: '' },
            symbol: { type: 'string', value: '' },
            runtime_parameters: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'smt_contribute',
        requiredAuth: 'active',
        fields: {
            contributor: { type: 'string', value: '' },
            symbol: { type: 'string', value: '' },
            contribution_id: { type: 'number', value: 0 },
            contribution: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'fill_convert_request',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            requestid: { type: 'number', value: 0 },
            amount_in: { type: 'string', value: '' },
            amount_out: { type: 'string', value: '' }
        }
    },
    {
        type: 'comment_reward',
        requiredAuth: 'posting',
        fields: {
            author: { type: 'string', value: '' },
            permlink: { type: 'string', value: '' },
            payout: { type: 'string', value: '' }
        }
    },
    {
        type: 'liquidity_reward',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            payout: { type: 'string', value: '' }
        }
    },
    {
        type: 'interest',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            interest: { type: 'string', value: '' }
        }
    },
    {
        type: 'fill_vesting_withdraw',
        requiredAuth: 'active',
        fields: {
            from_account: { type: 'string', value: '' },
            to_account: { type: 'string', value: '' },
            withdrawn: { type: 'string', value: '' },
            deposited: { type: 'string', value: '' }
        }
    },
    {
        type: 'fill_order',
        requiredAuth: 'posting',
        fields: {
            current_owner: { type: 'string', value: '' },
            current_orderid: { type: 'number', value: 0 },
            current_pays: { type: 'string', value: '' },
            open_owner: { type: 'string', value: '' },
            open_orderid: { type: 'number', value: 0 },
            open_pays: { type: 'string', value: '' }
        }
    },
    {
        type: 'fill_transfer_from_savings',
        requiredAuth: 'posting',
        fields: {
            from: { type: 'string', value: '' },
            to: { type: 'string', value: '' },
            amount: { type: 'string', value: '' },
            request_id: { type: 'number', value: 0 },
            memo: { type: 'string', value: '' }
        }
    },
    {
        type: 'account_create_with_delegation',
        requiredAuth: 'active',
        fields: {
            fee: { type: 'string', value: '' },
            delegation: { type: 'string', value: '' },
            creator: { type: 'string', value: '' },
            new_account_name: { type: 'string', value: '' },
            owner: { type: 'string', value: '' },
            active: { type: 'string', value: '' },
            posting: { type: 'string', value: '' },
            memo_key: { type: 'string', value: '' },
            json_metadata: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'witness_set_properties',
        requiredAuth: 'active',
        fields: {
            owner: { type: 'string', value: '' },
            props: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'account_update2',
        requiredAuth: 'active',
        fields: {
            account: { type: 'string', value: '' },
            owner: { type: 'string', value: '' },
            active: { type: 'string', value: '' },
            posting: { type: 'string', value: '' },
            memo_key: { type: 'string', value: '' },
            json_metadata: { type: 'string', value: '' },
            posting_json_metadata: { type: 'string', value: '' },
            extensions: { type: 'array', value: [] }
        }
    },
    {
        type: 'update_proposal_votes',
        requiredAuth: 'active',
        fields: {
            voter: { type: 'string', value: '' },
            proposal_ids: { type: 'array', value: [] },
            approve: { type: 'boolean', value: false },
            extensions: { type: 'array', value: [] }
        }
    }
]; 