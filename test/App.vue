<template>
  <div class="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <h1>Steem Auth Test</h1>
      </div>
      <div class="navbar-menu">
        <div class="auth-container">
          <SteemAuth />
        </div>
      </div>
    </nav>
    <div class="content">
      <div class="tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'steem' }"
          @click="activeTab = 'steem'"
        >
          Steem Transactions
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'echelon' }"
          @click="activeTab = 'echelon'"
        >
          Echelon Transactions
        </button>
      </div>
      <div class="tab-content">
        <TransactionTest v-if="activeTab === 'steem'" />
        <EchelonTest v-if="activeTab === 'echelon'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SteemAuth from '../src/components/SteemAuth.vue';
import TransactionTest from './TransactionTest.vue';
import EchelonTest from './EchelonTest.vue';

const activeTab = ref('steem');
</script>

<style>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  text-align: center;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-container {
  display: flex;
  align-items: center;
}

.content {
  padding: 2rem;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: #e0e0e0;
}

.tab-button.active {
  background: #1a73e8;
  color: white;
}

.tab-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
}
</style> 