<template>
  <div class="echelon-test">
    <h2>Echelon Transactions Test</h2>

    <div v-if="!authStore.state.isAuthenticated" class="not-authenticated">
      <p>Please log in first to test Echelon operations</p>
    </div>

    <div v-else class="echelon-options">
      <div class="echelon-type" v-for="operation in operations" :key="operation.type">
        <div>
          <h3>{{ operation.type }}</h3>
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
              <div v-else-if="fieldDef.type === 'json'">
                <label :for="field.toString() + index">{{ field }}</label>
                <textarea 
                  :id="field.toString() + index"
                  :value="typeof fieldDef.value === 'string' ? fieldDef.value : JSON.stringify(fieldDef.value, null, 2)"
                  @input="fieldDef.value = ($event.target as HTMLTextAreaElement).value"
                  rows="4"
                  placeholder="Enter JSON object"
                ></textarea>
              </div>
              <div v-else-if="fieldDef.type === 'array'">
                <label :for="field.toString() + index">{{ field }}</label>
                <textarea 
                  :id="field.toString() + index"
                  :value="typeof fieldDef.value === 'string' ? fieldDef.value : JSON.stringify(fieldDef.value, null, 2)"
                  @input="fieldDef.value = ($event.target as HTMLTextAreaElement).value"
                  rows="4"
                  placeholder="Enter array in JSON format"
                ></textarea>
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
      @submit="handleActiveKeySubmit" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '../src/stores/auth';
import TransactionService from '../src/services/transaction';
import { operations, type OperationDefinition, type OperationType } from '../src/utils/echelon';
import ActiveKeyModal from '../src/components/ActiveKeyModal.vue';

// Define form value types to match FieldDefinition
type FormValue = string | number | readonly string[] | null | undefined;
type FormValues = Record<string, Record<string, FormValue>>;

// Define the extended operation type that includes requiredAuth
type ExtendedOperation = OperationDefinition & {
  requiredAuth: 'active' | 'posting';
};

// Define the type for field values in operations
type FieldValue = string | number | boolean | object | any[] | null | undefined;

const convertToFormValue = (value: FieldValue): FormValue => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return value.toString();
  if (Array.isArray(value) && value.every(v => typeof v === 'string')) return value as readonly string[];
  return JSON.stringify(value);
};

const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');
const success = ref('');
const formValues = ref<FormValues>({});
const showActiveKeyModal = ref(false);
const currentOperation = ref<ExtendedOperation>({
  type: 'approve_node',
  fields: {},
  requiredAuth: 'active'
});
const operationResults = ref<Record<string, { success?: string; error?: string }>>({});

const isoToInputFormat = (value: FieldValue): string => {
  if (typeof value !== 'string') return '';
  return value.slice(0, 16);
};

const inputToIsoFormat = (inputString: string): string => {
  return new Date(inputString).toISOString().split('.')[0];
};

const updateFormValues = () => {
  operations.forEach(operation => {
    formValues.value[operation.type] = {};
    Object.keys(operation.fields).forEach(field => {
      if (field === 'sender') {
        if (!operation.fields[field].value) {
          operation.fields[field].value = authStore.state.username;
          formValues.value[operation.type][field] = authStore.state.username;
        }
      } else {
        const fieldDef = operation.fields[field];
        // Convert the field value to a form-compatible value
        if (fieldDef.type === 'json' || fieldDef.type === 'array') {
          formValues.value[operation.type][field] = JSON.stringify(fieldDef.value);
        } else if (fieldDef.type === 'date') {
          formValues.value[operation.type][field] = isoToInputFormat(fieldDef.value);
        } else {
          formValues.value[operation.type][field] = convertToFormValue(fieldDef.value);
        }
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
    currentOperation.value = { ...operation, requiredAuth: 'active' } as ExtendedOperation;
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
    requiredAuth: 'active'
  } as ExtendedOperation;
};

const handleActiveKeySubmit = async (activeKey: string) => {
  try {
    if (!currentOperation.value) return;

    // Construct the custom_json payload
    const payload: {
      id: string;
      json: {
        contract: string;
        payload: Record<string, any>;
      };
    } = {
      id: 'sidechain',
      json: {
        contract: currentOperation.value.type,
        payload: {}
      }
    };

    // Add all field values to the payload
    Object.entries(currentOperation.value.fields).forEach(([field, fieldDef]) => {
      if (field !== 'contract') { // Skip the contract field as it's already in the structure
        try {
          // Try to parse JSON fields
          payload.json.payload[field] = fieldDef.type === 'json' || fieldDef.type === 'array' 
            ? JSON.parse(fieldDef.value as string)
            : fieldDef.value;
        } catch (e) {
          // If parsing fails, use the raw value
          payload.json.payload[field] = fieldDef.value;
        }
      }
    });

    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active',
      activeKey
    });

    operationResults.value[currentOperation.value.type] = {
      success: `Operation sent successfully! Transaction ID: ${response.id}`
    };
    closeActiveKeyModal();
  } catch (err) {
    operationResults.value[currentOperation.value.type] = {
      error: err instanceof Error ? err.message : 'Failed to send operation'
    };
  }
};

const send = async (operation: OperationDefinition) => {
  loading.value = true;
  operationResults.value[operation.type] = {};

  try {
    // Construct the custom_json payload
    const payload: {
      id: string;
      json: {
        contract: string;
        payload: Record<string, any>;
      };
    } = {
      id: 'sidechain',
      json: {
        contract: operation.type,
        payload: {}
      }
    };

    // Add all field values to the payload
    Object.entries(operation.fields).forEach(([field, fieldDef]) => {
      if (field !== 'contract') { // Skip the contract field as it's already in the structure
        try {
          // Try to parse JSON fields
          payload.json.payload[field] = fieldDef.type === 'json' || fieldDef.type === 'array' 
            ? JSON.parse(fieldDef.value as string)
            : fieldDef.value;
        } catch (e) {
          // If parsing fails, use the raw value
          payload.json.payload[field] = fieldDef.value;
        }
      }
    });

    const response = await TransactionService.send('custom_json', payload, {
      requiredAuth: 'active'
    });

    operationResults.value[operation.type] = {
      success: `Operation sent successfully! Transaction ID: ${response.id}`
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

<style scoped>
.echelon-test {
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

.echelon-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.echelon-type {
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