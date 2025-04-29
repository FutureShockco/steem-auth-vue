<template>
    <div class="steem-auth-transactions-component">
      <h2>Steem Transactions Test</h2>
  
      <div v-if="!authStore.state.isAuthenticated" class="steem-auth-not-authenticated">
        <p>Please log in first to test transactions</p>
      </div>
  
      <div v-else class="steem-auth-transactions-content">
        <div class="steem-auth-transaction-item" v-for="operation in operations" :key="operation.type">
          <div>
            <h2>{{ operation.type }} operation (require:{{ operation.requiredAuth }} key)</h2>
            <form @submit.prevent="handleOperation(operation)" class="steem-auth-transaction-form">
              <div class="form-group" v-for="(fieldDef, field, index) in operation.fields" :key="field">
                <div v-if="fieldDef.type === 'string' || fieldDef.type === 'number' || fieldDef.type === 'date'">
                  <label :for="field.toString() + index">{{ field }}</label>
                  <div v-if="(operation.type === 'custom_json' && field === 'json') || 
                            (operation.type === 'escrow_transfer' && field === 'json_meta')">
                    <textarea 
                      :id="field.toString() + index"
                      :value="formatJsonForEditor(fieldDef.value)"
                      @input="updateJsonField(operation, field, ($event.target as HTMLTextAreaElement).value)"
                      placeholder="Enter JSON"
                      rows="8"
                      class="steem-auth-input"
                      style="font-family: monospace;"
                    ></textarea>
                    <div v-if="jsonErrors[operation.type + '_' + field]" class="steem-auth-error-message">
                      {{ jsonErrors[operation.type + '_' + field] }}
                    </div>
                  </div>
                  <input 
                    v-else
                    :id="field.toString() + index" 
                    :type="fieldDef.type === 'date' ? 'datetime-local' : fieldDef.type"
                    class="steem-auth-input"
                    :value="fieldDef.type === 'date' ? isoToInputFormat(fieldDef.value) : fieldDef.value"
                    @input="fieldDef.type === 'date' 
                      ? fieldDef.value = inputToIsoFormat(($event.target as HTMLInputElement).value)
                      : fieldDef.value = ($event.target as HTMLInputElement).value"
                  />
                </div>
                <div v-else-if="fieldDef.type === 'array' && (field === 'required_auths' || field === 'required_posting_auths' || field === 'required_owner_auths' || field === 'required_active_auths') && (operation.type === 'custom_json' || operation.type === 'custom_binary')">
                  <!-- Skip individual array input fields for these specific fields as they'll be handled by the auth type selector -->
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
  
              <!-- Add auth type selector for custom_json operation -->
              <div v-if="operation.type === 'custom_json' || operation.type === 'custom_binary'" class="form-group steem-auth-auth-type-selector">
                <label>Authorization Type</label>
                <div class="steem-auth-radio-options">
                  <div class="steem-auth-radio-option">
                    <input 
                      type="radio" 
                      id="auth-type-active" 
                      name="auth-type" 
                      value="active"
                      v-model="customJsonAuthType"
                      @change="updateCustomJsonAuth(operation)"
                    >
                    <label for="auth-type-active">Active</label>
                  </div>
                  <div class="steem-auth-radio-option">
                    <input 
                      type="radio" 
                      id="auth-type-posting" 
                      name="auth-type" 
                      value="posting"
                      v-model="customJsonAuthType"
                      @change="updateCustomJsonAuth(operation)"
                    >
                    <label for="auth-type-posting">Posting</label>
                  </div>
                  <div class="steem-auth-radio-option" v-if="operation.type === 'custom_binary'">
                    <input 
                      type="radio" 
                      id="auth-type-posting" 
                      name="auth-type" 
                      value="owner"
                      v-model="customJsonAuthType"
                      @change="updateCustomJsonAuth(operation)"
                    >
                    <label for="auth-type-posting">Owner</label>
                  </div>
                </div>
              </div>
              <div v-if="operation.type === 'transfer' || operation.type === 'escrow_transfer'">
                <div>
                  {{ authStore.state.account?.balance }} - {{ authStore.state.account?.sbd_balance }}
                </div>
              </div>
              <button v-if="authStore.state.isAuthenticated" @click="handleOperation(operation)" class="steem-auth-button">
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
  import { ref, watch, onMounted } from 'vue';
  import { useAuthStore } from '../stores/auth';
  import TransactionService from '../services/transaction';
  import { operations, type OperationDefinition } from '../utils/operations';
  import { type OperationDefinition as EchelonOperationDefinition } from '../utils/echelon';
  import ActiveKeyModal from './ActiveKeyModal.vue';
  
  // Define the extended operation type that includes requiredAuth
  type ExtendedOperation = EchelonOperationDefinition & {
    requiredAuth: 'active' | 'posting' | 'owner';
  };
  
  const authStore = useAuthStore();
  const loading = ref(false);
  const formValues = ref<Record<string, Record<string, any>>>({});
  const showActiveKeyModal = ref(false);
  const customJsonAuthType = ref('posting'); // Default to posting auth for custom_json
  const jsonErrors = ref<Record<string, string>>({}); // For JSON parsing errors
  const currentOperation = ref<ExtendedOperation>({
    type: 'approve_node',
    fields: {},
    requiredAuth: 'active'
  } as ExtendedOperation);
  const operationResults = ref<Record<string, { success?: string; error?: string }>>({});
  
  const isoToInputFormat = (isoString: string | number | boolean | object): string => {
    if (typeof isoString !== 'string') return '';
    // Convert ISO string to format required by datetime-local input (YYYY-MM-DDTHH:mm)
    return isoString.slice(0, 16);
  };
  
  const inputToIsoFormat = (inputString: string): string => {
    // Convert datetime-local input format to ISO string
    return new Date(inputString).toISOString().split('.')[0];
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
  
  // Move initialization to onMounted
  onMounted(() => {
    updateFormValues();
    
    // Watch for account changes
    watch(() => authStore.state.account, (newAccount) => {
      if (newAccount) {
        updateFormValues();
        
        // Initialize custom_json auth arrays for the current user
        const customJsonOp = operations.find(op => op.type === 'custom_json');
        if (customJsonOp) {
          updateCustomJsonAuth(customJsonOp);
        }
      }
    }, { immediate: true });
  });
  
  // Add new function to update custom_json auth arrays based on selection
  const updateCustomJsonAuth = (operation: OperationDefinition) => {
    if (operation.type === 'custom_json' || operation.type === 'custom_binary') {
      // Reset both arrays
      operation.fields.required_auths.value = [];
      operation.fields.required_posting_auths.value = [];
      if (operation.type === 'custom_binary') {
        operation.fields.required_owner_auths.value = [];
        operation.fields.required_active_auths.value = [];
      }
      
      // Add username to the appropriate array based on selected auth type
      if (customJsonAuthType.value === 'active') {
        operation.fields.required_auths.value = [authStore.state.username];
        // Explicitly set requiredAuth to 'active' to ensure active key is requested
        operation.requiredAuth = 'active';
      } 
      else if (customJsonAuthType.value === 'owner') {
        operation.fields.required_owner_auths.value = [authStore.state.username];
        operation.requiredAuth = 'owner';
      }
      else {
        operation.fields.required_posting_auths.value = [authStore.state.username];
        // Set back to posting for posting auth
        operation.requiredAuth = 'posting';
      }
      
      console.log(`Auth type set to: ${operation.requiredAuth}`);
      console.log(`Required auths: ${JSON.stringify(operation.fields.required_auths.value)}`);
      console.log(`Required posting auths: ${JSON.stringify(operation.fields.required_posting_auths.value)}`);
    }
  };
  
  const handleOperation = (operation: OperationDefinition) => {
    // For custom_json, update the auth arrays one more time before sending
    if (operation.type === 'custom_json') {
      updateCustomJsonAuth(operation);
      console.log(`Operation requiredAuth after update: ${operation.requiredAuth}`);
    }
  
    if ((operation.requiredAuth === 'active' || operation.requiredAuth === 'owner') && authStore.loginAuth === 'steem') {
      // Convert the operation to the expected type
      currentOperation.value = {
        type: operation.type as any,
        fields: operation.fields,
        requiredAuth: operation.requiredAuth as 'active' | 'posting' | 'owner'
      } as ExtendedOperation;
      
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
  
  interface TransactionResponse {
    id?: string;
    result?: {
      id: string;
    };
  }

  const send = async (operation: OperationDefinition) => {
    loading.value = true;
    operationResults.value[operation.type] = {};
    const tx = {} as any;
    
    // Process all fields
    Object.keys(operation.fields).forEach((key) => {
      // Special handling for JSON fields
      if ((operation.type === 'custom_json' && key === 'json') ||
          (operation.type === 'escrow_transfer' && key === 'json_meta') ||
          (key.includes('json_meta'))) {
        
        console.log(`Processing JSON field ${key} with value:`, operation.fields[key].value);
        
        // Stringify the JSON object if it's not already a string
        if (typeof operation.fields[key].value !== 'string') {
          // Make sure we're stringifying to a valid JSON string
          tx[key] = JSON.stringify(operation.fields[key].value);
          console.log(`Stringified ${key} to:`, tx[key]);
        } else {
          try {
            // If it's already a string, check if it's valid JSON
            JSON.parse(operation.fields[key].value as string);
            // If it parses successfully, use it as is - it's already a JSON string
            tx[key] = operation.fields[key].value;
            console.log(`Using string value for ${key}:`, tx[key]);
          } catch (e) {
            // If it's not valid JSON but is a string, wrap it as a JSON string
            tx[key] = JSON.stringify(operation.fields[key].value);
            console.log(`Converting invalid JSON string for ${key} to:`, tx[key]);
          }
        }
        
        // Double check that we have a string
        if (typeof tx[key] !== 'string') {
          console.error(`ERROR: ${key} is still not a string after processing:`, tx[key]);
          tx[key] = JSON.stringify(tx[key]);
        }
      } 
      // Special handling for date fields in escrow operations
      else if (operation.type.includes('escrow') && (key === 'ratification_deadline' || key === 'escrow_expiration')) {
        // Make sure dates are in ISO format
        if (operation.fields[key].type === 'date') {
          if (!operation.fields[key].value) {
            // If no date is set, use current date + 1 day for ratification and + 2 days for expiration
            const date = new Date();
            if (key === 'ratification_deadline') {
              date.setDate(date.getDate() + 1);
            } else {
              date.setDate(date.getDate() + 2);
            }
            tx[key] = date.toISOString().split('.')[0]; // Remove milliseconds
            console.log(`Auto-setting ${key} to:`, tx[key]);
          } else if (typeof operation.fields[key].value === 'string') {
            // If it's already a string, make sure it's properly formatted
            try {
              const date = new Date(operation.fields[key].value as string);
              tx[key] = date.toISOString().split('.')[0]; // Remove milliseconds
              console.log(`Formatted ${key} from string to:`, tx[key]);
            } catch (e) {
              console.error(`Error formatting date for ${key}:`, e);
              tx[key] = operation.fields[key].value;
            }
          } else {
            tx[key] = operation.fields[key].value;
          }
        } else {
          tx[key] = operation.fields[key].value;
        }
      } 
      else {
        tx[key] = operation.fields[key].value;
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

      // Handle different response formats based on auth method
      if (authStore.loginAuth === 'steem') {
        operationResults.value[operation.type] = {
          success: `Transaction sent successfully! Transaction ID: ${response.id}`
        };
      } else if (authStore.loginAuth === 'keychain') {
        // For keychain, we don't get an immediate response
        operationResults.value[operation.type] = {
          success: 'Transaction sent to Keychain for signing. Please check your Keychain extension.'
        };
      } else {
        operationResults.value[operation.type] = {
          success: `Transaction sent successfully! Transaction ID: ${response.result?.id}`
        };
      }
    } catch (err) {
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
  
  // Format JSON for the editor
  const formatJsonForEditor = (jsonValue: any): string => {
    if (typeof jsonValue === 'string') {
      try {
        // Try to parse it in case it's already a JSON string
        const parsed = JSON.parse(jsonValue);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        // If not valid JSON, just return as is
        return jsonValue;
      }
    } else {
      // If it's an object, stringify it with pretty printing
      return JSON.stringify(jsonValue, null, 2);
    }
  };
  
  // Update JSON field when editor changes
  const updateJsonField = (operation: OperationDefinition, fieldName: string, value: string) => {
    const errorKey = operation.type + '_' + fieldName;
    try {
      // Try to parse the JSON
      const parsedJson = JSON.parse(value);
      // If successful, update the field value
      operation.fields[fieldName].value = parsedJson;
      jsonErrors.value[errorKey] = '';
    } catch (e) {
      // If parsing fails, store the error
      jsonErrors.value[errorKey] = 'Invalid JSON: ' + (e as Error).message;
      // Keep the raw string in the field value
      operation.fields[fieldName].value = value;
    }
  };
  
  </script>
  