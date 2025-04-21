<template>
  <div class="transaction-test">
    <h2>Transaction Test</h2>

    <div v-if="!authStore.state.isAuthenticated" class="not-authenticated">
      <p>Please log in first to test transactions</p>
    </div>

    <div v-else class="transaction-options">
      <div class="transaction-type" v-for="operation in operations" :key="operation.type">
        <div >
          <h2>{{ operation.type }} operation (require:{{ operation.requiredAuth }} key)</h2>
          <form @submit.prevent="handleOperation(operation)" >
            <div class="form-group" v-for="(fieldDef, field, index) in operation.fields" :key="field">
              <div v-if="fieldDef.type === 'string' || fieldDef.type === 'number' || fieldDef.type === 'date'">
                <label :for="field.toString() + index">{{ field }}</label>
                <input :id="field.toString() + index" :type="fieldDef.type"
                  v-model="fieldDef.value" @input="updateValue(operation.type, field, fieldDef.type, fieldDef.value)" />
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

            <div v-if="authStore.state.isAuthenticated" @click="handleOperation(operation)"
              class='send-button'>
              Send</div>
          </form>
        </div>
      </div>
      <div class="transaction-type">
        <h3>Custom JSON Transaction</h3>
        <div class="form-group">
          <label for="id">ID</label>
          <input id="id" v-model="customJsonData.id" type="text" placeholder="Transaction ID (e.g., 'app-name')" />
        </div>
        <div class="form-group">
          <label for="json">JSON Data</label>
          <textarea id="json" v-model="customJsonData.json" placeholder="Enter JSON data" rows="10"></textarea>
        </div>
        <div class="form-group">
          <label for="requiredAuths">Required Auths</label>
          <input id="requiredAuths" v-model="customJsonData.required_auths" type="text"
            placeholder="Comma-separated usernames (optional)" />
        </div>
        <div class="form-group">
          <label for="requiredPostingAuths">Required Posting Auths</label>
          <input id="requiredPostingAuths" v-model="customJsonData.required_posting_auths" type="text"
            placeholder="Comma-separated usernames (optional)" />
        </div>
        <button @click="sendCustomJson" :disabled="!canSendCustomJson || loading" class="send-button">
          {{ loading ? 'Sending...' : 'Send Custom JSON' }}
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="success" class="success-message">
        {{ success }}
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
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../src/stores/auth';
import TransactionService from '../src/services/transaction';
import { operations, type OperationDefinition } from '../src/utils/operations';
import ActiveKeyModal from '../src/components/ActiveKeyModal.vue';

const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');
const success = ref('');
const formValues = ref<Record<string, Record<string, any>>>({});
const showActiveKeyModal = ref(false);
const currentOperation = ref<OperationDefinition>({} as OperationDefinition);

operations.forEach(operation => {
  formValues.value[operation.type] = {};
  console.log(operation.fields)
  Object.keys(operation.fields).forEach(field => {
    if (field === 'author' || field === 'voter' || field === 'from' || field === 'creator' || field === 'follower') {
      operation.fields[field].value = authStore.state.username;
      formValues.value[operation.type][field] = authStore.state.username;
    }
    else
      formValues.value[operation.type][field] = '';
  });
});

// Custom JSON data
const customJsonData = ref({
  id: 'steem-auth-test',
  json: '{"test": "test"}',
  required_auths: '',
  required_posting_auths: ''
});

const updateValue = (operationType: string, field: string | number, fieldType: string, value: string | number | boolean) => {
  if (fieldType === 'boolean') {
    formValues.value[operationType][field] = Boolean(value); // Convert to number
  }
  else if (fieldType === 'number') {
    formValues.value[operationType][field] = Number(value); // Convert to number
  } else {
    formValues.value[operationType][field] = value; // Keep as string
  }
};
// Watch for account changes
watch(() => authStore.state.account, (newAccount) => {
  if (newAccount) {
    customJsonData.value.required_posting_auths = newAccount.name;
  }
}, { immediate: true });

// Computed property for validation
const canSendCustomJson = computed(() => {
  try {
    if (!customJsonData.value.id || !customJsonData.value.json) return false;
    // Validate JSON
    JSON.parse(customJsonData.value.json);
    return true;
  } catch {
    return false;
  }
});

const handleOperation = (operation: OperationDefinition) => {
  if (operation.requiredAuth === 'active' && authStore.loginAuth === 'steem') {
    currentOperation.value = operation;
    showActiveKeyModal.value = true;
  } else {
    send(operation);
  }
};

const closeActiveKeyModal = () => {
  showActiveKeyModal.value = false;
  currentOperation.value = {} as OperationDefinition;
};

const handleActiveKeySubmit = async (activeKey: string) => {
  if (!currentOperation.value) return;

  const tx = {} as any;
  Object.keys(currentOperation.value.fields).forEach((key) => {
    tx[key] = currentOperation.value!.fields[key].value;
  });

  try {
    const response = await TransactionService.send(currentOperation.value.type, tx, {
      requiredAuth: 'active',
      activeKey: activeKey
    });
    success.value = response;
    closeActiveKeyModal();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send transaction';
  }
};

const send = async (operation: OperationDefinition) => {
  const tx = {} as any;
  Object.keys(operation.fields).forEach((key) => {
    tx[key] = operation.fields[key].value;
  });
  const response = await TransactionService.send(operation.type, tx, {
    requiredAuth: operation.requiredAuth
  });
  success.value = response;
  console.log(response);
};

// Transaction method
const sendCustomJson = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    // Parse JSON to validate it's valid
    const jsonData = JSON.parse(customJsonData.value.json);

    // Process required auths
    const requiredAuths = customJsonData.value.required_auths
      ? customJsonData.value.required_auths.split(',').map(auth => auth.trim())
      : [];

    // Process required posting auths
    const requiredPostingAuths = customJsonData.value.required_posting_auths
      ? customJsonData.value.required_posting_auths.split(',').map(auth => auth.trim())
      : [];

    const result = await TransactionService.send('custom_json', {
      id: customJsonData.value.id,
      json: JSON.stringify(jsonData),
      required_auths: requiredAuths,
      required_posting_auths: requiredPostingAuths
    });

    // Handle different response formats
    if (authStore.loginAuth === 'steem') {
      success.value = `Custom JSON sent successfully! Transaction ID: ${result.id}`;
    } else {
      success.value = `Custom JSON sent successfully! Transaction ID: ${result.result.id}`;
    }
    console.log('Custom JSON result:', result);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send custom JSON';
    console.error('Custom JSON error:', err);
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

.error-message {
  color: #d32f2f;
  padding: 10px;
  margin-top: 20px;
  background: #ffebee;
  border-radius: 4px;
}

.success-message {
  color: #388e3c;
  padding: 10px;
  margin-top: 20px;
  background: #e8f5e9;
  border-radius: 4px;
}
</style>