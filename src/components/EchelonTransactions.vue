<template>
  <div class="steem-auth-transactions-component">
    <h2>Echelon Transactions Test</h2>

    <div v-if="!authStore.state.isAuthenticated" class="steem-auth-not-authenticated">
      <p>Please log in first to test Echelon operations</p>
    </div>

    <div v-else class="steem-auth-transactions-content">
      <div class="steem-auth-transaction-item" v-for="operation in operations" :key="operation.type">
        <div>
          <h3>{{ operation.type }}</h3>
          <form @submit.prevent="handleOperation(operation)" class="steem-auth-transaction-form">
            <div class="form-group" v-for="(fieldDef, field, index) in operation.fields" :key="field">
              <div v-if="fieldDef.type === 'string' || fieldDef.type === 'number'">
                <label :for="field.toString() + index">{{ field }}</label>
                <input 
                  :id="field.toString() + index" 
                  :type="fieldDef.type" 
                  class="steem-auth-input"
                  v-model="inputValues[operation.type][field]"
                />
              </div>
              <div v-else-if="fieldDef.type === 'json' || fieldDef.type === 'array'">
                <label :for="field.toString() + index">{{ field }}</label>
                <textarea 
                  :id="field.toString() + index"
                  class="steem-auth-input"
                  v-model="inputValues[operation.type][field] as string"
                  rows="4"
                  :placeholder="`Enter ${fieldDef.type} in JSON format`"
                ></textarea>
              </div>
              <div v-else-if="fieldDef.type === 'boolean'" class="d-flex mx-1" :data-trigger-switch="field.toString() + index">
                <div class="align-self-center">
                  <h6 class="mb-0 font-12">{{ field }}</h6>
                </div>
                <div class="ms-auto align-self-center">
                  <div class="form-switch android-switch switch-blue switch-s">
                    <input type="checkbox" class="android-input" :id="field.toString() + index"
                      v-model="inputValues[operation.type][field]">
                    <label class="custom-control-label" :for="field.toString() + index"></label>
                  </div>
                </div>
              </div>
            </div>

            <button v-if="authStore.state.isAuthenticated" class="steem-auth-button">
              Send
            </button>

            <div v-if="operationResults[operation.type]?.success" class="steem-auth-success-message">
              {{ operationResults[operation.type].success }}
            </div>
            <div v-if="operationResults[operation.type]?.error" class="steem-auth-error-message">
              {{ operationResults[operation.type].error }}
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="steem-auth-transaction-history" v-if="transactionStore.transactions.length">
      <h3>Transaction History</h3>
      <ul>
        <li v-for="tx in transactionStore.transactions" :key="tx.transactionId" class="steem-auth-transaction-history-item">
          <strong>{{ tx.type }}</strong>
          <span>({{ new Date(tx.timestamp).toLocaleString() }})</span>
          <span>Status: <b :class="`tx-status-${tx.status}`">{{ tx.status }}</b></span>
          <span>{{ tx }}</span>
          <span v-if="tx.message">- {{ tx.message }}</span>
          <span v-if="tx.errorMessage" class="steem-auth-error-message">- {{ tx.errorMessage }}</span>
          <button @click="transactionStore.deleteTransaction(tx.transactionId)" class="steem-auth-button steem-auth-button-small">Delete</button>
        </li>
      </ul>
    </div>

    <ActiveKeyModal 
      v-if="showActiveKeyModal" 
      :show="showActiveKeyModal" 
      :operation="currentOperation"
      @close="closeActiveKeyModal" 
      @submit="handleActiveKeySubmit" 
      :isEchelon="true"
      @success="handleActiveKeySuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import TransactionService from '../services/transaction';
import { operations, type OperationDefinition, getDefaultValueForType } from '../utils/echelon';
import ActiveKeyModal from './ActiveKeyModal.vue';
import { useTransactionStore } from '../stores/transaction';

// Define form value types to match FieldDefinition
type FormValue = string | number | boolean | object | any[] | null | undefined;
type FormValues = Record<string, Record<string, FormValue>>;

// Define input value type for v-model
type InputValue = string | number | boolean | null | undefined;
type InputValues = Record<string, Record<string, InputValue>>;

// Define the extended operation type that includes requiredAuth and field values
type ExtendedOperation = OperationDefinition & {
  requiredAuth: 'active' | 'posting';
  fieldValues: Record<string, FormValue>;
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
  fieldValues: {}
});
const operationResults = ref<Record<string, { success?: string; error?: string }>>({});
const transactionStore = useTransactionStore();

const updateFormValues = () => {
  operations.forEach(operation => {
    formValues.value[operation.type] = {};
    inputValues.value[operation.type] = {};
    Object.keys(operation.fields).forEach(field => {
      if (field === 'sender') {
        formValues.value[operation.type][field] = authStore.state.username;
        inputValues.value[operation.type][field] = authStore.state.username;
      } else {
        const defaultValue = getDefaultValueForType(operation.fields[field].type);
        formValues.value[operation.type][field] = defaultValue;
        inputValues.value[operation.type][field] = defaultValue as InputValue;
      }
    });
  });
};

// Watch for account changes
watch(() => authStore.state.account, (newAccount) => {
  if (newAccount) {
    updateFormValues();
  }
}, { immediate: true });

updateFormValues();

const handleOperation = (operation: OperationDefinition) => {
  if (authStore.loginAuth === 'steem') {
    // Create a copy of the operation with field values
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
    fieldValues: {}
  } as ExtendedOperation;
};

const handleActiveKeySubmit = async (activeKey: string) => {
  try {
    if (!currentOperation.value) return;

    // Construct the custom_json payload
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

    // Prepare the json object that will be stringified
    const jsonData = {
      contract: currentOperation.value.type,
      payload: {} as Record<string, any>
    };

    // Add all field values to the payload
    Object.entries(currentOperation.value.fields).forEach(([field, fieldDef]) => {
      if (field !== 'contract') { // Skip the contract field as it's already in the structure
        try {
          // Try to parse JSON fields
          jsonData.payload[field] = fieldDef.type === 'json' || fieldDef.type === 'array' 
            ? JSON.parse(currentOperation.value.fieldValues[field] as string)
            : currentOperation.value.fieldValues[field];
        } catch (e) {
          // If parsing fails, use the raw value
          jsonData.payload[field] = currentOperation.value.fieldValues[field];
        }
      }
    });

    // Stringify the entire json object
    payload.json = JSON.stringify(jsonData);

    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active',
      activeKey
    });

    // Get transaction ID from response.id or response.result.id
    const txId = response.id || (response.result && response.result.id);

    operationResults.value[currentOperation.value.type] = {
      success: `Operation sent successfully!${txId ? ' Transaction ID: ' + txId : ''}`
    };
    closeActiveKeyModal();
  } catch (err) {
    operationResults.value[currentOperation.value.type] = {
      error: err instanceof Error ? err.message : 'Failed to send operation'
    };
  }
};

const handleActiveKeySuccess = (result: any) => {
  // Get transaction ID from result.id or result.result.id
  const txId = result.id || (result.result && result.result.id);
  operationResults.value[currentOperation.value.type] = {
    success: `Operation sent successfully!${txId ? ' Transaction ID: ' + txId : ''}`
  };
  // Optionally close the modal here if not already closed
};

const send = async (operation: OperationDefinition) => {
  loading.value = true;
  operationResults.value[operation.type] = {};

  try {
    // Construct the custom_json payload
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

    // Prepare the json object that will be stringified
    const jsonData = {
      contract: operation.type,
      payload: {} as Record<string, any>
    };

    // Add all field values to the payload
    Object.entries(operation.fields).forEach(([field, fieldDef]) => {
      if (field !== 'contract') { // Skip the contract field as it's already in the structure
        try {
          // Try to parse JSON fields
          jsonData.payload[field] = fieldDef.type === 'json' || fieldDef.type === 'array' 
            ? JSON.parse(inputValues.value[operation.type][field] as string)
            : inputValues.value[operation.type][field];
        } catch (e) {
          // If parsing fails, use the raw value
          jsonData.payload[field] = inputValues.value[operation.type][field];
        }
      }
    });

    // Stringify the entire json object
    payload.json = JSON.stringify(jsonData);

    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active'
    });

    // Get transaction ID from response.id or response.result.id
    const txId = response.id || (response.result && response.result.id);

    operationResults.value[operation.type] = {
      success: `Operation sent successfully!${txId ? ' Transaction ID: ' + txId : ''}`
    };
  } catch (err) {
    operationResults.value[operation.type] = {
      error: err instanceof Error ? err.message : 'Failed to send operation'
    };
  } finally {
    loading.value = false;
  }
};
</script> 