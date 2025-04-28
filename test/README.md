# Steem Auth Vue Component Test App

This directory contains a test application for the Steem Auth Vue component. It's used for development and testing purposes.

## Development Testing

This test app imports the component directly from the built distribution files:

```js
// Import the component from the built distribution
import { SteemAuth } from '../dist/steem-auth-vue.es.js';
import '../dist/style.css';

// Import the auth store from the built distribution
import { useAuthStore } from '../dist/steem-auth-vue.es.js';
```

This approach allows us to test the actual built component as it will be used by consumers, rather than the source files.

## After Publishing

Once the component is published to npm, the imports would be simplified to:

```js
import { SteemAuth, useAuthStore } from 'steem-auth-vue';
```

And the package.json would include the dependency:

```json
"dependencies": {
  "steem-auth-vue": "^1.0.0"
}
```

## Running the Test App

First, build the component:
```
cd ..
npm run build
```

Then run the test app:
```
cd test
npm install
npm run dev
```

This will start a development server where you can test the component functionality. 