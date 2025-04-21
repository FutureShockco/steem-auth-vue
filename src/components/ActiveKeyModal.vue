<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Active Key Required</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="active-key">Active Key</label>
          <input
            id="active-key"
            v-model="activeKey"
            type="password"
            placeholder="Enter your active key"
            :class="{ 'error': error }"
          />
          <span v-if="error" class="error-text">{{ error }}</span>
        </div>

        <div class="operation-info">
          <h3>Operation Details</h3>
          <p><strong>Type:</strong> {{ operation.type }}</p>
          <p><strong>Required Auth:</strong> {{ operation.requiredAuth }}</p>
        </div>

        <button @click="handleSubmit" class="submit-button" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Processing...' : 'Submit' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type OperationDefinition } from '../utils/operations';
import { PrivateKey } from 'dsteem';
import { useAuthStore } from '../stores/auth';
import client from '../helpers/client';
import TransactionService from '../services/transaction';

const props = defineProps<{
  show: boolean;
  operation: OperationDefinition;
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
    return publicKey === authStore.state.account?.active.key_auths[0][0];
  } catch (err) {
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
    // Verify the active key by deriving the public key
    if (!verifyActiveKey(activeKey.value)) {
      error.value = 'Invalid active key';
      loading.value = false;
      return;
    }

    // Build the transaction payload
    const tx = {} as any;
    Object.keys(props.operation.fields).forEach((key) => {
      tx[key] = props.operation.fields[key].value;
    });

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
      if (err.message.includes('does not have sufficient funds')) {
        // Get the actual transfer amount from the operation
        const amount = props.operation.fields.amount.value as string;
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

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #202124;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #5f6368;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.close-button:hover {
  color: #202124;
}

.modal-body {
  padding: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

label {
  font-size: 14px;
  color: #202124;
  font-weight: 500;
}

input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

input.error {
  border-color: #d93025;
}

.error-text {
  color: #d93025;
  font-size: 12px;
}

.operation-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.operation-info h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #202124;
}

.operation-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #5f6368;
}

.submit-button {
  padding: 12px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  transition: all 0.2s ease;
}

.submit-button:hover {
  background-color: #1557b0;
}

.submit-button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 