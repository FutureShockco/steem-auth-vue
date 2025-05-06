import { reactive, readonly, inject, provide } from 'vue';

export interface TransactionState {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string;
  transactionId: string;
  type: string;
  pendingMessage: string;
  successMessage: string;
}

export interface TransactionRecord {
  transactionId: string;
  type: string;
  status: 'pending' | 'success' | 'error';
  timestamp: number;
  message: string;
  errorMessage?: string;
}

export interface TransactionStore {
  state: TransactionState;
  results: Record<string, { success?: string; error?: string }>;
  transactions: TransactionRecord[];
  startTransaction: (type: string, pendingMessage?: string) => void;
  finishTransaction: (success: boolean, transactionId?: string, successMessage?: string, errorMessage?: string) => void;
  resetState: () => void;
  clearResults: (type?: string) => void;
  saveTransaction: (record: TransactionRecord) => void;
  getTransactions: () => TransactionRecord[];
  deleteTransaction: (transactionId: string) => void;
}

const defaultState: TransactionState = {
  isPending: false,
  isSuccess: false,
  isError: false,
  errorMessage: '',
  transactionId: '',
  type: '',
  pendingMessage: '',
  successMessage: ''
};

const createTransactionStore = (): TransactionStore => {
  const state = reactive<TransactionState>({...defaultState});
  // Store results for each specific operation type
  const results = reactive<Record<string, { success?: string; error?: string }>>({});
  // Store all transactions
  const transactions = reactive<TransactionRecord[]>([]);

  const startTransaction = (type: string, pendingMessage = 'Transaction sent to Keychain for signing. Please check your Keychain extension.') => {
    state.isPending = true;
    state.isSuccess = false;
    state.isError = false;
    state.errorMessage = '';
    state.transactionId = '';
    state.type = type;
    state.pendingMessage = pendingMessage;
    state.successMessage = '';
    
    // Also update the specific operation results
    if (type) {
      results[type] = { success: pendingMessage };
    }
  };

  const finishTransaction = (success: boolean, transactionId = '', successMessage = 'Transaction completed successfully!', errorMessage = 'Transaction failed') => {
    state.isPending = false;
    state.isSuccess = success;
    state.isError = !success;
    state.errorMessage = !success ? errorMessage : '';
    state.transactionId = transactionId;
    state.successMessage = success ? successMessage : '';
    
    // Also update the specific operation results
    if (state.type) {
      if (success) {
        results[state.type] = { 
          success: successMessage + (transactionId ? ` Transaction ID: ${transactionId}` : '')
        };
      } else {
        results[state.type] = { error: errorMessage };
      }
    }
    // Save transaction to history
    saveTransaction({
      transactionId: transactionId || Date.now().toString(),
      type: state.type,
      status: success ? 'success' : 'error',
      timestamp: Date.now(),
      message: success ? successMessage : '',
      errorMessage: !success ? errorMessage : undefined
    });
  };

  const resetState = () => {
    Object.assign(state, defaultState);
  };
  
  const clearResults = (type?: string) => {
    if (type) {
      // Clear results for a specific operation type
      results[type] = {};
    } else {
      // Clear all results
      Object.keys(results).forEach(key => {
        results[key] = {};
      });
    }
  };

  // Save a transaction record
  const saveTransaction = (record: TransactionRecord) => {
    transactions.unshift(record); // Add to the beginning for most-recent-first
  };

  // Get all transactions
  const getTransactions = () => transactions;

  // Delete a transaction by ID
  const deleteTransaction = (transactionId: string) => {
    const idx = transactions.findIndex(t => t.transactionId === transactionId);
    if (idx !== -1) transactions.splice(idx, 1);
  };

  return {
    state: readonly(state) as TransactionState,
    results,
    transactions,
    startTransaction,
    finishTransaction,
    resetState,
    clearResults,
    saveTransaction,
    getTransactions,
    deleteTransaction
  };
};

const transactionStoreSymbol = Symbol('transactionStore');

const defaultStore = createTransactionStore();

export const provideTransactionStore = () => {
  const store = createTransactionStore();
  provide(transactionStoreSymbol, store);
  return store;
};

export const useTransactionStore = () => {
  const store = inject<TransactionStore>(transactionStoreSymbol);
  return store || defaultStore;
}; 