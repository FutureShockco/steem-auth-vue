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