<template>
  <div v-if="show" class="steem-auth-modal-overlay" @click="closeModal">
    <div class="steem-auth-modal-content" @click.stop>
      <div class="steem-auth-modal-header">
        <h2>Active Key Required</h2>
        <button class="steem-auth-close-button" @click="closeModal">&times;</button>
      </div>

      <div class="steem-auth-modal-body">
        <div class="form-group">
          <label for="active-key">Active Key</label>
          <input
            id="active-key"
            v-model="activeKey"
            type="password"
            placeholder="Enter your active key"
            class="steem-auth-input"
            :class="{ 'error': error }"
          />
          <span v-if="error" class="steem-auth-error-text">{{ error }}</span>
        </div>

        <div class="steem-auth-operation-info">
          <h3>Operation Details</h3>
          <p><strong>Type:</strong> {{ operation.type }}</p>
          <p><strong>Required Auth:</strong> {{ operation.requiredAuth }}</p>
        </div>

        <button @click="handleSubmit" class="steem-auth-button full-width" :disabled="loading">
          <span v-if="loading" class="steem-auth-spinner"></span>
          <span>{{ loading ? 'Processing...' : 'Submit' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PrivateKey } from 'dsteem';
import { useAuthStore } from '../stores/auth';
import TransactionService from '../services/transaction';

// Define the extended operation type that includes field values
type ExtendedOperation = {
  type: string;
  fields: Record<string, any>;
  requiredAuth: 'active' | 'posting';
  fieldValues: Record<string, any>;
};

const props = defineProps<{
  show: boolean;
  operation: ExtendedOperation;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', activeKey: string): Promise<void>;
  (e: 'success', result: any): void;
}>();

const activeKey = ref('');
const error = ref('');
const loading = ref(false);
const authStore = useAuthStore();

const verifyActiveKey = (privateKey: string): boolean => {
  try {
    const key = PrivateKey.fromString(privateKey);
    const publicKey = key.createPublic().toString();
    
    // Log the public key derived from the private key
    console.log('Derived public key:', publicKey);
    
    // Log the account's active public key for comparison
    console.log('Account active key:', authStore.state.account?.active.key_auths[0][0]);
    
    return publicKey === authStore.state.account?.active.key_auths[0][0];
  } catch (err) {
    console.error('Error verifying active key:', err);
    return false;
  }
};

const closeModal = () => {
  console.log('Closing modal...');
  activeKey.value = '';
  error.value = '';
  loading.value = false;
  emit('close');
};

const handleSubmit = async () => {
  if (!activeKey.value) {
    error.value = 'Active key is required';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    console.log('Verifying active key...');
    // Verify the active key by deriving the public key
    if (!verifyActiveKey(activeKey.value)) {
      error.value = 'Invalid active key. The provided key does not match your account\'s active public key.';
      loading.value = false;
      return;
    }
    
    console.log('Active key verified successfully.');

    // Build the transaction payload
    const tx = {} as any;
    Object.keys(props.operation.fields).forEach((key) => {
      // Special handling for JSON fields
      if ((props.operation.type === 'custom_json' && key === 'json') ||
          (props.operation.type === 'escrow_transfer' && key === 'json_meta') ||
          (key.includes('json_meta'))) {
        
        if (typeof props.operation.fieldValues[key] !== 'string') {
          tx[key] = JSON.stringify(props.operation.fieldValues[key]);
        } else {
          tx[key] = props.operation.fieldValues[key];
        }
      } else {
        tx[key] = props.operation.fieldValues[key];
      }
    });

    console.log('Sending transaction with payload:', tx);
    console.log('Operation type:', props.operation.type);
    console.log('Required auth:', props.operation.requiredAuth);

    // Send the transaction
    const result = await TransactionService.send(
      props.operation.type,
      tx,
      { requiredAuth: 'active', activeKey: activeKey.value }
    );

    // If we get here, the transaction was successful
    console.log('Transaction successful, emitting success and closing modal');
    emit('success', result);
    closeModal();
  } catch (err: any) {
    console.error('Transaction error:', err);
    
    // Handle RPCError format
    if (err.name === 'RPCError') {
      console.log('RPC Error details:', err.jse_info);
      
      if (err.message.includes('missing required active authority')) {
        error.value = 'Missing active authority. The blockchain rejected your active key. Please ensure you are using the correct active key for this account.';
      } else if (err.message.includes('does not have sufficient funds')) {
        // Get the actual transfer amount from the operation
        const amount = props.operation.fieldValues.amount as string || '0';
        const [amountValue, currency] = amount.split(' ');
        
        error.value = `Insufficient funds. Required: ${amountValue} ${currency}, Available: 0 ${currency}`;
      } else if (err.message.includes('missing required posting authority')) {
        error.value = 'Missing required posting authority';
      } else if (err.message.includes('invalid_scope')) {
        error.value = 'Invalid scope for this operation';
      } else {
        // For other RPC errors, try to extract a user-friendly message
        const message = err.message.split(':')[1]?.trim() || err.message;
        error.value = message;
      }
    } else {
      // Handle non-RPC errors
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred';
    }
  } finally {
    loading.value = false;
  }
};
</script>