# Steem Auth Vue

A Vue 3 authentication component for Steem blockchain that supports Steem Keychain and SteemLogin.

## Installation

```bash
npm install steem-auth-vue
```

## Usage

### Basic Setup

```vue
<template>
  <SteemAuth />
</template>

<script setup>
import { SteemAuth } from 'steem-auth-vue';
</script>
```

### With Pinia Store

```vue
<template>
  <SteemAuth />
</template>

<script setup>
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { SteemAuth, useAuthStore } from 'steem-auth-vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
</script>
```

### Accessing Auth State

```vue
<template>
  <div v-if="isAuthenticated">
    Welcome, {{ username }}!
  </div>
</template>

<script setup>
import { useAuthStore } from 'steem-auth-vue';

const authStore = useAuthStore();
const isAuthenticated = authStore.isAuthenticated;
const username = authStore.username;
</script>
```

## Features

- Steem Keychain integration
- SteemLogin support
- Direct posting key authentication
- Persistent authentication state
- TypeScript support
- Pinia store integration

## Authentication Methods

1. **Steem Keychain**
   - Uses the Steem Keychain browser extension
   - No need to enter posting keys
   - Most secure method

2. **SteemLogin**
   - OAuth-based authentication
   - Requires SteemLogin account
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

# Run development server
npm run dev

# Build for production
npm run build
```
