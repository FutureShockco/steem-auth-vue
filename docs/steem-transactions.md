# Steem Blockchain Transactions

This guide provides examples of how to use the `TransactionService` to send various types of transactions to the Steem blockchain.

## Basic Usage

First, import the necessary services:

```js
import { useAuthStore, TransactionService } from 'steem-auth-vue';
```

The basic pattern for sending any Steem transaction is:

```js
// 1. Create the transaction data
const tx = { /* operation-specific data */ };

// 2. Send the transaction
const response = await TransactionService.send(
  'operation_type', 
  tx, 
  { 
    requiredAuth: 'posting' | 'active',
    activeKey: 'your-active-key' // Only needed for active operations with direct login
  }
);

// 3. Handle the response
console.log('Transaction ID:', response.id);
```

## Account Operations

### Transfer STEEM/SBD

Send STEEM or SBD to another account:

```js
async function transfer(to, amount, memo = '') {
  const authStore = useAuthStore();
  
  const tx = {
    from: authStore.state.username,
    to: to, // Recipient username
    amount: amount, // Format: '0.001 STEEM' or '1.000 SBD'
    memo: memo
  };
  
  return await TransactionService.send('transfer', tx, {
    requiredAuth: 'active'
  });
}
```

### Delegate Vesting Shares

Delegate Steem Power to another account:

```js
async function delegateVestingShares(delegatee, vestingShares) {
  const authStore = useAuthStore();
  
  const tx = {
    delegator: authStore.state.username,
    delegatee: delegatee, // Username to delegate to
    vesting_shares: vestingShares // Format: '10000.000000 VESTS'
  };
  
  return await TransactionService.send('delegate_vesting_shares', tx, {
    requiredAuth: 'active'
  });
}
```

### Transfer to Savings

Move funds to savings:

```js
async function transferToSavings(amount, memo = '') {
  const authStore = useAuthStore();
  
  const tx = {
    from: authStore.state.username,
    to: authStore.state.username, // Usually yourself
    amount: amount, // Format: '0.001 STEEM' or '1.000 SBD'
    memo: memo
  };
  
  return await TransactionService.send('transfer_to_savings', tx, {
    requiredAuth: 'active'
  });
}
```

### Transfer from Savings

Withdraw funds from savings:

```js
async function transferFromSavings(amount, memo = '') {
  const authStore = useAuthStore();
  
  const tx = {
    from: authStore.state.username,
    to: authStore.state.username, // Usually yourself
    request_id: Date.now(), // Unique ID for this request
    amount: amount, // Format: '0.001 STEEM' or '1.000 SBD'
    memo: memo
  };
  
  return await TransactionService.send('transfer_from_savings', tx, {
    requiredAuth: 'active'
  });
}
```

### Power Up (Stake)

Convert STEEM to Steem Power:

```js
async function powerUp(amount) {
  const authStore = useAuthStore();
  
  const tx = {
    from: authStore.state.username,
    to: authStore.state.username, // Usually yourself
    amount: amount // Format: '0.001 STEEM'
  };
  
  return await TransactionService.send('transfer_to_vesting', tx, {
    requiredAuth: 'active'
  });
}
```

### Power Down (Unstake)

Withdraw Steem Power to STEEM (initiates withdrawal schedule):

```js
async function powerDown(vestingShares) {
  const authStore = useAuthStore();
  
  const tx = {
    account: authStore.state.username,
    vesting_shares: vestingShares // Format: '10000.000000 VESTS' or '0.000000 VESTS' to stop power down
  };
  
  return await TransactionService.send('withdraw_vesting', tx, {
    requiredAuth: 'active'
  });
}
```

### Set Withdrawal Route

Set where to send Power Down payments:

```js
async function setWithdrawVestingRoute(toAccount, percent, autoVest = false) {
  const authStore = useAuthStore();
  
  const tx = {
    from_account: authStore.state.username,
    to_account: toAccount,
    percent: percent, // 0-10000 (100.00%)
    auto_vest: autoVest // If true, incoming funds are automatically powered up
  };
  
  return await TransactionService.send('set_withdraw_vesting_route', tx, {
    requiredAuth: 'active'
  });
}
```

## Content Operations

### Vote on Content

Upvote or downvote a post or comment:

```js
async function vote(author, permlink, weight) {
  const authStore = useAuthStore();
  
  const tx = {
    voter: authStore.state.username,
    author: author, // Post author
    permlink: permlink, // Post permlink
    weight: weight // -10000 to 10000 (100% downvote to 100% upvote)
  };
  
  return await TransactionService.send('vote', tx, {
    requiredAuth: 'posting'
  });
}
```

### Create a Post

Create a new post (top-level content):

```js
async function createPost(title, body, tags = ['test']) {
  const authStore = useAuthStore();
  const permlink = `${new Date().toISOString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-post`;
  
  // Create JSON metadata
  const jsonMetadata = {
    tags: tags,
    app: 'steem-auth-vue/1.0.0'
  };
  
  const tx = {
    parent_author: '', // Empty for new post
    parent_permlink: tags[0], // Main category/tag
    author: authStore.state.username,
    permlink: permlink,
    title: title,
    body: body,
    json_metadata: JSON.stringify(jsonMetadata)
  };
  
  return await TransactionService.send('comment', tx, {
    requiredAuth: 'posting'
  });
}
```

### Create a Comment/Reply

Reply to an existing post or comment:

```js
async function createComment(parentAuthor, parentPermlink, body) {
  const authStore = useAuthStore();
  const permlink = `re-${parentPermlink.substring(0, 8)}-${new Date().toISOString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
  
  // Create JSON metadata
  const jsonMetadata = {
    tags: ['test'],
    app: 'steem-auth-vue/1.0.0'
  };
  
  const tx = {
    parent_author: parentAuthor,
    parent_permlink: parentPermlink,
    author: authStore.state.username,
    permlink: permlink,
    title: '', // Empty for comments
    body: body,
    json_metadata: JSON.stringify(jsonMetadata)
  };
  
  return await TransactionService.send('comment', tx, {
    requiredAuth: 'posting'
  });
}
```

### Edit a Post or Comment

Edit your existing content:

```js
async function editContent(permlink, title, body, jsonMetadata) {
  const authStore = useAuthStore();
  
  const tx = {
    parent_author: '', // Must match the original
    parent_permlink: '', // Must match the original
    author: authStore.state.username,
    permlink: permlink, // Must match the permlink of the content to edit
    title: title, // New title (leave empty for comments)
    body: body, // New body
    json_metadata: typeof jsonMetadata === 'string' ? jsonMetadata : JSON.stringify(jsonMetadata)
  };
  
  return await TransactionService.send('comment', tx, {
    requiredAuth: 'posting'
  });
}
```

### Delete a Post or Comment

Delete your content:

```js
async function deleteContent(permlink) {
  const authStore = useAuthStore();
  
  const tx = {
    author: authStore.state.username,
    permlink: permlink
  };
  
  return await TransactionService.send('delete_comment', tx, {
    requiredAuth: 'posting'
  });
}
```

### Reblog/Resteem a Post

Reblog someone else's post to your followers:

```js
async function reblog(author, permlink) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [],
    required_posting_auths: [authStore.state.username],
    id: 'follow',
    json: JSON.stringify([
      'reblog',
      {
        account: authStore.state.username,
        author: author,
        permlink: permlink
      }
    ])
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'posting'
  });
}
```

## Social Operations

### Follow a User

Follow another user:

```js
async function followUser(userToFollow) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [],
    required_posting_auths: [authStore.state.username],
    id: 'follow',
    json: JSON.stringify([
      'follow',
      {
        follower: authStore.state.username,
        following: userToFollow,
        what: ['blog'] // 'blog' to follow
      }
    ])
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'posting'
  });
}
```

### Unfollow a User

Stop following a user:

```js
async function unfollowUser(userToUnfollow) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [],
    required_posting_auths: [authStore.state.username],
    id: 'follow',
    json: JSON.stringify([
      'follow',
      {
        follower: authStore.state.username,
        following: userToUnfollow,
        what: [] // Empty array to unfollow
      }
    ])
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'posting'
  });
}
```

### Mute a User

Mute a user to hide their content:

```js
async function muteUser(userToMute) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: [],
    required_posting_auths: [authStore.state.username],
    id: 'follow',
    json: JSON.stringify([
      'follow',
      {
        follower: authStore.state.username,
        following: userToMute,
        what: ['ignore'] // 'ignore' to mute
      }
    ])
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: 'posting'
  });
}
```

## Witness Operations

### Vote for a Witness

Vote for a Steem witness:

```js
async function witnessVote(witness, approve = true) {
  const authStore = useAuthStore();
  
  const tx = {
    account: authStore.state.username,
    witness: witness,
    approve: approve // true to vote, false to remove vote
  };
  
  return await TransactionService.send('account_witness_vote', tx, {
    requiredAuth: 'active'
  });
}
```

### Update Witness Info

Update your witness information (only for witness accounts):

```js
async function witnessUpdate(url, blockSigningKey, fee, properties) {
  const authStore = useAuthStore();
  
  const tx = {
    owner: authStore.state.username,
    url: url,
    block_signing_key: blockSigningKey,
    props: properties,
    fee: fee // Format: '0.000 STEEM'
  };
  
  return await TransactionService.send('witness_update', tx, {
    requiredAuth: 'active'
  });
}
```

## Escrow Operations

### Create an Escrow

Create an escrow transfer:

```js
async function escrowTransfer(to, agent, escrowId, steemAmount, sbdAmount, fee, ratificationDeadline, escrowExpiration, jsonMeta = '') {
  const authStore = useAuthStore();
  
  const tx = {
    from: authStore.state.username,
    to: to,
    agent: agent,
    escrow_id: escrowId,
    steem_amount: steemAmount, // Format: '0.001 STEEM'
    sbd_amount: sbdAmount, // Format: '0.000 SBD'
    fee: fee, // Format: '0.001 STEEM'
    ratification_deadline: ratificationDeadline, // ISO date string
    escrow_expiration: escrowExpiration, // ISO date string
    json_meta: jsonMeta
  };
  
  return await TransactionService.send('escrow_transfer', tx, {
    requiredAuth: 'active'
  });
}
```

### Approve an Escrow

Approve an escrow as the recipient or agent:

```js
async function escrowApprove(from, to, agent, escrowId, approve) {
  const authStore = useAuthStore();
  
  const tx = {
    from: from,
    to: to,
    agent: agent,
    who: authStore.state.username, // Your role (must be 'to' or 'agent')
    escrow_id: escrowId,
    approve: approve // true to approve, false to reject
  };
  
  return await TransactionService.send('escrow_approve', tx, {
    requiredAuth: 'active'
  });
}
```

### Release Escrow Funds

Release funds from an escrow:

```js
async function escrowRelease(from, to, agent, escrowId, receiver, steemAmount, sbdAmount) {
  const authStore = useAuthStore();
  
  const tx = {
    from: from,
    to: to,
    agent: agent,
    who: authStore.state.username, // Your role (must be 'from', 'to', or 'agent')
    receiver: receiver, // Who receives the funds
    escrow_id: escrowId,
    steem_amount: steemAmount, // Format: '0.001 STEEM'
    sbd_amount: sbdAmount // Format: '0.000 SBD'
  };
  
  return await TransactionService.send('escrow_release', tx, {
    requiredAuth: 'active'
  });
}
```

### Dispute an Escrow

Initiate a dispute for an escrow:

```js
async function escrowDispute(from, to, agent, escrowId) {
  const authStore = useAuthStore();
  
  const tx = {
    from: from,
    to: to,
    agent: agent,
    who: authStore.state.username, // Your role (must be 'from' or 'to')
    escrow_id: escrowId
  };
  
  return await TransactionService.send('escrow_dispute', tx, {
    requiredAuth: 'active'
  });
}
```

## Custom JSON Operations

### Generic Custom JSON

Send any custom JSON operation:

```js
async function sendCustomJson(id, json, requiresActive = false) {
  const authStore = useAuthStore();
  
  const tx = {
    required_auths: requiresActive ? [authStore.state.username] : [],
    required_posting_auths: !requiresActive ? [authStore.state.username] : [],
    id: id, // The ID that identifies this custom_json operation
    json: typeof json === 'string' ? json : JSON.stringify(json)
  };
  
  return await TransactionService.send('custom_json', tx, {
    requiredAuth: requiresActive ? 'active' : 'posting'
  });
}
```

## Handling Active Key Operations

For operations that require the active key:

```js
async function sendActiveKeyOperation(operationType, operationData, activeKey) {
  // Verify active key is provided
  if (!activeKey) {
    throw new Error('Active key is required for this operation');
  }
  
  return await TransactionService.send(operationType, operationData, {
    requiredAuth: 'active',
    activeKey: activeKey
  });
}
```

## Error Handling

```js
async function safeTransaction(operationType, operationData, options) {
  try {
    const response = await TransactionService.send(operationType, operationData, options);
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

Here's a full component example that implements a transfer form:

```vue
<template>
  <div class="steem-transfer">
    <h3>Send STEEM</h3>
    
    <form @submit.prevent="sendTransfer">
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
      
      <div class="form-group">
        <label for="amount">Amount</label>
        <div class="amount-input">
          <input 
            id="amount" 
            v-model="amount" 
            type="number" 
            step="0.001" 
            min="0.001" 
            required 
            placeholder="0.001"
          />
          <select v-model="currency">
            <option value="STEEM">STEEM</option>
            <option value="SBD">SBD</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="memo">Memo (optional)</label>
        <textarea 
          id="memo" 
          v-model="memo" 
          placeholder="Add a memo"
          rows="3"
        ></textarea>
      </div>
      
      <div v-if="authStore.loginAuth === 'steem'" class="form-group">
        <label for="active-key">Active Key</label>
        <input 
          id="active-key" 
          v-model="activeKey" 
          type="password" 
          placeholder="Required for transfers"
        />
      </div>
      
      <button 
        type="submit" 
        :disabled="isSubmitting || !authStore.state.isAuthenticated"
      >
        {{ isSubmitting ? 'Sending...' : 'Send Transfer' }}
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
import { ref, computed } from 'vue';
import { useAuthStore, TransactionService } from 'steem-auth-vue';

const authStore = useAuthStore();

// Form fields
const recipient = ref('');
const amount = ref('0.001');
const currency = ref('STEEM');
const memo = ref('');
const activeKey = ref('');
const isSubmitting = ref(false);
const result = ref({
  success: false,
  error: '',
  transactionId: ''
});

// Computed full amount with currency
const fullAmount = computed(() => {
  return `${parseFloat(amount.value).toFixed(3)} ${currency.value}`;
});

// Submit the transfer
async function sendTransfer() {
  // Reset result
  result.value = {
    success: false,
    error: '',
    transactionId: ''
  };
  
  // Validate form
  if (!recipient.value) {
    result.value.error = 'Recipient is required';
    return;
  }
  
  if (!amount.value || parseFloat(amount.value) <= 0) {
    result.value.error = 'Amount must be greater than 0';
    return;
  }
  
  if (authStore.loginAuth === 'steem' && !activeKey.value) {
    result.value.error = 'Active key is required for transfers';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Create transfer data
    const transferData = {
      from: authStore.state.username,
      to: recipient.value,
      amount: fullAmount.value,
      memo: memo.value
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
    const response = await TransactionService.send('transfer', transferData, options);
    
    // Handle success
    result.value = {
      success: true,
      transactionId: response.id || response.result?.id
    };
    
    // Reset form
    recipient.value = '';
    amount.value = '0.001';
    memo.value = '';
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
.steem-transfer {
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

input, textarea, select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.amount-input {
  display: flex;
  gap: 10px;
}

.amount-input input {
  flex: 1;
}

.amount-input select {
  width: 100px;
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

This documentation covers the most common Steem blockchain operations. For more detailed information, refer to the [Steem developer portal](https://developers.steem.io/) or the [Steem API documentation](https://developers.steem.io/apidefinitions/).

# Steem Transactions Guide

This guide explains how to use the Steem authentication and transaction components for the Steem blockchain.

## Using the SteemTransactions Component

Import and register the component:

```vue
<template>
  <SteemAuth :appName="'MyApp'" :callbackURL="'http://localhost:3000/callback'" />
  <SteemTransactions />
</template>

<script setup>
import { SteemAuth, SteemTransactions } from 'steem-auth-vue';
import 'steem-auth-vue/dist/style.css';
</script>
```

### PIN Modal Integration
- When using direct posting key login, the `PinModal` will prompt the user to set or enter a 4-digit PIN for secure key encryption.
- The PIN is required for sending transactions that require the posting or active key.

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

### Sending a Transfer
```vue
<template>
  <SteemAuth />
  <SteemTransactions />
</template>
```
- Fill in the transfer form and click Send. If using direct login, you will be prompted for your PIN.

### Troubleshooting

#### Build Errors: Unused Variables
- Use `_` for unused variables in `v-for` and prefix unused function parameters with `_`.

#### Runtime Errors: Cannot read properties of undefined/null
- Use `v-if` guards to ensure objects exist before accessing their properties.

#### PIN Modal Issues
- If the PIN modal does not appear or PIN entry fails, ensure you are using the latest version and that your login flow is correct.

---
For more details, see the main README and the `PinModal.vue` example. 