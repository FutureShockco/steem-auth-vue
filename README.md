# Steem Auth Vue Component

This project provides a Vue 3 authentication and transaction component library for the Steem blockchain, supporting multi-account management, secure PIN-based encryption, and a user-friendly UI/UX.

## Project Structure

- `src/index.ts` — main entry point for the component
- `src/components` — Vue component definitions (including `SteemAuth.vue`, `SteemTransactions.vue`, `PinModal.vue`)
- `src/services` — services for interacting with the Steem blockchain
- `src/utils` — utility functions
- `src/types` — TypeScript type definitions
- `dist/` — built component files (after running `npm run build`)
- `test/` — test application for testing the component

## Features

- **Multi-account support** with add, remove, and switch logic
- **PIN-based encryption** for secure posting key storage (see `PinModal.vue`)
- **Keychain and SteemLogin integration**
- **Schema-driven forms** for Steem operations
- **Defensive UI/UX** with error handling and feedback

## Development

- Vue 3 with TypeScript
- Vite for development and building
- Steem-related libraries: `dsteem`, `steem`, `steemlogin`

## Building the Component

Run:
```sh
npm run build
```
This will create the following files in the `dist` directory:
- `steem-auth-vue.es.js` — ES module version
- `steem-auth-vue.umd.js` — UMD version for browsers
- `style.css` — Component styles
- Type definition files

## Usage Example

Import the component and styles in your app:
```js
import { SteemAuth } from '../dist/steem-auth-vue.es.js';
import '../dist/style.css';
import { useAuthStore } from '../dist/steem-auth-vue.es.js';
```

Register and use the component in your template:
```vue
<template>
  <SteemAuth :appName="'MyApp'" :callbackURL="'http://localhost:3000/callback'" />
  <SteemTransactions />
</template>

<script setup>
import { SteemAuth } from '../dist/steem-auth-vue.es.js';
import { SteemTransactions } from '../dist/steem-auth-vue.es.js';
</script>
```

### PIN Modal
- The `PinModal` component is used for secure PIN entry and confirmation during login and transaction flows.
- PIN entry is required for encrypting/decrypting the posting key for Steem direct login accounts.

### Defensive Template Example
If you use dynamic forms or async data, always guard against undefined objects:
```vue
<form v-if="inputValues[operation.type]">
  <!-- form fields -->
</form>
```

## TypeScript Strictness & Best Practices

- **Unused variables in templates or functions will cause build errors.**
  - For unused variables in `v-for`, use `_` instead of a named variable (e.g., `(_, idx) in items`).
  - For unused function parameters, prefix with `_` (e.g., `function handler(_e) { ... }`).
- If you encounter build errors related to unused variables, check your component templates and scripts for unused `v-for` variables or function parameters and fix them as shown in `PinModal.vue`.

## Troubleshooting

### Build Errors: Unused Variables
**Error Example:**
```
error TS6133: 'digit' is declared but its value is never read.
```
**Solution:**
- Replace unused variables in `v-for` with `_`.
- Prefix unused function parameters with `_`.
- Remove unused imports.

### Runtime Errors: Cannot read properties of undefined/null
If you see errors like `Cannot read properties of undefined (reading 'from')` or similar, ensure you are guarding against undefined objects in your templates (e.g., use `v-if` to check objects exist before accessing their properties). For dynamic or async data, always check that required objects/arrays are initialized before rendering components or forms.

### Modal/Component Errors
If you use modals or dynamic components, always ensure required props are present and valid when the component is rendered. Use defensive `v-if` checks as needed.

---

For more details, see the code comments and the `PinModal.vue` example for best practices.

## Installation

```bash
npm install steem-auth-vue
```

## Usage

### Basic Usage

```vue
<template>
  <div>
    <SteemAuth />
  </div>
</template>

<script setup>
import { SteemAuth } from 'steem-auth-vue';
import 'steem-auth-vue/dist/style.css'; // Import styles
</script>
```

### Customizing Authentication Methods

You can customize which authentication methods are available by passing props to the SteemAuth component:

```vue
<template>
  <div>
    <!-- Only enable SteemLogin (disable Keychain and direct login) -->
    <SteemAuth 
      :enableSteemLogin="true"
      :enableKeychain="false"
      :enableDirectLogin="false"
    />

    <!-- Only enable Keychain authentication -->
    <SteemAuth 
      :enableSteemLogin="false"
      :enableKeychain="true"
      :enableDirectLogin="false"
    />

    <!-- Only enable direct login with posting key -->
    <SteemAuth 
      :enableSteemLogin="false"
      :enableKeychain="false"
      :enableDirectLogin="true"
    />
  </div>
</template>

<script setup>
import { SteemAuth } from 'steem-auth-vue';
import 'steem-auth-vue/dist/style.css'; // Import styles
</script>
```

### Dark Theme Support

The component supports both light and dark themes. Users can toggle between themes using the built-in theme toggle button. You can also set the default theme:

```vue
<template>
  <div>
    <!-- Start with dark theme by default -->
    <SteemAuth :defaultDarkMode="true" @theme-change="handleThemeChange" />
  </div>
</template>

<script setup>
import { SteemAuth } from 'steem-auth-vue';
import 'steem-auth-vue/dist/style.css'; // Import styles

const handleThemeChange = (isDark) => {
  console.log('Theme changed:', isDark ? 'dark' : 'light');
  // You can apply additional theme changes to your app based on this event
};
</script>
```

### Using the Auth Store

Access the authentication state in your components:

```vue
<template>
  <div>
    <p v-if="authStore.state.isAuthenticated">
      Logged in as: {{ authStore.state.username }}
    </p>
    <p v-else>
      Not logged in
    </p>
  </div>
</template>

<script setup>
import { useAuthStore } from 'steem-auth-vue';

const authStore = useAuthStore();
</script>
```

### Transaction Components

Use the transaction components to send operations to the Steem blockchain or Echelon sidechain:

```vue
<template>
  <div>
    <SteemAuth />
    <!-- For Steem blockchain transactions -->
    <SteemTransactions v-if="authStore.state.isAuthenticated" />
    
    <!-- For Echelon sidechain transactions -->
    <EchelonTransactions v-if="authStore.state.isAuthenticated" />
  </div>
</template>

<script setup>
import { SteemAuth, SteemTransactions, EchelonTransactions, useAuthStore } from 'steem-auth-vue';
import 'steem-auth-vue/dist/style.css'; // Import styles

const authStore = useAuthStore();
</script>
```

## Echelon Sidechain Support

This component supports [Echelon](https://github.com/FutureShockco/echelon), a next generation sidechain for the Steem blockchain that provides advanced features like tokens, NFTs, markets, and staking.

### Using Transactions Service Directly

If you need more flexibility than the provided components, you can use the TransactionService directly:

#### Sending Steem Blockchain Transactions

```vue
<template>
  <div>
    <button @click="sendTransfer" :disabled="!authStore.state.isAuthenticated">
      Send 0.001 STEEM to recipient
    </button>
    <div v-if="result">Transaction ID: {{ result }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore, TransactionService } from 'steem-auth-vue';

const authStore = useAuthStore();
const result = ref('');
const error = ref('');

async function sendTransfer() {
  try {
    // Clear previous results
    result.value = '';
    error.value = '';
    
    // Set up transaction data
    const tx = {
      from: authStore.state.username,
      to: 'recipient-username',
      amount: '0.001 STEEM',
      memo: 'Payment for services'
    };
    
    // Send the transaction
    const response = await TransactionService.send('transfer', tx, {
      requiredAuth: 'active' // 'active' or 'posting' depending on operation type
    });
    
    // Handle the response
    result.value = response.id || response.result?.id;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send transaction';
  }
}
</script>
```

#### Sending Echelon Sidechain Transactions

```vue
<template>
  <div>
    <button @click="approveNode" :disabled="!authStore.state.isAuthenticated">
      Approve Node
    </button>
    <div v-if="result">Transaction ID: {{ result }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore, TransactionService } from 'steem-auth-vue';

const authStore = useAuthStore();
const result = ref('');
const error = ref('');

async function approveNode() {
  try {
    // Clear previous results
    result.value = '';
    error.value = '';
    
    // Create the custom_json payload for an Echelon operation
    const payload = {
      required_auths: [authStore.state.username],
      required_posting_auths: [],
      id: 'sidechain',
      json: JSON.stringify({
        contract: 'approve_node',
        payload: {
          target: 'node-account-name'
        }
      })
    };
    
    // Send the transaction
    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active'
    });
    
    // Handle the response
    result.value = response.id || response.result?.id;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send transaction';
  }
}
</script>
```

## Documentation

For detailed documentation on all available operations:

- [Steem Transactions](./docs/steem-transactions.md) - Complete guide for Steem blockchain operations
- [Echelon Transactions](./docs/echelon-transactions.md) - Complete guide for Echelon sidechain operations

## License

MIT

## Features

- Steem Keychain integration
- SteemLogin support
- Direct posting key authentication
- Persistent authentication state
- TypeScript support
- Pinia store integration
- Steem blockchain transactions
- Echelon sidechain transactions

## Authentication Methods

1. **Steem Keychain**
   - Uses the Steem Keychain browser extension
   - No need to enter posting keys
   - Most secure method

2. **SteemLogin**
   - OAuth-based authentication
   - Token-based authentication

3. **Direct Posting Key**
   - Manual posting key entry
   - Basic authentication method

## Environment Variables

Create a `.env` file in your project root:

```env
VITE_APP_NAME=your-app-name
```

## Development

```bash
# Install dependencies
npm install

# Build the component
npm run build

# Test the component
cd test
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
