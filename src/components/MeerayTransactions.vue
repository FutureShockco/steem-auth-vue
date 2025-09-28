<template>
  <div class="steem-auth-transactions-component">
    <h2>Meeray Transactions Test</h2>
    <div v-if="!authStore.state.isAuthenticated" class="steem-auth-not-authenticated">
      <p>Please log in first to test Meeray operations</p>
    </div>
    <div v-else class="steem-auth-transactions-content">
      <div v-for="operation in operations" :key="operation.type" class="operation-block">
        <div class="operation-header">
          <span class="operation-label">{{ operation.label }}</span>
          <span class="operation-tooltip" v-if="operation.description">
            <span class="tooltip-icon">?</span>
            <span class="tooltip-content">{{ operation.description }}</span>
          </span>
        </div>
        <form @submit.prevent="handleOperation(operation)" class="steem-auth-transaction-form">
          <div class="form-group" v-for="([field, fieldDef], index) in Object.entries(operation.fields)"
            :key="operation.type + '-' + field + '-' + index">
            <label :for="field + String(index)">{{ fieldDef.label || field }}</label>
            <template v-if="fieldDef.type === 'string'">
              <input :id="field + String(index)" type="text" class="steem-auth-input"
                v-model="inputValues[operation.type][field]" :required="fieldDef.required" />
            </template>
            <template v-else-if="fieldDef.type === 'number'">
              <input :id="field + String(index)" type="number" class="steem-auth-input"
                v-model.number="inputValues[operation.type][field]" :required="fieldDef.required" />
            </template>
            <template v-else-if="fieldDef.type === 'boolean'">
              <input :id="field + String(index)" type="checkbox" :checked="!!inputValues[operation.type][field]"
                @change="onCheckboxChange($event, operation.type, field)" />
            </template>
            <template v-else-if="fieldDef.type === 'json' || fieldDef.type === 'array'">
              <textarea :id="field + String(index)" class="steem-auth-input"
                v-model.trim="(inputValues[operation.type][field] as string)" :required="fieldDef.required" />
            </template>
          </div>

          <button v-if="authStore.state.isAuthenticated" class="steem-auth-button">
            Send
          </button>

          <div v-if="pendingOperationType === operation.type && pendingMessage" class="steem-auth-success-message">
            {{ pendingMessage }}
          </div>
          <div v-if="operationResults[operation.type]?.success" class="steem-auth-success-message">
            {{ operationResults[operation.type].success }}
          </div>
          <div v-if="operationResults[operation.type]?.error" class="steem-auth-error-message">
            {{ operationResults[operation.type].error }}
          </div>
        </form>
      </div>
    </div>

    <div class="steem-auth-transaction-history" v-if="transactionStore.transactions.length">
      <h3>Transaction History</h3>
      <ul>
        <li v-for="tx in transactionStore.transactions" :key="tx.transactionId"
          class="steem-auth-transaction-history-item">
          <strong>{{ tx.type }}</strong>
          <span>({{ isClient ? new Date(tx.timestamp).toLocaleString() : '' }})</span>
          <span>Status: <b :class="`tx-status-${tx.status}`">{{ tx.status }}</b></span>
          <span>{{ tx }}</span>
          <span v-if="tx.message">- {{ tx.message }}</span>
          <span v-if="tx.errorMessage" class="steem-auth-error-message">- {{ tx.errorMessage }}</span>
          <button @click="transactionStore.deleteTransaction(tx.transactionId)"
            class="steem-auth-button steem-auth-button-small">Delete</button>
        </li>
      </ul>
    </div>

    <ActiveKeyModal v-if="showActiveKeyModal" :show="showActiveKeyModal" :operation="currentOperation"
      @close="closeActiveKeyModal" @submit="handleActiveKeySubmit" :isMeeray="true" @success="handleActiveKeySuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import TransactionService from '../services/transaction';
import { operations, type OperationDefinition, FieldDefinition } from '../utils/meerayOperations';
import ActiveKeyModal from './ActiveKeyModal.vue';
import { useTransactionStore } from '../stores/transaction';

type FormValue = string | number | boolean | object | any[] | null | undefined;
type FormValues = Record<string, Record<string, FormValue>>;

type InputValue = string | number | boolean | null | undefined;
type InputValues = Record<string, Record<string, InputValue>>;

type ExtendedOperation = OperationDefinition & {
  requiredAuth: 'active' | 'posting';
  fieldValues: Record<string, FormValue>;
  label: string;
  description: string;
};

const authStore = useAuthStore();
const loading = ref(false);
const formValues = ref<FormValues>({});
const inputValues = ref<InputValues>({});
const showActiveKeyModal = ref(false);
const currentOperation = ref<ExtendedOperation>({
  type: 'approve_node',
  fields: {},
  requiredAuth: 'active',
  fieldValues: {},
  label: 'Approve Node',
  description: 'Approve a node to participate in the network.'
});
const operationResults = ref<Record<string, { success?: string; error?: string }>>({});
const pendingOperationType = ref<string | null>(null);
const pendingMessage = ref<string>('');
const transactionStore = useTransactionStore();

const isClient = ref(false);

const updateFormValues = () => {
  operations.forEach((operation: OperationDefinition) => {
    formValues.value[operation.type] = {};
    inputValues.value[operation.type] = {};
    Object.keys(operation.fields).forEach(field => {
      if (field === 'sender') {
        formValues.value[operation.type][field] = authStore.state.username;
        inputValues.value[operation.type][field] = authStore.state.username;
      } else {
        const fieldDef = operation.fields[field];
        formValues.value[operation.type][field] = fieldDef.value;
        inputValues.value[operation.type][field] = fieldDef.value as InputValue;
      }
    });
  });
};

watch(() => authStore.state.account, (newAccount) => {
  if (newAccount) {
    updateFormValues();
  }
}, { immediate: true });

onMounted(() => {
  isClient.value = true;
  updateFormValues();
});

const handleOperation = (operation: OperationDefinition) => {
  if (authStore.loginAuth === 'steem') {
    const operationWithValues = {
      ...operation,
      requiredAuth: 'active',
      fieldValues: { ...inputValues.value[operation.type] }
    };

    currentOperation.value = operationWithValues as ExtendedOperation;
    showActiveKeyModal.value = true;
  } else {
    send(operation);
  }
};

const closeActiveKeyModal = () => {
  showActiveKeyModal.value = false;
  currentOperation.value = {
    type: 'approve_node',
    fields: {},
    requiredAuth: 'active',
    fieldValues: {},
    label: 'Approve Node',
    description: 'Approve a node to participate in the network.'
  } as ExtendedOperation;
};

const handleActiveKeySubmit = async (activeKey: string) => {
  try {
    if (!currentOperation.value) return;

    const payload: {
      required_auths: string[];
      required_posting_auths: string[];
      id: string;
      json: string;
    } = {
      required_auths: [authStore.state.username],
      required_posting_auths: [],
      id: 'sidechain',
      json: ''
    };

    const jsonData = {
      contract: currentOperation.value.type,
      payload: {} as Record<string, any>
    };

    Object.entries(currentOperation.value.fields).forEach(([field, fieldDef]: [string, FieldDefinition]) => {
      if (field !== 'contract') { // Skip the contract field as it's already in the structure
        try {
          jsonData.payload[field] = fieldDef.type === 'json' || fieldDef.type === 'array'
            ? JSON.parse(currentOperation.value.fieldValues[field] as string)
            : currentOperation.value.fieldValues[field];
        } catch (e) {
          jsonData.payload[field] = currentOperation.value.fieldValues[field];
        }
      }
    });

    payload.json = JSON.stringify(jsonData);

    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active',
      activeKey
    });

    pendingOperationType.value = null;
    pendingMessage.value = '';

    const txId = response.id || (response.result && response.result.id);

    operationResults.value[currentOperation.value.type] = {
      success: `Operation sent successfully!${txId ? ' Transaction ID: ' + txId : ''}`
    };
    closeActiveKeyModal();
  } catch (err) {
    pendingOperationType.value = null;
    pendingMessage.value = '';
    operationResults.value[currentOperation.value.type] = {
      error: err instanceof Error ? err.message : 'Failed to send operation'
    };
  }
};

const handleActiveKeySuccess = (result: any) => {
  const txId = result.id || (result.result && result.result.id);
  operationResults.value[currentOperation.value.type] = {
    success: `Operation sent successfully!${txId ? ' Transaction ID: ' + txId : ''}`
  };
};

const send = async (operation: OperationDefinition) => {
  loading.value = true;
  operationResults.value[operation.type] = {};

  if (authStore.loginAuth === 'keychain') {
    pendingOperationType.value = operation.type;
    pendingMessage.value = 'Transaction sent to Keychain for signing. Please check your Keychain extension.';
  }

  try {
    const payload: {
      required_auths: string[];
      required_posting_auths: string[];
      id: string;
      json: string;
    } = {
      required_auths: [authStore.state.username],
      required_posting_auths: [],
      id: 'sidechain',
      json: ''
    };

    const jsonData = {
      contract: operation.type,
      payload: {} as Record<string, any>
    };

    Object.entries(operation.fields).forEach(([field, fieldDef]: [string, FieldDefinition]) => {
      if (field !== 'contract') {
        try {
          jsonData.payload[field] = fieldDef.type === 'json' || fieldDef.type === 'array'
            ? JSON.parse(inputValues.value[operation.type][field] as string)
            : inputValues.value[operation.type][field];
        } catch (e) {
          jsonData.payload[field] = inputValues.value[operation.type][field];
        }
      }
    });
    payload.json = JSON.stringify(jsonData);

    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active'
    });

    pendingOperationType.value = null;
    pendingMessage.value = '';

    const txId = response.id || (response.result && response.result.id);

    operationResults.value[operation.type] = {
      success: `Operation sent successfully!${txId ? ' Transaction ID: ' + txId : ''}`
    };
  } catch (err) {
    pendingOperationType.value = null;
    pendingMessage.value = '';
    operationResults.value[operation.type] = {
      error: err instanceof Error ? err.message : 'Failed to send operation'
    };
  } finally {
    loading.value = false;
  }
};

function onCheckboxChange(event: Event, opType: string, field: string) {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    inputValues.value[opType][field] = target.checked;
  }
}
</script>
