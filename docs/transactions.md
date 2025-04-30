# Using Transactions Without Components

This guide explains how to use the `TransactionService` directly to send transactions to the Steem blockchain and Echelon sidechain without using the provided Vue components.

## Overview

The Steem Auth Vue package provides components for sending transactions (`SteemTransactions` and `EchelonTransactions`), but sometimes you might need more flexibility to create custom interfaces or workflows. The `TransactionService` allows you to send transactions programmatically.

## Basic Usage

First, import the necessary services:

```js
import { useAuthStore, TransactionService } from 'steem-auth-vue';
```

The `TransactionService` provides a `send` method that handles all transaction types.

## Steem Blockchain Transactions

### Basic Steem Transaction

Here's a simple example of sending a transfer operation:

```js
async function sendTransfer() {
  try {
    const authStore = useAuthStore();
    
    // Define the transfer operation data
    const tx = {
      from: authStore.state.username,
      to: 'recipient-username',
      amount: '0.001 STEEM',
      memo: 'Payment for services'
    };
    
    // Send the transfer operation
    const response = await TransactionService.send('transfer', tx, {
      requiredAuth: 'active' // Transfers require active authority
    });
    
    console.log('Transaction ID:', response.id);
    return response;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
}
```

### Vote on Content

Here's how to vote on a post or comment:

```js
async function voteOnContent(author, permlink, weight = 10000) {
  try {
    const authStore = useAuthStore();
    
    // Define the vote operation data
    const tx = {
      voter: authStore.state.username,
      author: author,
      permlink: permlink,
      weight: weight // 10000 = 100% upvote, -10000 = 100% downvote
    };
    
    // Send the vote operation
    const response = await TransactionService.send('vote', tx, {
      requiredAuth: 'posting' // Votes require posting authority
    });
    
    console.log('Vote successful, transaction ID:', response.id);
    return response;
  } catch (error) {
    console.error('Vote failed:', error);
    throw error;
  }
}
```

### Post a Comment

Example of posting a comment:

```js
async function postComment(parentAuthor, parentPermlink, permlink, title, body) {
  try {
    const authStore = useAuthStore();
    
    // Define metadata (tags, etc.)
    const jsonMetadata = {
      tags: ['test', 'steem-auth-vue'],
      app: 'steem-auth-vue/1.0.0'
    };
    
    // Define the comment operation data
    const tx = {
      parent_author: parentAuthor, // Empty for a new post, username for a reply
      parent_permlink: parentPermlink, // Main tag for a post, permlink for a reply
      author: authStore.state.username,
      permlink: permlink,
      title: title,
      body: body,
      json_metadata: JSON.stringify(jsonMetadata)
    };
    
    // Send the comment operation
    const response = await TransactionService.send('comment', tx, {
      requiredAuth: 'posting' // Comments require posting authority
    });
    
    console.log('Comment posted, transaction ID:', response.id);
    return response;
  } catch (error) {
    console.error('Comment failed:', error);
    throw error;
  }
}
```

### Following a User

Example of following a user:

```js
async function followUser(userToFollow) {
  try {
    const authStore = useAuthStore();
    
    // Define custom_json for follow operation
    const followOperation = {
      required_auths: [],
      required_posting_auths: [authStore.state.username],
      id: 'follow',
      json: JSON.stringify([
        'follow',
        {
          follower: authStore.state.username,
          following: userToFollow,
          what: ['blog'] // 'blog' to follow, empty array to unfollow
        }
      ])
    };
    
    // Send the custom_json operation
    const response = await TransactionService.send('custom_json', followOperation, {
      requiredAuth: 'posting' // Follow operations require posting authority
    });
    
    console.log('Follow successful, transaction ID:', response.id);
    return response;
  } catch (error) {
    console.error('Follow failed:', error);
    throw error;
  }
}
```

## Echelon Sidechain Transactions

Echelon is a sidechain built on top of Steem. Transactions for Echelon use the `custom_json` operation type with specific formats.

### Basic Echelon Transaction

Here's an example of sending an 'approve_node' operation to Echelon:

```js
async function approveNode(nodeAccount) {
  try {
    const authStore = useAuthStore();
    
    // Define the custom_json payload for Echelon
    const payload = {
      required_auths: [authStore.state.username],
      required_posting_auths: [],
      id: 'sidechain',
      json: JSON.stringify({
        contract: 'approve_node',
        payload: {
          target: nodeAccount
        }
      })
    };
    
    // Send the custom_json operation
    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active' // Most Echelon operations require active authority
    });
    
    console.log('Approve node successful, transaction ID:', response.id);
    return response;
  } catch (error) {
    console.error('Approve node failed:', error);
    throw error;
  }
}
```

### Creating a Token on Echelon

Example of creating a new token:

```js
async function createToken(symbol, name, precision, maxSupply) {
  try {
    const authStore = useAuthStore();
    
    // Define the custom_json payload for Echelon create_token
    const payload = {
      required_auths: [authStore.state.username],
      required_posting_auths: [],
      id: 'sidechain',
      json: JSON.stringify({
        contract: 'create_token',
        payload: {
          symbol: symbol,
          name: name,
          precision: precision,
          maxSupply: maxSupply
        }
      })
    };
    
    // Send the custom_json operation
    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active'
    });
    
    console.log('Token created, transaction ID:', response.id);
    return response;
  } catch (error) {
    console.error('Token creation failed:', error);
    throw error;
  }
}
```

### Transferring Tokens on Echelon

Example of transferring tokens:

```js
async function transferToken(symbol, amount, recipient) {
  try {
    const authStore = useAuthStore();
    
    // Define the custom_json payload for Echelon transfer_token
    const payload = {
      required_auths: [authStore.state.username],
      required_posting_auths: [],
      id: 'sidechain',
      json: JSON.stringify({
        contract: 'transfer_token',
        payload: {
          symbol: symbol,
          amount: amount,
          to: recipient
        }
      })
    };
    
    // Send the custom_json operation
    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active'
    });
    
    console.log('Token transferred, transaction ID:', response.id);
    return response;
  } catch (error) {
    console.error('Token transfer failed:', error);
    throw error;
  }
}
```

## Handling Active Key Operations

Some operations require the active key. For such cases, you can prompt users to enter their active key:

```js
async function sendWithActiveKey(amount, recipient, activeKey) {
  try {
    const authStore = useAuthStore();
    
    // Verify active key is provided
    if (!activeKey) {
      throw new Error('Active key is required for this operation');
    }
    
    // Define the transfer operation
    const tx = {
      from: authStore.state.username,
      to: recipient,
      amount: amount,
      memo: 'Payment with active key'
    };
    
    // Send the transaction with active key
    const response = await TransactionService.send('transfer', tx, {
      requiredAuth: 'active',
      activeKey: activeKey // Pass the active key
    });
    
    console.log('Transfer successful, transaction ID:', response.id);
    return response;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
}
```

## Authentication Considerations

1. **Keychain Authentication**: When using Steem Keychain, the user will be prompted to approve the transaction via the Keychain interface. No active or posting key handling is needed in your code.

2. **SteemLogin Authentication**: For operations requiring posting authority, the access token is used automatically. For active authority operations, the user must enter their active key.

3. **Direct Login**: Users who logged in with direct posting key authentication will need to provide their active key for active authority operations.

## Error Handling

The TransactionService throws errors that you should handle in your application:

```js
try {
  const response = await TransactionService.send(/*...*/);
  // Success handling
} catch (error) {
  if (error.message.includes('missing required active authority')) {
    // Handle missing active key error
  } else if (error.message.includes('does not have sufficient funds')) {
    // Handle insufficient funds error
  } else {
    // Handle other errors
  }
}
```

## Common Error Types

- **Authentication errors**: Missing or invalid keys
- **Insufficient funds**: Not enough balance for transfers
- **Rate limiting**: Too many transactions in a short period
- **Validation errors**: Invalid operation data

## Best Practices

1. Always check authentication status before attempting transactions
2. Provide clear feedback to users about transaction success or failure
3. Securely handle active keys (never store them, clear them from memory when done)
4. Use the correct auth level (posting vs active) for each operation
5. Handle errors gracefully with user-friendly messages

## Complete Example

Here's a complete Vue component example that handles both Steem and Echelon transactions:

```vue
<template>
  <div class="transactions">
    <h2>Transactions Demo</h2>
    
    <!-- Authentication Status -->
    <div class="auth-status">
      <p v-if="!authStore.state.isAuthenticated">
        Please log in to use transactions
      </p>
      <p v-else>
        Logged in as: {{ authStore.state.username }}
      </p>
    </div>
    
    <!-- Steem Transactions -->
    <div v-if="authStore.state.isAuthenticated" class="transaction-section">
      <h3>Steem Transactions</h3>
      
      <!-- Transfer -->
      <div class="transaction-card">
        <h4>Transfer STEEM</h4>
        <div class="form-group">
          <label for="transfer-to">Recipient:</label>
          <input id="transfer-to" v-model="transferTo" placeholder="username" />
        </div>
        <div class="form-group">
          <label for="transfer-amount">Amount:</label>
          <input id="transfer-amount" v-model="transferAmount" placeholder="0.001 STEEM" />
        </div>
        <div class="form-group">
          <label for="transfer-memo">Memo:</label>
          <input id="transfer-memo" v-model="transferMemo" placeholder="Optional memo" />
        </div>
        <button @click="sendTransfer">Send Transfer</button>
      </div>
      
      <!-- Vote -->
      <div class="transaction-card">
        <h4>Vote on Content</h4>
        <div class="form-group">
          <label for="vote-author">Author:</label>
          <input id="vote-author" v-model="voteAuthor" placeholder="username" />
        </div>
        <div class="form-group">
          <label for="vote-permlink">Permlink:</label>
          <input id="vote-permlink" v-model="votePermlink" placeholder="permlink" />
        </div>
        <div class="form-group">
          <label for="vote-weight">Weight (%):</label>
          <input id="vote-weight" v-model="voteWeight" type="number" min="-100" max="100" />
        </div>
        <button @click="sendVote">Submit Vote</button>
      </div>
    </div>
    
    <!-- Echelon Transactions -->
    <div v-if="authStore.state.isAuthenticated" class="transaction-section">
      <h3>Echelon Transactions</h3>
      
      <!-- Approve Node -->
      <div class="transaction-card">
        <h4>Approve Node</h4>
        <div class="form-group">
          <label for="node-account">Node Account:</label>
          <input id="node-account" v-model="nodeAccount" placeholder="username" />
        </div>
        <button @click="sendApproveNode">Approve Node</button>
      </div>
      
      <!-- Token Transfer -->
      <div class="transaction-card">
        <h4>Transfer Token</h4>
        <div class="form-group">
          <label for="token-symbol">Token Symbol:</label>
          <input id="token-symbol" v-model="tokenSymbol" placeholder="TOKEN" />
        </div>
        <div class="form-group">
          <label for="token-amount">Amount:</label>
          <input id="token-amount" v-model="tokenAmount" type="number" min="0" />
        </div>
        <div class="form-group">
          <label for="token-recipient">Recipient:</label>
          <input id="token-recipient" v-model="tokenRecipient" placeholder="username" />
        </div>
        <button @click="sendTokenTransfer">Transfer Token</button>
      </div>
    </div>
    
    <!-- Active Key Modal -->
    <div v-if="showActiveKeyModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Active Key Required</h3>
        <p>This operation requires your active key.</p>
        <div class="form-group">
          <label for="active-key">Active Key:</label>
          <input id="active-key" v-model="activeKey" type="password" placeholder="Enter your active key" />
        </div>
        <div class="modal-actions">
          <button @click="cancelActiveKey" class="cancel-button">Cancel</button>
          <button @click="confirmActiveKey" class="confirm-button">Confirm</button>
        </div>
      </div>
    </div>
    
    <!-- Transaction Result -->
    <div v-if="txResult" class="result success">
      <h3>Transaction Successful</h3>
      <p>Transaction ID: {{ txResult }}</p>
    </div>
    
    <div v-if="txError" class="result error">
      <h3>Transaction Failed</h3>
      <p>{{ txError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore, TransactionService } from 'steem-auth-vue';

// Auth store
const authStore = useAuthStore();

// Form fields - Steem
const transferTo = ref('');
const transferAmount = ref('0.001 STEEM');
const transferMemo = ref('');
const voteAuthor = ref('');
const votePermlink = ref('');
const voteWeight = ref(100);

// Form fields - Echelon
const nodeAccount = ref('');
const tokenSymbol = ref('');
const tokenAmount = ref(1);
const tokenRecipient = ref('');

// Active key modal
const activeKey = ref('');
const showActiveKeyModal = ref(false);
const pendingOperation = ref(null);

// Results
const txResult = ref('');
const txError = ref('');

// Reset results before new transaction
const resetResults = () => {
  txResult.value = '';
  txError.value = '';
};

// Steem Transactions
async function sendTransfer() {
  resetResults();
  
  if (authStore.loginAuth === 'steem') {
    // If using direct login, prompt for active key
    pendingOperation.value = {
      type: 'transfer',
      data: {
        from: authStore.state.username,
        to: transferTo.value,
        amount: transferAmount.value,
        memo: transferMemo.value
      }
    };
    showActiveKeyModal.value = true;
  } else {
    // For Keychain and SteemLogin
    try {
      const tx = {
        from: authStore.state.username,
        to: transferTo.value,
        amount: transferAmount.value,
        memo: transferMemo.value
      };
      
      const response = await TransactionService.send('transfer', tx, {
        requiredAuth: 'active'
      });
      
      txResult.value = response.id || response.result?.id;
    } catch (err) {
      txError.value = err instanceof Error ? err.message : 'Failed to send transfer';
    }
  }
}

async function sendVote() {
  resetResults();
  
  try {
    const weight = Math.floor(voteWeight.value * 100); // Convert % to basis points
    
    const tx = {
      voter: authStore.state.username,
      author: voteAuthor.value,
      permlink: votePermlink.value,
      weight: weight
    };
    
    const response = await TransactionService.send('vote', tx, {
      requiredAuth: 'posting'
    });
    
    txResult.value = response.id || response.result?.id;
  } catch (err) {
    txError.value = err instanceof Error ? err.message : 'Failed to send vote';
  }
}

// Echelon Transactions
async function sendApproveNode() {
  resetResults();
  
  if (authStore.loginAuth === 'steem') {
    // If using direct login, prompt for active key
    pendingOperation.value = {
      type: 'echelon_approve_node',
      data: {
        target: nodeAccount.value
      }
    };
    showActiveKeyModal.value = true;
  } else {
    try {
      const payload = {
        required_auths: [authStore.state.username],
        required_posting_auths: [],
        id: 'sidechain',
        json: JSON.stringify({
          contract: 'approve_node',
          payload: {
            target: nodeAccount.value
          }
        })
      };
      
      const response = await TransactionService.send('custom_json', payload, {
        requiredAuth: 'active'
      });
      
      txResult.value = response.id || response.result?.id;
    } catch (err) {
      txError.value = err instanceof Error ? err.message : 'Failed to approve node';
    }
  }
}

async function sendTokenTransfer() {
  resetResults();
  
  if (authStore.loginAuth === 'steem') {
    // If using direct login, prompt for active key
    pendingOperation.value = {
      type: 'echelon_token_transfer',
      data: {
        symbol: tokenSymbol.value,
        amount: parseInt(tokenAmount.value),
        to: tokenRecipient.value
      }
    };
    showActiveKeyModal.value = true;
  } else {
    try {
      const payload = {
        required_auths: [authStore.state.username],
        required_posting_auths: [],
        id: 'sidechain',
        json: JSON.stringify({
          contract: 'transfer_token',
          payload: {
            symbol: tokenSymbol.value,
            amount: parseInt(tokenAmount.value),
            to: tokenRecipient.value
          }
        })
      };
      
      const response = await TransactionService.send('custom_json', payload, {
        requiredAuth: 'active'
      });
      
      txResult.value = response.id || response.result?.id;
    } catch (err) {
      txError.value = err instanceof Error ? err.message : 'Failed to transfer token';
    }
  }
}

// Active key handling
function cancelActiveKey() {
  showActiveKeyModal.value = false;
  activeKey.value = '';
  pendingOperation.value = null;
}

async function confirmActiveKey() {
  if (!pendingOperation.value) return;
  
  try {
    if (pendingOperation.value.type === 'transfer') {
      const tx = pendingOperation.value.data;
      
      const response = await TransactionService.send('transfer', tx, {
        requiredAuth: 'active',
        activeKey: activeKey.value
      });
      
      txResult.value = response.id || response.result?.id;
    } 
    else if (pendingOperation.value.type === 'echelon_approve_node') {
      const payload = {
        required_auths: [authStore.state.username],
        required_posting_auths: [],
        id: 'sidechain',
        json: JSON.stringify({
          contract: 'approve_node',
          payload: {
            target: pendingOperation.value.data.target
          }
        })
      };
      
      const response = await TransactionService.send('custom_json', payload, {
        requiredAuth: 'active',
        activeKey: activeKey.value
      });
      
      txResult.value = response.id || response.result?.id;
    }
    else if (pendingOperation.value.type === 'echelon_token_transfer') {
      const data = pendingOperation.value.data;
      
      const payload = {
        required_auths: [authStore.state.username],
        required_posting_auths: [],
        id: 'sidechain',
        json: JSON.stringify({
          contract: 'transfer_token',
          payload: {
            symbol: data.symbol,
            amount: data.amount,
            to: data.to
          }
        })
      };
      
      const response = await TransactionService.send('custom_json', payload, {
        requiredAuth: 'active',
        activeKey: activeKey.value
      });
      
      txResult.value = response.id || response.result?.id;
    }
    
    // Close modal and clear active key
    showActiveKeyModal.value = false;
    activeKey.value = '';
    pendingOperation.value = null;
  } catch (err) {
    txError.value = err instanceof Error ? err.message : 'Transaction failed';
    // Keep modal open on error
  }
}
</script>

<style scoped>
.transactions {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.transaction-section {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.transaction-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #1a75ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background: #0066cc;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button {
  background: #f44336;
}

.result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
}

.success {
  background: #e8f5e9;
  border: 1px solid #4caf50;
}

.error {
  background: #ffebee;
  border: 1px solid #f44336;
}
</style>
```

This documentation and examples should give you a solid foundation for implementing custom transaction flows in your Vue application using the Steem Auth Vue package without relying on the built-in transaction components. 