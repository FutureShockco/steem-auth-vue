import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            // Exclude test directory from Vue processing
            exclude: [/test\//]
        }),
        dts({
            insertTypesEntry: true,
            exclude: ['test/**', '**/node_modules/**'],
        }),
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'SteemAuthVue',
            fileName: (format) => `steem-auth-vue.${format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: ['vue', 'pinia', 'dsteem'],
            output: {
                globals: {
                    vue: 'Vue',
                    pinia: 'Pinia',
                    dsteem: 'dsteem'
                }
            }
        },
        // Explicitly exclude test directory by setting outDir to dist
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // Exclude test directory from file system watching
    optimizeDeps: {
        exclude: ['test/**/*']
    },
    server: {
        port: 2980,
        allowedHosts: ['steemx.com']
    },
}) 