<template>
  <div v-if="show" class="steem-auth-modal-overlay" @click.self="closeModal">
    <div class="steem-auth-modal-content" @click.stop>
      <div class="steem-auth-modal-header">
        <h2>{{ mode === 'set' ? 'Set a 4-Digit PIN' : 'Enter Your 4-Digit PIN' }}</h2>
        <button class="steem-auth-close-button" @click="closeModal">&times;</button>
      </div>
      <div class="steem-auth-modal-body">
        <form @submit.prevent="handleSubmit" class="pin-form">
          <div class="pin-input-row">
            <input v-for="(_, idx) in pinDigits" :key="idx" :ref="el => pinInputs[idx] = el as HTMLInputElement" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*"
              class="pin-input" :class="{ error: error && idx === errorIndex }"
              v-model="pinDigits[idx]" @input="onInput(idx, $event)" @keydown.backspace="onBackspace(idx, $event)"
              autocomplete="off" />
          </div>
          <div v-if="mode === 'set'" class="pin-confirm-row">
            <label>Confirm PIN</label>
            <div class="pin-input-row">
              <input v-for="(_, idx) in confirmDigits" :key="'c' + idx" :ref="el => confirmInputs[idx] = el as HTMLInputElement" maxlength="1" type="password" inputmode="numeric" pattern="[0-9]*"
                class="pin-input" :class="{ error: error && idx === errorIndex && confirmError }"
                v-model="confirmDigits[idx]" @input="onConfirmInput(idx, $event)" @keydown.backspace="onConfirmBackspace(idx, $event)"
                autocomplete="off" />
            </div>
          </div>
          <div v-if="error" class="steem-auth-error-text">{{ error }}</div>
          <button type="submit" class="steem-auth-button full-width" :disabled="loading">
            <span v-if="loading" class="steem-auth-spinner"></span>
            <span>{{ loading ? 'Processing...' : (mode === 'set' ? 'Set PIN' : 'Unlock') }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'set' | 'unlock';
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', pin: string): void;
}>();

const pinDigits = ref(['', '', '', '']);
const confirmDigits = ref(['', '', '', '']);
const error = ref('');
const errorIndex = ref(-1);
const confirmError = ref(false);

const pinInputs = ref<HTMLInputElement[]>([]);
const confirmInputs = ref<HTMLInputElement[]>([]);

watch(() => props.show, (val) => {
  if (val) {
    pinDigits.value = ['', '', '', ''];
    confirmDigits.value = ['', '', '', ''];
    error.value = '';
    errorIndex.value = -1;
    confirmError.value = false;
    nextTick(() => {
      if (pinInputs.value[0]) pinInputs.value[0].focus();
    });
  }
});

function onInput(idx: number, e: Event) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
  pinDigits.value[idx] = val;
  if (val && idx < 3 && pinInputs.value[idx + 1]) {
    pinInputs.value[idx + 1].focus();
  }
}
function onBackspace(idx: number, _e: KeyboardEvent) {
  if (!pinDigits.value[idx] && idx > 0 && pinInputs.value[idx - 1]) {
    pinInputs.value[idx - 1].focus();
  }
}
function onConfirmInput(idx: number, e: Event) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
  confirmDigits.value[idx] = val;
  if (val && idx < 3 && confirmInputs.value[idx + 1]) {
    confirmInputs.value[idx + 1].focus();
  }
}
function onConfirmBackspace(idx: number, _e: KeyboardEvent) {
  if (!confirmDigits.value[idx] && idx > 0 && confirmInputs.value[idx - 1]) {
    confirmInputs.value[idx - 1].focus();
  }
}
function handleSubmit() {
  error.value = '';
  errorIndex.value = -1;
  confirmError.value = false;
  const pin = pinDigits.value.join('');
  if (pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) {
    error.value = 'Please enter a valid 4-digit PIN.';
    errorIndex.value = pinDigits.value.findIndex(d => !d);
    return;
  }
  if (props.mode === 'set') {
    const confirmPin = confirmDigits.value.join('');
    if (confirmPin.length !== 4 || !/^[0-9]{4}$/.test(confirmPin)) {
      error.value = 'Please confirm your 4-digit PIN.';
      errorIndex.value = confirmDigits.value.findIndex(d => !d);
      confirmError.value = true;
      return;
    }
    if (pin !== confirmPin) {
      error.value = 'PINs do not match.';
      errorIndex.value = 0;
      confirmError.value = true;
      return;
    }
  }
  emit('submit', pin);
}
function closeModal() {
  emit('close');
}
</script>

<style scoped>
.pin-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pin-input-row {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
  justify-content: center;
}
.pin-input {
  width: 2.5em;
  height: 2.5em;
  font-size: 2em;
  text-align: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f7fafc;
  outline: none;
  transition: border-color 0.2s;
}
.pin-input:focus {
  border-color: #3182ce;
}
.pin-input.error {
  border-color: #e53e3e;
}
.pin-confirm-row {
  margin-bottom: 1em;
  text-align: center;
}
</style> 