// This file is auto-generated. Do not edit manually.
// Run 'npm run generate-operations' to update.

/**
 * All available Echelon operation types
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
            target: { type: 'string', required: false }
        }
    },
    {
        type: 'chain_update_create',
        requiredAuth: 'active',
        fields: {
            title: { type: 'string', required: false },
            description: { type: 'string', required: false },
            url: { type: 'string', required: false },
            changes: { type: 'array', required: false }
        }
    },
    {
        type: 'fund_request_contrib',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true },
            amount: { type: 'number', required: false }
        }
    },
    {
        type: 'fund_request_create',
        requiredAuth: 'active',
        fields: {
            title: { type: 'string', required: false },
            description: { type: 'string', required: false },
            url: { type: 'string', required: false },
            requested: { type: 'number', required: false },
            receiver: { type: 'string', required: false }
        }
    },
    {
        type: 'fund_request_work',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true },
            work: { type: 'json', required: false }
        }
    },
    {
        type: 'fund_request_work_review',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true },
            approve: { type: 'string', required: false },
            memo: { type: 'string', required: false }
        }
    },
    {
        type: 'md_queue',
        requiredAuth: 'active',
        fields: {
            txtype: { type: 'number', required: false },
            payload: { type: 'json', required: false }
        }
    },
    {
        type: 'md_sign',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true }
        }
    },
    {
        type: 'proposal_edit',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true },
            title: { type: 'string', required: false },
            description: { type: 'string', required: false },
            url: { type: 'string', required: false }
        }
    },
    {
        type: 'proposal_vote',
        requiredAuth: 'active',
        fields: {
            id: { type: 'string', required: true },
            amount: { type: 'number', required: false }
        }
    },
    {
        type: 'disapprove_node',
        requiredAuth: 'active',
        fields: {
            target: { type: 'string', required: false }
        }
    },
    {
        type: 'enable_node',
        requiredAuth: 'active',
        fields: {
            pub: { type: 'string', required: false }
        }
    },
    {
        type: 'create_market',
        requiredAuth: 'active',
        fields: {
            baseToken: { type: 'string', required: true },
            quoteToken: { type: 'string', required: true }
        }
    },
    {
        type: 'place_order',
        requiredAuth: 'active',
        fields: {
            market: { type: 'string', required: true },
            type: { type: 'string', required: true },
            price: { type: 'number', required: true },
            amount: { type: 'number', required: true }
        }
    },
    {
        type: 'create_collection',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true },
            name: { type: 'string', required: true },
            metadata: { type: 'string', required: true }
        }
    },
    {
        type: 'transfer_nft',
        requiredAuth: 'active',
        fields: {
            collection: { type: 'string', required: true },
            tokenId: { type: 'string', required: true },
            to: { type: 'string', required: true }
        }
    },
    {
        type: 'create_pool',
        requiredAuth: 'active',
        fields: {
            token0: { type: 'string', required: true },
            token1: { type: 'string', required: true }
        }
    },
    {
        type: 'stake',
        requiredAuth: 'active',
        fields: {
            token0: { type: 'string', required: true },
            token1: { type: 'string', required: true },
            amount0: { type: 'number', required: true },
            amount1: { type: 'number', required: true }
        }
    },
    {
        type: 'swap',
        requiredAuth: 'active',
        fields: {
            tokenIn: { type: 'string', required: true },
            tokenOut: { type: 'string', required: true },
            amountIn: { type: 'number', required: true },
            minAmountOut: { type: 'number', required: true }
        }
    },
    {
        type: 'swap_route',
        requiredAuth: 'active',
        fields: {
            path: { type: 'array', required: false },
            amountIn: { type: 'number', required: true },
            minAmountOut: { type: 'number', required: true }
        }
    },
    {
        type: 'unstake',
        requiredAuth: 'active',
        fields: {
            token0: { type: 'string', required: true },
            token1: { type: 'string', required: true },
            lpAmount: { type: 'number', required: true }
        }
    },
    {
        type: 'create_token',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true },
            name: { type: 'string', required: true },
            precision: { type: 'string', required: true },
            maxSupply: { type: 'number', required: true }
        }
    },
    {
        type: 'mint_token',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true },
            amount: { type: 'number', required: true },
            to: { type: 'string', required: true }
        }
    },
    {
        type: 'transfer_token',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true },
            amount: { type: 'number', required: true },
            to: { type: 'string', required: true }
        }
    },
    {
        type: 'update_token',
        requiredAuth: 'active',
        fields: {
            symbol: { type: 'string', required: true },
            metadata: { type: 'string', required: true }
        }
    },
    {
        type: 'transfer',
        requiredAuth: 'active',
        fields: {
            to: { type: 'string', required: false },
            amount: { type: 'number', required: false },
            memo: { type: 'string', required: false }
        }
    },
    {
        type: 'user_json',
        requiredAuth: 'active',
        fields: {
            json: { type: 'json', required: true }
        }
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