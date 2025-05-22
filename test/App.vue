<template>
  <div class="test-app" :class="{ 'dark-theme': isDarkTheme }">
    <nav class="navbar">
      <div class="navbar-brand">
        <h1>Steem Auth Test</h1>
      </div>
      <div class="navbar-menu">
        <div class="auth-container">
          <SteemAuth @theme-change="handleThemeChange" appName="future.app" callbackURL="http://localhost:3000" steemApi="https://api.justyy.com" steemApiOptions="{}" />
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
        <div v-show="activeTab === 'steem'" class="tab-panel">
          <SteemTransactions />
        </div>
        <div v-show="activeTab === 'echelon'" class="tab-panel">
          <EchelonTransactions />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// @ts-ignore - Ignore the import error for the built package in development
import { SteemAuth, SteemTransactions, EchelonTransactions, useAuthStore } from '../dist/steem-auth-vue.es.js';
//import { SteemAuth, SteemTransactions, EchelonTransactions, useAuthStore } from '../src/index';

import '../dist/style.css';

const activeTab = ref('steem');
const isDarkTheme = ref(false);

// Handle theme changes from the component
const handleThemeChange = (isDark: boolean): void => {
  console.log('Theme changed:', isDark ? 'dark' : 'light');
  isDarkTheme.value = isDark;
};
</script>

<style>
:root {
  --bg-color: #f8f9fa;
  --text-color: #333;
  --card-bg: #ffffff;
  --card-border: #e0e0e0;
  --tab-active: #1a73e8;
}

.dark-theme {
  --bg-color: #1e293b;
  --text-color: #e2e8f0;
  --card-bg: #0f172a;
  --card-border: #334155;
  --tab-active: #3b82f6;
}

.test-app {
  margin: 0 auto;
  padding: 0;
  text-align: center;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
  transition: all 0.3s ease;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--card-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
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
  background: var(--card-bg);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  color: var(--text-color);
}

.tab-button:hover {
  background: var(--card-border);
}

.tab-button.active {
  background: var(--tab-active);
  color: white;
}

.tab-content {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  transition: all 0.3s ease;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--text-color);
  margin-top: 0;
}
</style> 