import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                cart: resolve(__dirname, 'src/cart/index.html'),
                checkout: resolve(__dirname, 'src/cart/checkout.html'),
            }
        }
    }
})

