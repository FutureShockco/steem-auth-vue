import vue from 'eslint-plugin-vue';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';

/** @type {import("eslint").Linter.FlatConfig} */
export default [
    {
        ignores: ['dist/', 'node_modules/'],
    },
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: 2021,
                sourceType: 'module',
            },
        },
        plugins: {
            vue,
            '@typescript-eslint': tseslint,
        },
        rules: {
            'vue/html-self-closing': 'off',
            'vue/no-multiple-template-root': 'off',
            'vue/no-v-html': 'off',
            'vue/multi-word-component-names': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-console': 'off',
            'no-debugger': 'off',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-console': 'off',
            'no-debugger': 'off',
        },
    },
];
