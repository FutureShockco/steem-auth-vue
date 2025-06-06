import { PublicKey } from 'dsteem';

export interface IAccount {
    name: string;
    username: string;
    publicKey: string;
    vote: string;
    posting: {
        weight_threshold: number;
        account_auths: [string, number][];
        key_auths: [string | PublicKey, number][];
    };
    active: {
        weight_threshold: number;
        account_auths: [string, number][];
        key_auths: [string | PublicKey, number][];
    };
    owner: {
        weight_threshold: number;
        account_auths: [string, number][];
        key_auths: [string | PublicKey, number][];
    };
    memo_key: string;
    json_metadata: string;
    proxy: string;
    last_owner_update: string;
    last_account_update: string;
    created: string;
    mined: boolean;
    owner_challenged: boolean;
    active_challenged: boolean;
    last_owner_proved: string;
    last_active_proved: string;
    recovery_account: string;
    last_account_recovery: string;
    reset_account: string;
    comment_count: number;
    lifetime_vote_count: number;
    post_count: number;
    can_vote: boolean;
    voting_power: number;
    last_vote_time: string;
    balance: string;
    savings_balance: string;
    sbd_balance: string;
    sbd_seconds: string;
    sbd_last_interest_payment: string;
    savings_sbd_balance: string;
    savings_sbd_seconds: string;
    savings_sbd_last_interest_payment: string;
    savings_withdraw_requests: number;
    vesting_shares: string;
    delegated_vesting_shares: string;
    received_vesting_shares: string;
    vesting_withdraw_rate: string;
    next_vesting_withdrawal: string;
    withdrawn: string | number;
    to_withdraw: string;
    withdraw_routes: number;
    curation_rewards: string;
    posting_rewards: string;
    proxied_vsf_votes: any[];
    witnesses_voted_for: number;
    average_bandwidth: string;
    lifetime_bandwidth: string;
    last_bandwidth_update: string;
    average_market_bandwidth: string;
    lifetime_market_bandwidth: string;
    last_market_bandwidth_update: string;
    last_post: string;
    last_root_post: string;
    post_bandwidth: string;
    pending_claimed_accounts: number;
    governance_vote_expiration_ts: string;
    delayed_votes: any[];
    open_recurrent_transfers: number;
    vesting_balance: string;
    reputation: string;
    transfer_history: any[];
    market_history: any[];
    post_history: any[];
    vote_history: any[];
    other_history: any[];
    witness_votes: string[];
    tags_usage: any[];
    guest_bloggers: any[];
    encryptedPk?: string;
} 

export interface ITransaction {
  result: any;
  block_num: number;
  expiration: string;
  expired: boolean;
  extensions: string[];
  id: string;
  operations: string[];
  ref_block_num: number;
  ref_block_prefix: number;
  signatures?: string[];
  trx_num: number;
}

export interface SteemAuthProps {
  appName?: string;
}
