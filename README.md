# Steem Auth Vue

A Vue 3 component for Steem blockchain authentication and transactions.

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

### Transactions

Use the transaction components to send operations to the Steem blockchain:

```vue
<template>
  <div>
    <SteemAuth />
    <SteemTransactions v-if="authStore.state.isAuthenticated" />
  </div>
</template>

<script setup>
import { SteemAuth, SteemTransactions, useAuthStore } from 'steem-auth-vue';

const authStore = useAuthStore();
</script>
```

## Props

### SteemAuth Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| enableSteemLogin | Boolean | true | Enable SteemLogin authentication method |
| enableKeychain | Boolean | true | Enable Steem Keychain authentication method |
| enableDirectLogin | Boolean | true | Enable direct login with posting key |
| defaultDarkMode | Boolean | false | Start with dark theme by default |

## Events

### SteemAuth Component

| Event | Payload | Description |
|-------|---------|-------------|
| theme-change | Boolean | Emitted when the theme changes. The boolean indicates whether dark mode is active (true) or not (false). |

## License

MIT

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


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
