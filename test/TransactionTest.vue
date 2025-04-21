<template>
  <div class="transaction-test">
    <h2>Transaction Test</h2>

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
                <input :id="field.toString() + index" :type="fieldDef.type" v-model="fieldDef.value"
                  @input="updateValue(operation.type, field, fieldDef.type, fieldDef.value)" />
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
              Send</div>
          </form>
        </div>
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
      @success="handleSuccess" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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
const customJsonData = ref({
  id: '',
  json: '',
  required_auths: '',
  required_posting_auths: ''
});

const updateValue = (operationType: string, field: string | number, fieldType: string, value: string | number | boolean) => {
  if (fieldType === 'boolean') {
    formValues.value[operationType][field] = Boolean(value);
  }
  else if (fieldType === 'number') {
    formValues.value[operationType][field] = Number(value);
  } else {
    formValues.value[operationType][field] = value;
  }
};

const updateFormValues = () => {
  operations.forEach(operation => {
    formValues.value[operation.type] = {};
    Object.keys(operation.fields).forEach(field => {
      if (field === 'author' || field === 'voter' || field === 'from' || field === 'creator' || field === 'follower') {
        operation.fields[field].value = authStore.state.username;
        formValues.value[operation.type][field] = authStore.state.username;
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
    currentOperation.value = operation;
    showActiveKeyModal.value = true;
  } else {
    send(operation);
  }
};

const closeActiveKeyModal = () => {
  console.log('Parent: Closing active key modal');
  showActiveKeyModal.value = false;
  currentOperation.value = {} as OperationDefinition;
};

const handleSuccess = (result: any) => {
  console.log('Parent: Handling success', result);
  showSuccess(`Transaction sent successfully! Transaction ID: ${result.id}`);
};

const showSuccess = (message: string) => {
  success.value = message;
};

const send = async (operation: OperationDefinition) => {
  loading.value = true;
  error.value = '';
  success.value = '';
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
      success.value = `Transaction sent successfully! Transaction ID: ${response.id}`;
    } else {
      success.value = `Transaction sent successfully! Transaction ID: ${response.result.id}`;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send transaction';
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