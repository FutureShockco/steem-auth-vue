export interface IAccount {
  json_metadata: any;
  name: string;
  username: string;
  publicKey: string;
  vote: string;
}

export interface ITransaction {
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