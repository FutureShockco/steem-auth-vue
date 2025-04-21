// This file is auto-generated. Do not edit manually.
// Run 'npm run generate-operations' to update.

export type OperationType = 'approve_node' | 'enable_node' | 'create_market' | 'place_order' | 'create_collection' | 'mint_nft' | 'transfer_nft' | 'create_pool' | 'stake' | 'unstake' | 'create_token' | 'transfer_token';


interface FieldDefinition {
    type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'array';
    value: string | number | boolean | object;
    required?: boolean;
}

export interface OperationDefinition {
    type: OperationType;
    fields: {
        [key: string]: FieldDefinition;
    };
}

export const operations: OperationDefinition[] = [
    {
        type: 'approve_node',
        fields: {
            to: { type: 'string', value: '', required: false }
        }
    },
    {
        type: 'enable_node',
        fields: {
            pub: { type: 'string', value: '', required: false }
        }
    },
    {
        type: 'create_market',
        fields: {
            baseToken: { type: 'string', value: '', required: true },
            quoteToken: { type: 'string', value: '', required: true }
        }
    },
    {
        type: 'place_order',
        fields: {
            market: { type: 'string', value: '', required: true },
            type: { type: 'string', value: '', required: true },
            price: { type: 'number', value: 0, required: true },
            amount: { type: 'number', value: 0, required: true }
        }
    },
    {
        type: 'create_collection',
        fields: {
            symbol: { type: 'string', value: '', required: true },
            name: { type: 'string', value: '', required: true },
            metadata: { type: 'string', value: '', required: true }
        }
    },
    {
        type: 'mint_nft',
        fields: {
            collection: { type: 'string', value: '', required: true },
            tokenId: { type: 'string', value: '', required: true },
            to: { type: 'string', value: '', required: true },
            metadata: { type: 'string', value: '', required: true }
        }
    },
    {
        type: 'transfer_nft',
        fields: {
            collection: { type: 'string', value: '', required: true },
            tokenId: { type: 'string', value: '', required: true },
            to: { type: 'string', value: '', required: true }
        }
    },
    {
        type: 'create_pool',
        fields: {
            token: { type: 'string', value: '', required: true },
            apr: { type: 'number', value: 0, required: true }
        }
    },
    {
        type: 'stake',
        fields: {
            token: { type: 'string', value: '', required: true },
            amount: { type: 'number', value: 0, required: true }
        }
    },
    {
        type: 'unstake',
        fields: {
            token: { type: 'string', value: '', required: true },
            amount: { type: 'number', value: 0, required: true }
        }
    },
    {
        type: 'create_token',
        fields: {
            symbol: { type: 'string', value: '', required: true },
            name: { type: 'string', value: '', required: true },
            precision: { type: 'string', value: '', required: true },
            maxSupply: { type: 'number', value: 0, required: true }
        }
    },
    {
        type: 'transfer_token',
        fields: {
            symbol: { type: 'string', value: '', required: true },
            amount: { type: 'number', value: 0, required: true },
            to: { type: 'string', value: '', required: true }
        }
    }
];