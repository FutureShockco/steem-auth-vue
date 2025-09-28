<template>
  <div class="steem-auth-transactions-component">
    <h2>Steem Transactions Test</h2>
    <div v-if="!authStore.state.isAuthenticated" class="steem-auth-not-authenticated">
      <p>Please log in first to test transactions</p>
    </div>
    <div v-else class="steem-auth-transactions-content">
      <div class="steem-auth-transaction-item operation-block" v-for="operation in operations" :key="operation.type">
        <div class="operation-header">
          <span class="operation-label">{{ operation.label }}</span>
          <span class="operation-tooltip" v-if="operation.description">
            <span class="tooltip-icon">?</span>
            <span class="tooltip-content">{{ operation.description }}</span>
          </span>
        </div>
        <div>
          <form v-if="inputValues[operation.type]" @submit.prevent="handleOperation(operation)"
            class="steem-auth-transaction-form">
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
                <input :id="field + String(index)" type="checkbox" v-model="inputValues[operation.type][field]" />
              </template>
              <template v-else-if="fieldDef.type === 'json' || fieldDef.type === 'array'">
                <textarea :id="field + String(index)" class="steem-auth-input"
                  v-model="inputValues[operation.type][field]" :required="fieldDef.required" rows="4"
                  :placeholder="`Enter ${fieldDef.type} as string or JSON format`"></textarea>
              </template>
              <template v-else-if="fieldDef.type === 'date'">
                <input :id="field + String(index)" type="datetime-local" class="steem-auth-input"
                  :value="formatDateTimeLocal(inputValues[operation.type][field])"
                  @input="onDateTimeInput($event, operation.type, field)" :required="fieldDef.required" step="1" />
              </template>
            </div>

            <div v-if="operation.type === 'custom_json' || operation.type === 'custom_binary'"
              class="form-group steem-auth-auth-type-selector">
              <label>Authorization Type</label>
              <div class="steem-auth-radio-options">
                <div class="steem-auth-radio-option">
                  <input type="radio" id="auth-type-active" name="auth-type" value="active" v-model="customJsonAuthType"
                    @change="updateCustomJsonAuth(operation)">
                  <label for="auth-type-active">Active</label>
                </div>
                <div class="steem-auth-radio-option">
                  <input type="radio" id="auth-type-posting" name="auth-type" value="posting"
                    v-model="customJsonAuthType" @change="updateCustomJsonAuth(operation)">
                  <label for="auth-type-posting">Posting</label>
                </div>
                <div class="steem-auth-radio-option" v-if="operation.type === 'custom_binary'">
                  <input type="radio" id="auth-type-posting" name="auth-type" value="owner" v-model="customJsonAuthType"
                    @change="updateCustomJsonAuth(operation)">
                  <label for="auth-type-posting">Owner</label>
                </div>
              </div>
            </div>
            <div v-if="operation.type === 'transfer' || operation.type === 'escrow_transfer'">
              <div>
                {{ authStore.state.account?.balance }} - {{ authStore.state.account?.sbd_balance }}
              </div>
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
    </div>

    <ActiveKeyModal v-if="showActiveKeyModal" :show="showActiveKeyModal" :operation="currentOperation"
      @close="closeActiveKeyModal" @success="handleSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTransactionStore } from '../stores/transaction';
import TransactionService from '../services/transaction';
import { operations, type OperationDefinition } from '../utils/steemOperations';
import ActiveKeyModal from './ActiveKeyModal.vue';

interface ExtendedOperation {
  type: string;
  fields: Record<string, any>;
  requiredAuth: 'active' | 'posting';
  fieldValues: Record<string, any>;
}

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const loading = ref(false);
const formValues = ref<Record<string, Record<string, any>>>({});
const inputValues = ref<Record<string, Record<string, any>>>({});
const showActiveKeyModal = ref(false);
const customJsonAuthType = ref<'posting' | 'active' | 'owner'>('posting'); // Updated to include owner
const currentOperation = ref<ExtendedOperation>({
  type: 'approve_node',
  fields: {},
  requiredAuth: 'active',
  fieldValues: {}
});

const operationResults = ref<Record<string, { success?: string; error?: string }>>({});
const pendingOperationType = ref<string | null>(null);
const pendingMessage = ref<string>('');
const isClient = ref(false);
const updateFormValues = () => {
  operations.forEach(operation => {
    formValues.value[operation.type] = {};
    inputValues.value[operation.type] = {};
    Object.keys(operation.fields).forEach(field => {
      let defaultValue = operation.fields[field].value;
      if (
        (field === 'author' || field === 'voter' || field === 'from' || field === 'to' ||
          field === 'creator' || field === 'follower' || field === 'parent_author') &&
        !defaultValue
      ) {
        defaultValue = authStore.username;
      }
      formValues.value[operation.type][field] = defaultValue;
      inputValues.value[operation.type][field] = defaultValue;
    });
  });
};

onMounted(() => {
  isClient.value = true;
  updateFormValues();
  const customJsonOp = operations.find(op => op.type === 'custom_json');
  if (customJsonOp) updateCustomJsonAuth(customJsonOp);
  const customBinaryOp = operations.find(op => op.type === 'custom_binary');
  if (customBinaryOp) updateCustomJsonAuth(customBinaryOp);
  console.log('SteemTransactions mounted, initial username:', authStore.username);
  watch(() => authStore.username, async (newUsername) => {
    console.log('Watcher triggered, new username:', newUsername);
    if (newUsername) {
      updateFormValues();
      const customJsonOp = operations.find(op => op.type === 'custom_json');
      if (customJsonOp) updateCustomJsonAuth(customJsonOp);
      const customBinaryOp = operations.find(op => op.type === 'custom_binary');
      if (customBinaryOp) updateCustomJsonAuth(customBinaryOp);
    }
  });
});

const updateCustomJsonAuth = (operation: OperationDefinition) => {
  if (operation.type === 'custom_json' || operation.type === 'custom_binary') {
    console.log('Updating custom_json auths for operation:', operation.type, operation.fields);
    operation.fields.required_auths.value = [];
    operation.fields.required_posting_auths.value = [];
    if (operation.type === 'custom_binary') {
      operation.fields.required_owner_auths.value = [];
      operation.fields.required_active_auths.value = [];
    }
    if (customJsonAuthType.value === 'active') {
      operation.fields.required_auths.value = [authStore.username];
      operation.requiredAuth = 'active';
    }
    else if (customJsonAuthType.value === 'owner' && operation.type === 'custom_binary') {
      operation.fields.required_owner_auths.value = [authStore.username];
      operation.requiredAuth = 'active';
    }
    else {
      operation.fields.required_posting_auths.value = [authStore.username];
      operation.requiredAuth = 'posting';
    }
    console.log(`Auth type set to: ${operation.requiredAuth}`);
    console.log(`Required auths: ${JSON.stringify(operation.fields.required_auths.value)}`);
    console.log(`Required posting auths: ${JSON.stringify(operation.fields.required_posting_auths.value)}`);
  }
};

function validateOperation(operation: OperationDefinition) {
  const fields = operation.fields;
  for (const field in fields) {
    if (fields[field].required && !inputValues.value[operation.type][field]) {
      return field;
    }
  }
  return null;
}

const handleOperation = (operation: OperationDefinition) => {
  const missingField = validateOperation(operation);
  if (missingField) {
    operationResults.value[operation.type] = {
      error: `Field '${missingField}' is required.`
    };
    return;
  }
  if (operation.type === 'custom_json') {
    updateCustomJsonAuth(operation);
    console.log(`Operation requiredAuth after update: ${operation.requiredAuth}`);
  }

  if ((operation.requiredAuth === 'active' || operation.requiredAuth === 'owner') && authStore.loginAuth === 'steem') {
    currentOperation.value = {
      type: operation.type,
      fields: operation.fields,
      requiredAuth: operation.requiredAuth === 'owner' ? 'active' : operation.requiredAuth,
      fieldValues: { ...inputValues.value[operation.type] }
    };

    console.log(`Showing active key modal for ${operation.type} with auth type: ${operation.requiredAuth}`);
    showActiveKeyModal.value = true;
  } else {
    console.log(`Sending operation ${operation.type} with auth type: ${operation.requiredAuth}`);
    send(operation);
  }
};

const closeActiveKeyModal = () => {
  console.log('Parent: Closing active key modal');
  showActiveKeyModal.value = false;
  currentOperation.value = {
    type: 'custom_json',
    fields: {},
    requiredAuth: 'posting',
    fieldValues: {}
  };
};

const handleSuccess = (result: any) => {
  if (currentOperation.value) {
    operationResults.value[currentOperation.value.type] = {
      success: `Transaction sent successfully! Transaction ID: ${result.id}`
    };
  }
};

interface TransactionResponse {
  id?: string;
  result?: {
    id: string;
  };
}

const send = async (operation: OperationDefinition) => {
  loading.value = true;
  transactionStore.clearResults(operation.type);
  operationResults.value[operation.type] = {};
  if (authStore.loginAuth === 'keychain') {
    pendingOperationType.value = operation.type;
    pendingMessage.value = 'Transaction sent to Keychain for signing. Please check your Keychain extension.';
  }

  const tx = {} as any;

  // Ensure required auth fields are always arrays
  const authArrayFields = [
    'required_auths',
    'required_posting_auths',
    'required_owner_auths',
    'required_active_auths'
  ];
  authArrayFields.forEach((field) => {
    if (field in operation.fields) {
      let val = inputValues.value[operation.type][field];
      if (!Array.isArray(val)) {
        if (val === undefined || val === null || val === '') {
          inputValues.value[operation.type][field] = [];
        } else {
          inputValues.value[operation.type][field] = [val];
        }
      }
    }
  });

  Object.keys(operation.fields).forEach((key) => {
    if ((operation.type === 'custom_json' && key === 'json') ||
      (operation.type === 'escrow_transfer' && key === 'json_meta') ||
      (key.includes('json_meta'))) {
      console.log(`Processing JSON field ${key} with value:`, operation.fields[key].value);
      if (typeof inputValues.value[operation.type][key] !== 'string') {
        tx[key] = JSON.stringify(inputValues.value[operation.type][key]);
      } else {
        try {
          JSON.parse(inputValues.value[operation.type][key] as string);
          tx[key] = inputValues.value[operation.type][key];
        } catch (e) {
          tx[key] = JSON.stringify(inputValues.value[operation.type][key]);
        }
      }
      if (typeof tx[key] !== 'string') {
        console.error(`ERROR: ${key} is still not a string after processing:`, tx[key]);
        tx[key] = JSON.stringify(tx[key]);
      }
    }
    else if (operation.type.includes('escrow') && (key === 'ratification_deadline' || key === 'escrow_expiration')) {
      if (operation.fields[key].type === 'date') {
        if (!inputValues.value[operation.type][key]) {
          const date = new Date();
          if (key === 'ratification_deadline') {
            date.setDate(date.getDate() + 1);
          } else {
            date.setDate(date.getDate() + 2);
          }
          tx[key] = date.toISOString().split('.')[0]; // Remove milliseconds
          console.log(`Auto-setting ${key} to:`, tx[key]);
        } else if (typeof inputValues.value[operation.type][key] === 'string') {
          // If it's already a string, make sure it's properly formatted
          try {
            const date = new Date(inputValues.value[operation.type][key] as string);
            tx[key] = date.toISOString().split('.')[0]; // Remove milliseconds
            console.log(`Formatted ${key} from string to:`, tx[key]);
          } catch (e) {
            console.error(`Error formatting date for ${key}:`, e);
            tx[key] = inputValues.value[operation.type][key];
          }
        } else {
          tx[key] = inputValues.value[operation.type][key];
        }
      } else {
        tx[key] = inputValues.value[operation.type][key];
      }
    }
    else {
      tx[key] = inputValues.value[operation.type][key];
    }
  });

  console.log(`Sending transaction with requiredAuth: ${operation.requiredAuth}`);
  console.log('Transaction payload:', tx);

  try {
    const response = await new Promise<TransactionResponse>((resolve, reject) => {
      TransactionService.send(operation.type, tx, {
        requiredAuth: operation.requiredAuth
      })
        .then(resolve)
        .catch(reject);
    });

    pendingOperationType.value = null;
    pendingMessage.value = '';

    let txId = response.id || (response.result && response.result.id);
    let successMsg = '';
    if (txId) {
      successMsg = `Transaction sent successfully! Transaction ID: ${txId}`;
    } else {
      successMsg = 'Transaction sent successfully!';
    }
    if (successMsg) {
      operationResults.value[operation.type] = {
        success: successMsg
      };
    }
  } catch (err) {
    pendingOperationType.value = null;
    pendingMessage.value = '';
    if (err instanceof Error && err.message === 'Please sign the transaction in the new window') {
      operationResults.value[operation.type] = {
        success: 'Please sign the transaction in the new window'
      };
    } else {
      operationResults.value[operation.type] = {
        error: err instanceof Error ? err.message : 'Failed to send transaction'
      };
    }
  } finally {
    loading.value = false;
  }
};

function formatDateTimeLocal(value: string | Date | null | undefined): string {
  if (!value) return '';
  let date: Date;
  if (typeof value === 'string') {
    date = new Date(value);
    if (isNaN(date.getTime())) return '';
  } else if (value instanceof Date) {
    date = value;
  } else {
    return '';
  }
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function onDateTimeInput(event: Event, opType: string, field: string) {
  const value = (event.target as HTMLInputElement).value;
  if (!value) {
    inputValues.value[opType][field] = '';
    return;
  }
  let date: Date;
  if (value.length === 16) {
    date = new Date(value + ':00');
  } else {
    date = new Date(value);
  }
  const pad = (n: number) => n.toString().padStart(2, '0');
  const utc = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
  inputValues.value[opType][field] = utc;
}

</script>