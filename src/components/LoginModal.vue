<template>
  <div v-if="visible" class="steem-auth-modal-overlay" @click.self="onClose">
    <div class="steem-auth-modal-content" @click.stop>
      <div class="steem-auth-modal-header">
        <h2>Steem Authentication</h2>
        <button class="steem-auth-close-button" @click="onClose">&times;</button>
      </div>
      <div class="steem-auth-modal-body">
        <div v-if="typedAccounts.length" class="steem-auth-accounts-row">
          <div v-for="acc in typedAccounts" :key="acc.username" class="steem-auth-account-card" @click="handleAccountCardClick(acc)">
            <img :src="`https://steemitimages.com/u/${acc.username}/avatar`" :alt="acc.username" class="steem-auth-account-avatar" />
            <div class="steem-auth-account-username">{{ acc.username }}</div>
          </div>
        </div>
        <div class="steem-auth-login-section">
          <div v-if="addingAccount && currentUsername" class="steem-auth-add-account-heading">
            <div class="steem-auth-current-account-msg">
              Currently logged in as <strong>{{ currentUsername }}</strong> ({{ loginAuth }})
            </div>
            <h3>Add Another Account</h3>
          </div>

          <form v-if="enableDirectLogin || enableKeychain" @submit.prevent="onSubmit" class="steem-auth-login-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input id="username" :value="username" @input="$emit('update:username', ($event.target as HTMLInputElement)?.value)" type="text" required placeholder="Enter your Steem username" class="steem-auth-input" :class="{ 'error': usernameError }" />
              <span v-if="usernameError" class="steem-auth-error-text">{{ usernameError }}</span>
            </div>
            <div class="form-group" v-if="!useKeychain && enableDirectLogin">
              <label for="posting-key">Posting Key</label>
              <input id="posting-key" :value="postingKey" @input="$emit('update:postingKey', ($event.target as HTMLInputElement)?.value)" type="password" required placeholder="Enter your posting key" class="steem-auth-input" :class="{ 'error': postingKeyError }" />
              <span v-if="postingKeyError" class="steem-auth-error-text">{{ postingKeyError }}</span>
            </div>
            <div v-if="enableKeychain" class="form-group steem-auth-keychain-option">
              <label class="steem-auth-checkbox-container">
                <input type="checkbox" :checked="useKeychain" @change="$emit('update:useKeychain', ($event.target as HTMLInputElement)?.checked)" :disabled="!hasKeychain" />
                <span class="steem-auth-checkmark"></span>
                <span class="steem-auth-label-text">Use Steem Keychain</span>
                <div class="steem-auth-keychain-container">
                  <div :class="['steem-auth-keychain-status', hasKeychain ? 'available' : 'unavailable']">
                    <span v-if="hasKeychain">Keychain Available</span>
                    <span v-else>Keychain Not Found</span>
                  </div>
                  <div v-if="!hasKeychain" class="steem-auth-keychain-download">
                    <a href="https://chrome.google.com/webstore/detail/steem-keychain/lkcjlnjfpbikmcmbachjpdbijejflpcm" target="_blank">
                      Download Steem Keychain
                    </a>
                  </div>
                </div>
              </label>
            </div>
            <button type="submit" class="steem-auth-button full-width" :disabled="loading">
              <span v-if="loading" class="steem-auth-spinner"></span>
              <span>{{ loading ? 'Authenticating...' : 'Login' }}</span>
            </button>
          </form>

          <div v-if="enableSteemLogin && (enableDirectLogin || enableKeychain)" class="steem-auth-divider">
            <span>or</span>
          </div>
          <button v-if="enableSteemLogin" @click="$emit('steemlogin')" class="steem-auth-button full-width">
            <span>Login with SteemLogin</span>
          </button>
        </div>
        <div v-if="error" class="steem-auth-error-message">
          <span class="steem-auth-error-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps({
  visible: Boolean,
  loading: Boolean,
  error: String,
  username: String,
  postingKey: String,
  useKeychain: Boolean,
  hasKeychain: Boolean,
  usernameError: String,
  postingKeyError: String,
  enableSteemLogin: Boolean,
  enableDirectLogin: Boolean,
  enableKeychain: Boolean,
  addingAccount: Boolean,
  loginAuth: String,
  currentUsername: String,
  accounts: { type: Array, default: () => [] }
});
const typedAccounts = computed(() => (props.accounts || []) as { username: string; loginAuth: string; accessToken?: string; encryptedPk?: string }[]);
const emit = defineEmits([
  'close',
  'submit',
  'steemlogin',
  'update:username',
  'update:postingKey',
  'update:useKeychain',
  'auto-login'
]);
function onClose() {
  emit('close');
}
function onSubmit() {
  emit('submit');
}
function handleAccountCardClick(acc: { username: string; loginAuth: string; accessToken?: string; encryptedPk?: string }) {
  // Try auto-login for all account types
  emit('auto-login', acc);
}
</script>

<style>
.steem-auth-accounts-row {
  display: flex;
  gap: 1em;
  margin-bottom: 1.5em;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.steem-auth-account-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5em 1em 0.7em 1em;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
  min-width: 80px;
  max-width: 110px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.steem-auth-account-card:hover {
  border-color: #3182ce;
  box-shadow: 0 2px 8px rgba(49,130,206,0.12);
}
.steem-auth-account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.4em;
  background: #e2e8f0;
}
.steem-auth-account-username {
  font-size: 0.97em;
  font-weight: 500;
  color: #222;
  text-align: center;
  word-break: break-all;
}
</style>

