<template>
  <div class="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--background-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  min-height: 100vh;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }
}
</style>