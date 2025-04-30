<template>
  <div v-if="transactionStore.state.isPending || transactionStore.state.isSuccess || transactionStore.state.isError" 
       class="transaction-status"
       :class="{
         'is-pending': transactionStore.state.isPending,
         'is-success': transactionStore.state.isSuccess,
         'is-error': transactionStore.state.isError
       }">
    <!-- Pending Message -->
    <div v-if="transactionStore.state.isPending" class="transaction-pending">
      <div class="transaction-spinner"></div>
      <p>{{ transactionStore.state.pendingMessage }}</p>
    </div>
    
    <!-- Success Message -->
    <div v-if="transactionStore.state.isSuccess" class="transaction-success">
      <div class="transaction-success-icon">✓</div>
      <p>{{ transactionStore.state.successMessage }}</p>
      <div v-if="transactionStore.state.transactionId" class="transaction-id">
        Transaction ID: {{ transactionStore.state.transactionId }}
      </div>
      <button @click="transactionStore.resetState" class="transaction-dismiss">Dismiss</button>
    </div>
    
    <!-- Error Message -->
    <div v-if="transactionStore.state.isError" class="transaction-error">
      <div class="transaction-error-icon">✗</div>
      <p>{{ transactionStore.state.errorMessage }}</p>
      <button @click="transactionStore.resetState" class="transaction-dismiss">Dismiss</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransactionStore } from '../stores/transaction';

const transactionStore = useTransactionStore();
</script>

<style scoped>
.transaction-status {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.is-pending {
  background-color: #f8f9fa;
  border-left: 4px solid #4299e1;
}

.is-success {
  background-color: #f0fff4;
  border-left: 4px solid #48bb78;
}

.is-error {
  background-color: #fff5f5;
  border-left: 4px solid #f56565;
}

.transaction-pending, .transaction-success, .transaction-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.transaction-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(66, 153, 225, 0.3);
  border-radius: 50%;
  border-top-color: #4299e1;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.transaction-success-icon {
  width: 24px;
  height: 24px;
  background-color: #48bb78;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.transaction-error-icon {
  width: 24px;
  height: 24px;
  background-color: #f56565;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.transaction-id {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 5px;
  word-break: break-all;
}

.transaction-dismiss {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.transaction-dismiss:hover {
  background-color: #edf2f7;
}

p {
  margin: 0;
}
</style> 