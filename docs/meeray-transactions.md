# Meeray Transactions Guide

This guide explains how to use the Meeray sidechain transaction components and services.

## Using the MeerayTransactions Component

Import and register the component:

```vue
<template>
  <SteemAuth :appName="'MyApp'" :callbackURL="'http://localhost:3000/callback'" />
  <MeerayTransactions />
</template>

<script setup>
import { SteemAuth, MeerayTransactions } from 'steem-auth-vue';
import 'steem-auth-vue/dist/style.css';
</script>
```

### PIN Modal Integration
- When using direct posting key login, the `PinModal` will prompt the user to set or enter a 4-digit PIN for secure key encryption.
- The PIN is required for sending Meeray transactions that require the posting or active key.

### Multi-Account Support
- You can add, remove, and switch between multiple Steem accounts using the account dropdown in the `SteemAuth` component.
- The transaction form fields (like `from`, `author`, etc.) will update automatically when you switch accounts.

### Defensive Template Example
Always guard against undefined objects in your templates:
```vue
<form v-if="inputValues[operation.type]">
  <!-- form fields -->
</form>
```

### Sending an Meeray Operation
```vue
<template>
  <SteemAuth />
  <MeerayTransactions />
</template>
```
- Fill in the Meeray operation form and click Send. If using direct login, you will be prompted for your PIN.

### Troubleshooting

#### Build Errors: Unused Variables
- Use `_` for unused variables in `v-for` and prefix unused function parameters with `_`.

#### Runtime Errors: Cannot read properties of undefined/null
- Use `v-if` guards to ensure objects exist before accessing their properties.

#### PIN Modal Issues
- If the PIN modal does not appear or PIN entry fails, ensure you are using the latest version and that your login flow is correct.

---
For more details, see the main README and the `PinModal.vue` example.

# Meeray Sidechain Transactions

This guide provides examples of how to use the `TransactionService` to send transactions to the Meeray sidechain.

## Overview

Meeray is a next generation sidechain designed to extend the capabilities of the Steem Blockchain with advanced features like tokens, NFTs, markets, and staking. It processes Steem custom_json operations to enable these additional functionalities while maintaining the security and decentralization of the Steem blockchain.

## Basic Usage

First, import the necessary services:

```js
import { useAuthStore, TransactionService } from 'steem-auth-vue';
```

The basic pattern for sending any Meeray transaction is:

```js
// 1. Create the Meeray transaction data
const jsonData = {
  contract: 'contract_name',
  payload: { /* contract-specific data */ }
};

// 2. Create the custom_json operation
const tx = {
  required_auths: [authStore.state.username], // Most Meeray operations require active authority
  required_posting_auths: [],
  id: 'sidechain',
  json: JSON.stringify(jsonData)
};

// 3. Send the transaction
const response = await TransactionService.send(
  'custom_json', 
  tx, 
  { 
    requiredAuth: 'active'
  }
);

// 4. Handle the response
console.log('Transaction ID:', response.id);
```

## Node Operations

### Approve a Node

Approve a node for the Meeray network:

```js
async function approveNode(target) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'approve_node',
      payload: {
        target: target // Node account name
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Disapprove a Node

Remove approval for a node:

```js
async function disapproveNode(target) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'disaprove_node', // Note the spelling
      payload: {
        target: target // Node account name
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Enable a Node

Enable a node with a public key:

```js
async function enableNode(publicKey) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'enable_node',
      payload: {
        pub: publicKey // Public key for the node
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

## Token Operations

### Create a Token

Create a new token on Meeray:

```js
async function createToken(symbol, name, precision, maxSupply) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'create_token',
      payload: {
        symbol: symbol, // Token symbol (e.g., "ECHELON")
        name: name, // Token name (e.g., "Meeray Token")
        precision: precision, // Decimal precision (e.g., "3")
        maxSupply: maxSupply // Maximum supply (e.g., 1000000)
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Update Token

Update token metadata:

```js
async function updateToken(symbol, metadata) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'update_token',
      payload: {
        symbol: symbol, // Token symbol
        metadata: metadata // Token metadata (string or JSON stringified)
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Mint Token

Mint new tokens (available only to token creator):

```js
async function mintToken(symbol, amount, recipient) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'mint_token',
      payload: {
        symbol: symbol, // Token symbol
        amount: amount, // Amount to mint
        to: recipient // Recipient account name
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Transfer Token

Transfer tokens to another account:

```js
async function transferToken(symbol, amount, recipient) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'transfer_token',
      payload: {
        symbol: symbol, // Token symbol
        amount: amount, // Amount to transfer
        to: recipient // Recipient account name
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

## Pool Operations

### Create a Liquidity Pool

Create a new staking pool:

```js
async function createPool(token, apr) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'create_pool',
      payload: {
        token: token, // Token symbol
        apr: apr // Annual percentage rate (e.g., 5 for 5%)
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Stake Tokens

Stake tokens in a pool:

```js
async function stake(token, amount) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'stake',
      payload: {
        token: token, // Token symbol
        amount: amount // Amount to stake
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Unstake Tokens

Unstake tokens from a pool:

```js
async function unstake(token, amount) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'unstake',
      payload: {
        token: token, // Token symbol
        amount: amount // Amount to unstake
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

## Market Operations

### Create a Market

Create a new market for token trading:

```js
async function createMarket(baseToken, quoteToken) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'create_market',
      payload: {
        baseToken: baseToken, // Base token symbol
        quoteToken: quoteToken // Quote token symbol
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Place an Order

Place a buy or sell order on a market:

```js
async function placeOrder(market, orderType, price, amount) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'place_order',
      payload: {
        market: market, // Market ID (e.g., "ECHELON:STEEM")
        type: orderType, // "buy" or "sell"
        price: price, // Order price
        amount: amount // Order amount
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

## NFT Operations

### Create a Collection

Create a new NFT collection:

```js
async function createCollection(symbol, name, metadata) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'create_collection',
      payload: {
        symbol: symbol, // Collection symbol
        name: name, // Collection name
        metadata: metadata // Collection metadata
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Transfer an NFT

Transfer an NFT to another account:

```js
async function transferNFT(collection, tokenId, recipient) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'transfer_nft',
      payload: {
        collection: collection, // Collection symbol
        tokenId: tokenId, // Token ID
        to: recipient // Recipient account name
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

## Governance Operations

### Chain Update Proposal

Create a proposal for updating the chain:

```js
async function chainUpdateCreate(title, description, url, changes) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'chain_update_create',
      payload: {
        title: title, // Proposal title
        description: description, // Proposal description
        url: url, // URL for more information
        changes: changes // Array of proposed changes
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Vote on a Proposal

Vote on a governance proposal:

```js
async function proposalVote(id, amount) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'proposal_vote',
      payload: {
        id: id, // Proposal ID
        amount: amount // Voting amount
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Edit a Proposal

Edit an existing proposal:

```js
async function proposalEdit(id, title, description, url) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'proposal_edit',
      payload: {
        id: id, // Proposal ID
        title: title, // New title
        description: description, // New description
        url: url // New URL
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

## Funding Operations

### Create a Funding Request

Create a new funding request:

```js
async function fundRequestCreate(title, description, url, requested, receiver) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'fund_request_create',
      payload: {
        title: title, // Request title
        description: description, // Request description
        url: url, // URL for more information
        requested: requested, // Amount requested
        receiver: receiver || authStore.state.username // Recipient of funds
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Contribute to a Funding Request

Contribute to an existing funding request:

```js
async function fundRequestContrib(id, amount) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'fund_request_contrib',
      payload: {
        id: id, // Funding request ID
        amount: amount // Contribution amount
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Submit Work for a Funded Request

Submit work for a funded request:

```js
async function fundRequestWork(id, work) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'fund_request_work',
      payload: {
        id: id, // Funding request ID
        work: work // Work details (object or JSON string)
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Review Work for a Funded Request

Review work submitted for a funded request:

```js
async function fundRequestWorkReview(id, approve, memo) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'fund_request_work_review',
      payload: {
        id: id, // Funding request ID
        approve: approve, // "true" or "false" as a string
        memo: memo // Review comments
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

## Miscellaneous Operations

### Transfer Native Tokens

Transfer native Meeray tokens:

```js
async function transfer(to, amount, memo = '') {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'transfer',
      payload: {
        to: to, // Recipient account
        amount: amount, // Amount to transfer
        memo: memo // Optional memo
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Store User JSON

Store JSON data for a user:

```js
async function userJson(jsonData) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'user_json',
      payload: {
        json: jsonData // JSON data to store
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Multisignature Queue

Queue a transaction for multi-signature:

```js
async function mdQueue(txtype, payload) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'md_queue',
      payload: {
        txtype: txtype, // Transaction type (number)
        payload: payload // Transaction payload
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

### Multisignature Sign

Sign a queued multi-signature transaction:

```js
async function mdSign(id) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [authStore.state.username],
    required_posting_auths: [],
    id: 'sidechain',
    json: JSON.stringify({
      contract: 'md_sign',
      payload: {
        id: id // Transaction ID to sign
      }
    })
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'active'
  });
}
```

## Error Handling

```js
async function safeMeerayTransaction(contract, payload, activeKey = null) {
  try {
    const authStore = useAuthStore();
    
    const tx = {
      required_auths: [authStore.state.username],
      required_posting_auths: [],
      id: 'sidechain',
      json: JSON.stringify({
        contract: contract,
        payload: payload
      })
    };
    
    const options = { requiredAuth: 'active' };
    
    // Add active key if provided
    if (activeKey) {
      options.activeKey = activeKey;
    }
    
    const response = await TransactionService.send('custom_json', tx, options);
    
    return {
      success: true,
      transactionId: response.id || response.result?.id,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorObj: error
    };
  }
}
```

## Complete Component Example

Here's a full component example that implements a token transfer form:

```vue
<template>
  <div class="echelon-token-transfer">
    <h3>Transfer Meeray Token</h3>
    
    <form @submit.prevent="sendTokenTransfer">
      <div class="form-group">
        <label for="token-symbol">Token Symbol</label>
        <input 
          id="token-symbol" 
          v-model="tokenSymbol" 
          type="text" 
          required 
          placeholder="ECHELON"
        />
      </div>
      
      <div class="form-group">
        <label for="token-amount">Amount</label>
        <input 
          id="token-amount" 
          v-model.number="tokenAmount" 
          type="number" 
          step="1" 
          min="1" 
          required 
          placeholder="1"
        />
      </div>
      
      <div class="form-group">
        <label for="recipient">Recipient</label>
        <input 
          id="recipient" 
          v-model="recipient" 
          type="text" 
          required 
          placeholder="Username"
        />
      </div>
      
      <div v-if="authStore.loginAuth === 'steem'" class="form-group">
        <label for="active-key">Active Key</label>
        <input 
          id="active-key" 
          v-model="activeKey" 
          type="password" 
          placeholder="Required for token transfers"
        />
      </div>
      
      <button 
        type="submit" 
        :disabled="isSubmitting || !authStore.state.isAuthenticated"
      >
        {{ isSubmitting ? 'Sending...' : 'Transfer Token' }}
      </button>
    </form>
    
    <div v-if="result.success" class="result success">
      Transaction successful! ID: {{ result.transactionId }}
    </div>
    
    <div v-if="result.error" class="result error">
      Error: {{ result.error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore, TransactionService } from 'steem-auth-vue';

const authStore = useAuthStore();

// Form fields
const tokenSymbol = ref('');
const tokenAmount = ref(1);
const recipient = ref('');
const activeKey = ref('');
const isSubmitting = ref(false);
const result = ref({
  success: false,
  error: '',
  transactionId: ''
});

// Submit the token transfer
async function sendTokenTransfer() {
  // Reset result
  result.value = {
    success: false,
    error: '',
    transactionId: ''
  };
  
  // Validate form
  if (!tokenSymbol.value) {
    result.value.error = 'Token symbol is required';
    return;
  }
  
  if (!tokenAmount.value || tokenAmount.value <= 0) {
    result.value.error = 'Amount must be greater than 0';
    return;
  }
  
  if (!recipient.value) {
    result.value.error = 'Recipient is required';
    return;
  }
  
  if (authStore.loginAuth === 'steem' && !activeKey.value) {
    result.value.error = 'Active key is required for token transfers';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Create the custom_json payload
    const tx = {
      required_auths: [authStore.state.username],
      required_posting_auths: [],
      id: 'sidechain',
      json: JSON.stringify({
        contract: 'transfer_token',
        payload: {
          symbol: tokenSymbol.value,
          amount: parseInt(tokenAmount.value),
          to: recipient.value
        }
      })
    };
    
    // Set options based on login type
    const options = {
      requiredAuth: 'active'
    };
    
    // Add active key if using direct login
    if (authStore.loginAuth === 'steem') {
      options.activeKey = activeKey.value;
    }
    
    // Send the transaction
    const response = await TransactionService.send('custom_json', tx, options);
    
    // Handle success
    result.value = {
      success: true,
      transactionId: response.id || response.result?.id
    };
    
    // Reset form
    tokenSymbol.value = '';
    tokenAmount.value = 1;
    recipient.value = '';
    activeKey.value = '';
  } catch (error) {
    // Handle error
    result.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.echelon-token-transfer {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  background-color: #1a75ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
}

button:hover {
  background-color: #0066cc;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.result {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
}

.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
</style>
```

This documentation covers the most common Meeray sidechain operations. For more detailed information, refer to the [Meeray GitHub repository](https://github.com/FutureShockco/echelon) or examine the Meeray contracts code for specific requirements of each contract. 