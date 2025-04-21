<template>
  <div class="transaction-test">
    <h2>Steem Transactions Test</h2>

    <div v-if="!authStore.state.isAuthenticated" class="not-authenticated">
      <p>Please log in first to test transactions</p>
    </div>

    <div v-else class="transaction-options">
      <div class="transaction-type" v-for="operation in operations" :key="operation.type">
        <div>
          <h2>{{ operation.type }} operation (require:{{ operation.requiredAuth }} key)</h2>
          <form @submit.prevent="handleOperation(operation)">
            <div class="form-group" v-for="(fieldDef, field, index) in operation.fields" :key="field">
              <div v-if="fieldDef.type === 'string' || fieldDef.type === 'number' || fieldDef.type === 'date'">
                <label :for="field.toString() + index">{{ field }}</label>
                <input 
                  :id="field.toString() + index" 
                  :type="fieldDef.type === 'date' ? 'datetime-local' : fieldDef.type" 
                  :value="fieldDef.type === 'date' ? isoToInputFormat(fieldDef.value) : fieldDef.value"
                  @input="fieldDef.type === 'date' 
                    ? fieldDef.value = inputToIsoFormat(($event.target as HTMLInputElement).value)
                    : fieldDef.value = ($event.target as HTMLInputElement).value"
                />
              </div>
              <div v-else class="d-flex mx-1" :data-trigger-switch="field.toString() + index">
                <div class="align-self-center">
                  <h6 class="mb-0 font-12">{{ field }}</h6>
                </div>
                <div class="ms-auto align-self-center">
                  <div class="form-switch android-switch switch-blue switch-s">
                    <input type="checkbox" class="android-input" :id="field.toString() + index"
                      v-model="fieldDef.value">
                    <label class="custom-control-label" :for="field.toString() + index"></label>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="authStore.state.isAuthenticated" @click="handleOperation(operation)" class='send-button'>
              Send
            </div>

            <div v-if="operationResults[operation.type]?.success" class="success-message">
              {{ operationResults[operation.type].success }}
            </div>
            <div v-if="operationResults[operation.type]?.error" class="error-message">
              {{ operationResults[operation.type].error }}
            </div>
          </form>
        </div>
      </div>
    </div>

    <ActiveKeyModal 
      v-if="showActiveKeyModal" 
      :show="showActiveKeyModal" 
      :operation="currentOperation"
      @close="closeActiveKeyModal" 
      @success="handleSuccess" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '../src/stores/auth';
import TransactionService from '../src/services/transaction';
import { operations, type OperationDefinition } from '../src/utils/operations';
import { type OperationDefinition as EchelonOperationDefinition } from '../src/utils/echelon';
import ActiveKeyModal from '../src/components/ActiveKeyModal.vue';

// Define the extended operation type that includes requiredAuth
type ExtendedOperation = EchelonOperationDefinition & {
  requiredAuth: 'active' | 'posting';
};

const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');
const success = ref('');
const formValues = ref<Record<string, Record<string, any>>>({});
const showActiveKeyModal = ref(false);
const currentOperation = ref<ExtendedOperation>({
  type: 'approve_node',
  fields: {},
  requiredAuth: 'active'
} as ExtendedOperation);
const operationResults = ref<Record<string, { success?: string; error?: string }>>({});


const formatDate = (date: Date): string => {
  // Format date to match Steem's format: YYYY-MM-DDTHH:mm:ss
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const isoToInputFormat = (isoString: string | number | boolean): string => {
  if (typeof isoString !== 'string') return '';
  // Convert ISO string to format required by datetime-local input (YYYY-MM-DDTHH:mm)
  return isoString.slice(0, 16);
};

const inputToIsoFormat = (inputString: string): string => {
  // Convert datetime-local input format to ISO string
  return new Date(inputString).toISOString().split('.')[0];
};

const dateToTimestamp = (date: Date): number => {
  // Convert date to Unix timestamp (seconds since epoch)
  return Math.floor(date.getTime() / 1000);
};

const updateValue = (operationType: string, field: string | number, fieldType: string, value: string | number | boolean) => {
  if (fieldType === 'boolean') {
    formValues.value[operationType][field] = Boolean(value);
  }
  else if (fieldType === 'number') {
    formValues.value[operationType][field] = Number(value);
  } 
  else if (fieldType === 'date') {
    // Convert the date string to ISO format
    const date = new Date(value as string);
    formValues.value[operationType][field] = formatDate(date);
  }
  else {
    formValues.value[operationType][field] = value;
  }
};

const updateFormValues = () => {
  operations.forEach(operation => {
    formValues.value[operation.type] = {};
    Object.keys(operation.fields).forEach(field => {
      if (field === 'author' || field === 'voter' || field === 'from' || field === 'to' || field === 'creator' || field === 'follower' || field === 'parent_author') {
        if (!operation.fields[field].value) {
          operation.fields[field].value = authStore.state.username;
          formValues.value[operation.type][field] = authStore.state.username;
        }
      }
      else
        formValues.value[operation.type][field] = '';
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
  if (operation.requiredAuth === 'active' && authStore.loginAuth === 'steem') {
    // Convert the operation to the expected type
    currentOperation.value = {
      type: operation.type as any, // We know this is safe because we're only using it for display
      fields: operation.fields,
      requiredAuth: operation.requiredAuth as 'active' | 'posting'
    } as ExtendedOperation;
    showActiveKeyModal.value = true;
  } else {
    send(operation);
  }
};

const closeActiveKeyModal = () => {
  console.log('Parent: Closing active key modal');
  showActiveKeyModal.value = false;
  currentOperation.value = {
    type: 'approve_node',
    fields: {},
    requiredAuth: 'active'
  } as ExtendedOperation;
};

const handleSuccess = (result: any) => {
  if (currentOperation.value) {
    operationResults.value[currentOperation.value.type] = {
      success: `Transaction sent successfully! Transaction ID: ${result.id}`
    };
  }
};

const send = async (operation: OperationDefinition) => {
  loading.value = true;
  operationResults.value[operation.type] = {};
  const tx = {} as any;
  Object.keys(operation.fields).forEach((key) => {
    tx[key] = operation.fields[key].value;
  });
  try {
    const response = await TransactionService.send(operation.type, tx, {
      requiredAuth: operation.requiredAuth
    });

    // Handle different response formats based on auth method
    if (authStore.loginAuth === 'steem') {
      operationResults.value[operation.type] = {
        success: `Transaction sent successfully! Transaction ID: ${response.id}`
      };
    } else {
      operationResults.value[operation.type] = {
        success: `Transaction sent successfully! Transaction ID: ${response.result.id}`
      };
    }
  } catch (err) {
    operationResults.value[operation.type] = {
      error: err instanceof Error ? err.message : 'Failed to send transaction'
    };
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.transaction-test {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.not-authenticated {
  text-align: center;
  padding: 20px;
  color: #666;
}

.transaction-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.transaction-type {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
  font-family: monospace;
}

.send-button {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.send-button:hover {
  background: #1557b0;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.success-message {
  color: #388e3c;
  padding: 10px;
  margin-top: 10px;
  background: #e8f5e9;
  border-radius: 4px;
  font-size: 14px;
}

.error-message {
  color: #d32f2f;
  padding: 10px;
  margin-top: 10px;
  background: #ffebee;
  border-radius: 4px;
  font-size: 14px;
}
</style>