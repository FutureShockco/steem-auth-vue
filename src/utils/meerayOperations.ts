/**
 * All available Meeray operation types
 */
export type OperationType = 'approve_node' | 'chain_update_create' | 'fund_request_contrib' | 'fund_request_create' | 'fund_request_work' | 'fund_request_work_review' | 'md_queue' | 'md_sign' | 'proposal_edit' | 'proposal_vote' | 'disapprove_node' | 'enable_node' | 'create_market' | 'place_order' | 'create_collection' | 'transfer_nft' | 'create_pool' | 'stake' | 'swap' | 'swap_route' | 'unstake' | 'create_token' | 'mint_token' | 'transfer_token' | 'update_token' | 'transfer' | 'user_json';

/**
 * Field type definitions for operations
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'json' | 'array';

/**
 * Definition of a field in an operation
 */
export interface FieldDefinition {
    type: FieldType;
    required: boolean;
    label?: string;
    value: string | number | boolean | object;
}

/**
 * Complete operation definition
 */
export interface OperationDefinition {
    type: OperationType;
    requiredAuth: 'posting' | 'active' | 'master';
    fields: {
        [key: string]: FieldDefinition;
    };
    label: string;
    description: string;
}

/**
 * Default value function for field types
 */
export function getDefaultValueForType(type: FieldType): any {
    switch (type) {
        case 'string': return '';
        case 'number': return 0;
        case 'boolean': return false;
        case 'json': return {};
        case 'array': return [];
    }
}

/**
 * All supported operations with their definitions
 */
export const operations: OperationDefinition[] = [
    {
        type: 'approve_node',
        requiredAuth: 'active',
        fields: {
            target: { type: 'string', required: false, label: 'Target', value: '' }
        },
        label: 'Approve Node',
        description: 'Approve a node to participate in the network.'
    },
    {
        type: 'chain_update_create',
        requiredAuth: 'active',
        fields: {
            title: { type: 'string', required: false, label: 'Title', value: '' },
            description: { type: 'string', required: false, label: 'Description', value: '' },
            url: { type: 'string', required: false, label: 'URL', value: '' },
            changes: { type: 'array', required: false, label: 'Changes', value: [] }
        },
        label: 'Create Chain Update',
        description: 'Create a new chain update.'
    },
    {
        type: 'fund_request_contrib',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true, label: 'ID', value: '' },
            amount: { type: 'number', required: false, label: 'Amount', value: 0 }
        },
        label: 'Fund Request Contribution',
        description: 'Contribute to a fund request.'
    },
    {
        type: 'fund_request_create',
        requiredAuth: 'active',
        fields: {
            title: { type: 'string', required: false, label: 'Title', value: '' },
            description: { type: 'string', required: false, label: 'Description', value: '' },
            url: { type: 'string', required: false, label: 'URL', value: '' },
            requested: { type: 'number', required: false, label: 'Requested', value: 0 },
            receiver: { type: 'string', required: false, label: 'Receiver', value: '' }
        },
        label: 'Create Fund Request',
        description: 'Create a new fund request.'
    },
    {
        type: 'fund_request_work',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true, label: 'ID', value: '' },
            work: { type: 'json', required: false, label: 'Work', value: {} }
        },
        label: 'Fund Request Work',
        description: 'Submit work for a fund request.'
    },
    {
        type: 'fund_request_work_review',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true, label: 'ID', value: '' },
            approve: { type: 'string', required: false, label: 'Approve', value: '' },
            memo: { type: 'string', required: false, label: 'Memo', value: '' }
        },
        label: 'Review Fund Request Work',
        description: 'Review and approve or disapprove work for a fund request.'
    },
    {
        type: 'md_queue',
        requiredAuth: 'active',
        fields: {
            txtype: { type: 'number', required: false, label: 'Tx Type', value: 0 },
            payload: { type: 'json', required: false, label: 'Payload', value: {} }
        },
        label: 'Market Data Queue',
        description: 'Queue a new market data request.'
    },
    {
        type: 'md_sign',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true, label: 'ID', value: '' }
        },
        label: 'Market Data Sign',
        description: 'Sign a market data request.'
    },
    {
        type: 'proposal_edit',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true, label: 'ID', value: '' },
            title: { type: 'string', required: false, label: 'Title', value: '' },
            description: { type: 'string', required: false, label: 'Description', value: '' },
            url: { type: 'string', required: false, label: 'URL', value: '' }
        },
        label: 'Edit Proposal',
        description: 'Edit an existing proposal.'
    },
    {
        type: 'proposal_vote',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true, label: 'ID', value: '' },
            amount: { type: 'number', required: false, label: 'Amount', value: 0 }
        },
        label: 'Vote on Proposal',
        description: 'Vote on an existing proposal.'
    },
    {
        type: 'disapprove_node',
        requiredAuth: 'active',
        fields: {
            target: { type: 'string', required: false, label: 'Target', value: '' }
        },
        label: 'Disapprove Node',
        description: 'Disapprove a node from participating in the network.'
    },
    {
        type: 'enable_node',
        requiredAuth: 'active',
        fields: {
            pub: { type: 'string', required: false, label: 'Pub', value: '' }
        },
        label: 'Enable Node',
        description: 'Enable a node to participate in the network.'
    },
    {
        type: 'create_market',
        requiredAuth: 'active',
        fields: {
            baseToken: { type: 'string', required: true, label: 'Base Token', value: '' },
            quoteToken: { type: 'string', required: true, label: 'Quote Token', value: '' }
        },
        label: 'Create Market',
        description: 'Create a new market.'
    },
    {
        type: 'place_order',
        requiredAuth: 'active',
        fields: {
            market: { type: 'string', required: true, label: 'Market', value: '' },
            type: { type: 'string', required: true, label: 'Type', value: '' },
            price: { type: 'number', required: true, label: 'Price', value: 0 },
            amount: { type: 'number', required: true, label: 'Amount', value: 0 }
        },
        label: 'Place Order',
        description: 'Place a new order in the market.'
    },
    {
        type: 'create_collection',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true, label: 'Symbol', value: '' },
            name: { type: 'string', required: true, label: 'Name', value: '' },
            metadata: { type: 'string', required: true, label: 'Metadata', value: '' }
        },
        label: 'Create Collection',
        description: 'Create a new collection.'
    },
    {
        type: 'transfer_nft',
        requiredAuth: 'active',
        fields: {
            collection: { type: 'string', required: true, label: 'Collection', value: '' },
            tokenId: { type: 'string', required: true, label: 'Token ID', value: '' },
            to: { type: 'string', required: true, label: 'To', value: '' }
        },
        label: 'Transfer NFT',
        description: 'Transfer an NFT from one account to another.'
    },
    {
        type: 'create_pool',
        requiredAuth: 'active',
        fields: {
            token0: { type: 'string', required: true, label: 'Token 0', value: '' },
            token1: { type: 'string', required: true, label: 'Token 1', value: '' }
        },
        label: 'Create Pool',
        description: 'Create a new liquidity pool.'
    },
    {
        type: 'stake',
        requiredAuth: 'active',
        fields: {
            token0: { type: 'string', required: true, label: 'Token 0', value: '' },
            token1: { type: 'string', required: true, label: 'Token 1', value: '' },
            amount0: { type: 'number', required: true, label: 'Amount 0', value: 0 },
            amount1: { type: 'number', required: true, label: 'Amount 1', value: 0 }
        },
        label: 'Stake',
        description: 'Stake tokens in a liquidity pool.'
    },
    {
        type: 'swap',
        requiredAuth: 'active',
        fields: {
            tokenIn: { type: 'string', required: true, label: 'Token In', value: '' },
            tokenOut: { type: 'string', required: true, label: 'Token Out', value: '' },
            amountIn: { type: 'number', required: true, label: 'Amount In', value: 0 },
            minAmountOut: { type: 'number', required: true, label: 'Min Amount Out', value: 0 }
        },
        label: 'Swap',
        description: 'Swap tokens in the market.'
    },
    {
        type: 'swap_route',
        requiredAuth: 'active',
        fields: {
            path: { type: 'array', required: false, label: 'Path', value: [] },
            amountIn: { type: 'number', required: true, label: 'Amount In', value: 0 },
            minAmountOut: { type: 'number', required: true, label: 'Min Amount Out', value: 0 }
        },
        label: 'Swap Route',
        description: 'Swap tokens through a specific route.'
    },
    {
        type: 'unstake',
        requiredAuth: 'active',
        fields: {
            token0: { type: 'string', required: true, label: 'Token 0', value: '' },
            token1: { type: 'string', required: true, label: 'Token 1', value: '' },
            lpAmount: { type: 'number', required: true, label: 'LP Amount', value: 0 }
        },
        label: 'Unstake',
        description: 'Unstake tokens from a liquidity pool.'
    },
    {
        type: 'create_token',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true, label: 'Symbol', value: '' },
            name: { type: 'string', required: true, label: 'Name', value: '' },
            precision: { type: 'string', required: true, label: 'Precision', value: '' },
            maxSupply: { type: 'number', required: true, label: 'Max Supply', value: 0 }
        },
        label: 'Create Token',
        description: 'Create a new token.'
    },
    {
        type: 'mint_token',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true, label: 'Symbol', value: '' },
            amount: { type: 'number', required: true, label: 'Amount', value: 0 },
            to: { type: 'string', required: true, label: 'To', value: '' }
        },
        label: 'Mint Token',
        description: 'Mint new tokens.'
    },
    {
        type: 'transfer_token',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true, label: 'Symbol', value: '' },
            amount: { type: 'number', required: true, label: 'Amount', value: 0 },
            to: { type: 'string', required: true, label: 'To', value: '' }
        },
        label: 'Transfer Token',
        description: 'Transfer tokens from one account to another.'
    },
    {
        type: 'update_token',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true, label: 'Symbol', value: '' },
            metadata: { type: 'string', required: true, label: 'Metadata', value: '' }
        },
        label: 'Update Token',
        description: 'Update token metadata.'
    },
    {
        type: 'transfer',
        requiredAuth: 'active',
        fields: {
            to: { type: 'string', required: false, label: 'To', value: '' },
            amount: { type: 'number', required: false, label: 'Amount', value: 0 },
            memo: { type: 'string', required: false, label: 'Memo', value: '' }
        },
        label: 'Transfer',
        description: 'Send MEERAY tokens to another account.'
    },
    {
        type: 'user_json',
        requiredAuth: 'posting',
        fields: {
            sender: { type: 'string', required: true, label: 'Sender', value: '' },
            json_data: { type: 'json', required: true, label: 'JSON Data', value: '{}' }
        },
        label: 'User JSON',
        description: 'Broadcast a generic user JSON operation for Meeray.'
    }
];

/**
 * Get operation definition by type
 */
export function getOperationByType(type: OperationType): OperationDefinition | undefined {
    return operations.find(op => op.type === type);
}

/**
 * Create an empty operation object with default values
 */
export function createEmptyOperation(type: OperationType): Record<string, any> {
    const operation = getOperationByType(type);
    if (!operation) return { type };
    
    const result: Record<string, any> = { type };
    
    for (const [fieldName, fieldDef] of Object.entries(operation.fields)) {
        result[fieldName] = getDefaultValueForType(fieldDef.type);
    }
    
    return result;
}

/**
 * Create a properly formatted operation with authentication fields
 */
export function createFormattedOperation(type: OperationType, data: Record<string, any>, username: string): Record<string, any> {
    const operation = getOperationByType(type);
    if (!operation) {
        throw new Error(`Unknown operation type: ${type}`);
    }

    // Format JSON data
    const json = {
        contract: type,
        payload: { ...data }
    };

    // Create operation with proper auth fields
    const result: Record<string, any> = {
        id: 'sidechain',
        json: JSON.stringify(json),
        required_auths: [],
        required_posting_auths: []
    };

    // Set auth arrays based on required permission
    if (operation.requiredAuth === 'posting') {
        result.required_posting_auths = [username];
    } else {
        // active and master auth use required_auths
        result.required_auths = [username];
    }

    return result;
}