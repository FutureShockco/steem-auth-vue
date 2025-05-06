<template>
  <div v-if="visible" class="steem-auth-modal-overlay" @click.self="onClose">
    <div class="steem-auth-modal-content" @click.stop>
      <div class="steem-auth-modal-header">
        <h2>Manage Steem Accounts</h2>
        <button class="steem-auth-close-button" @click="onClose">&times;</button>
      </div>
      <div class="steem-auth-modal-body">
        <div class="steem-auth-accounts-list">
          <div v-for="acc in accounts" :key="acc.username" class="steem-auth-accounts-item">
            <div class="steem-auth-accounts-info">
              <span class="steem-auth-accounts-username">{{ acc.username }}</span>
              <span class="steem-auth-accounts-auth">({{ acc.loginAuth }})</span>
              <span v-if="acc.username === currentUsername" class="steem-auth-accounts-current">(Current)</span>
            </div>
            <div class="steem-auth-accounts-actions">
              <button
                class="steem-auth-button"
                :disabled="acc.username === currentUsername"
                @click="$emit('switch', acc.username)"
              >Switch</button>
              <button
                class="steem-auth-button steem-auth-button-danger"
                :disabled="acc.username === currentUsername"
                @click="confirmDelete(acc.username)"
              >Delete</button>
            </div>
          </div>
        </div>
        <div v-if="deleteConfirm" class="steem-auth-modal-confirm">
          <span>Delete account '<strong>{{ deleteConfirm }}</strong>'? This cannot be undone.</span>
          <button class="steem-auth-button steem-auth-button-danger" @click="doDelete">Confirm</button>
          <button class="steem-auth-button" @click="deleteConfirm = null">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['close', 'switch', 'delete']);

function onClose() {
  emit('close');
}

defineProps<{
  visible: boolean;
  accounts: { username: string; loginAuth: string }[];
  currentUsername: string;
}>();

const deleteConfirm = ref<string | null>(null);

function confirmDelete(username: string) {
  deleteConfirm.value = username;
}
function doDelete() {
  if (deleteConfirm.value) {
    emit('delete', deleteConfirm.value);
    deleteConfirm.value = null;
  }
}
</script>

// Styles have been moved to global.css 