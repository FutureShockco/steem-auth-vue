import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        dts({
            insertTypesEntry: true,
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
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 2980,
        allowedHosts: ['steemx.com']
    },
}) 