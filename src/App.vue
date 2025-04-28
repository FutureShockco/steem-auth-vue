<template>
    <div class="app">
        <router-view />
    </div>
</template>

<style>
:root {
    --primary-color: #0039CB;
    --primary-hover: #002cb3;
    --secondary-color: #10B981;
    --accent-color: #6366F1;
    --background-color: #0E0E2C;
    --card-background: #FFFFFF;
    --text-color: #0F172A;
    --text-color-light: #FFFFFF;
    --text-secondary: #64748B;
    --border-radius: 16px;
    --border-radius-sm: 12px;
    --box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --transition: all 0.15s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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

h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
}

/* Button styles */
button {
    background-color: var(--primary-color);
    color: var(--text-color-light);
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9375rem;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

button:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
}

/* Card styles */
.card {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 1.5rem;
    transition: var(--transition);
}

/* Form elements */
input, textarea, select {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1px solid #E2E8F0;
    border-radius: var(--border-radius-sm);
    margin-bottom: 1rem;
    font-size: 0.9375rem;
    transition: var(--transition);
    background-color: var(--card-background);
}

input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.positive {
    color: var(--secondary-color);
}

.negative {
    color: #EF4444;
}

/* Responsive design */
@media (max-width: 768px) {
    .app {
        padding: 1rem;
    }
}
</style> 