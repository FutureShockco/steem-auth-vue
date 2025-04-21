<template>
  <div class="app">
    <h1>Steem Auth Test</h1>
    <SteemAuth />
    <TransactionTest />
  </div>
</template>

<script setup lang="ts">
import SteemAuth from '../src/components/SteemAuth.vue';
import TransactionTest from './TransactionTest.vue';
import './styles/steem-auth-custom.css';
</script>

<style>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

</style> 