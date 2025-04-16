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
</script>

<style>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}
</style> 