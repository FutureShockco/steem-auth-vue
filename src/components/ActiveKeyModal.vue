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
          <input id="active-key" v-model="activeKey" type="password" placeholder="Enter your active key"
            class="steem-auth-input" :class="{ 'error': error }" />
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
import client from '../helpers/client';
import { useAuthStore } from '../stores/auth';
import TransactionService from '../services/transaction';

export type ExtendedOperation = {
  type: string;
  fields: Record<string, any>;
  requiredAuth: 'active' | 'posting';
  fieldValues: Record<string, any>;
};

const props = defineProps<{
  show: boolean;
  operation: ExtendedOperation;
  isMeeray?: boolean;
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
    const publicKey = key.createPublic(client.addressPrefix).toString();
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
    if (!verifyActiveKey(activeKey.value)) {
      error.value = 'Invalid active key. The provided key does not match your account\'s active public key.';
      loading.value = false;
      return;
    }
    let tx: any;
    let opType = props.operation.type;

    if (props.isMeeray) {
      opType = 'custom_json';
      tx = {
        required_auths: [authStore.state.username],
        required_posting_auths: [],
        id: 'sidechain',
        json: JSON.stringify({
          contract: props.operation.type,
          payload: Object.fromEntries(
            Object.entries(props.operation.fields).map(([key]) => [
              key,
              props.operation.fieldValues[key]
            ])
          )
        })
      };
    } else {
      tx = {};
      if (Object.keys(props.operation.fields).length === 0 && props.operation.fieldValues) {
        tx = { ...props.operation.fieldValues };
      } else {
        Object.keys(props.operation.fields).forEach((key) => {
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
      }
    }
    const result = await TransactionService.send(
      opType,
      tx,
      { requiredAuth: 'active', activeKey: activeKey.value }
    );
    emit('success', result);
    closeModal();
  } catch (err: any) {
    console.error('Transaction error:', err);
    if (err.name === 'RPCError') {
      console.log('RPC Error details:', err.jse_info);
      if (err.message.includes('missing required active authority')) {
        error.value = 'Missing active authority. The blockchain rejected your active key. Please ensure you are using the correct active key for this account.';
      } else if (err.message.includes('does not have sufficient funds')) {
        const amount = props.operation.fieldValues.amount as string || '0';
        const [amountValue, currency] = amount.split(' ');

        error.value = `Insufficient funds. Required: ${amountValue} ${currency}, Available: 0 ${currency}`;
      } else if (err.message.includes('missing required posting authority')) {
        error.value = 'Missing required posting authority';
      } else if (err.message.includes('invalid_scope')) {
        error.value = 'Invalid scope for this operation';
      } else {
        const message = err.message.split(':')[1]?.trim() || err.message;
        error.value = message;
      }
    } else {
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred';
    }
  } finally {
    loading.value = false;
  }
};
</script>