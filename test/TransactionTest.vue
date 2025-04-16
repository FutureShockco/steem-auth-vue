<template>
  <div class="transaction-test">
    <h2>Transaction Test</h2>
    
    <div v-if="!authStore.state.isAuthenticated" class="not-authenticated">
      <p>Please log in first to test transactions</p>
    </div>

    <div v-else class="transaction-options">
      <div class="transaction-type">
        <h3>Custom JSON Transaction</h3>
        <div class="form-group">
          <label for="id">ID</label>
          <input
            id="id"
            v-model="customJsonData.id"
            type="text"
            placeholder="Transaction ID (e.g., 'app-name')"
          />
        </div>
        <div class="form-group">
          <label for="json">JSON Data</label>
          <textarea
            id="json"
            v-model="customJsonData.json"
            placeholder="Enter JSON data"
            rows="10"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="requiredAuths">Required Auths</label>
          <input
            id="requiredAuths"
            v-model="customJsonData.required_auths"
            type="text"
            placeholder="Comma-separated usernames (optional)"
          />
        </div>
        <div class="form-group">
          <label for="requiredPostingAuths">Required Posting Auths</label>
          <input
            id="requiredPostingAuths"
            v-model="customJsonData.required_posting_auths"
            type="text"
            placeholder="Comma-separated usernames (optional)"
          />
        </div>
        <button 
          @click="sendCustomJson" 
          :disabled="!canSendCustomJson || loading"
          class="send-button"
        >
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../src/stores/auth';
import TransactionService from '../src/services/transaction';

const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');
const success = ref('');

// Custom JSON data
const customJsonData = ref({
  id: 'steem-auth-test',
  json: '{"test": "test"}',
  required_auths: '',
  required_posting_auths: ''
});

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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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