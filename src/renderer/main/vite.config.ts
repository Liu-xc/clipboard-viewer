import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  base: './',
  build: {
    outDir: resolve(__dirname, '../../../dist/renderer/main'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@shared': resolve(__dirname, '../../../shared'),
      '@utils': resolve(__dirname, '../../../utils'),
    },
  },
  server: {
    port: 3000,
    host: 'localhost',
    strictPort: true,
    hmr: {
      port: 3001,
      host: 'localhost',
      protocol: 'ws',
      overlay: true,
    },
    cors: true,
  },
});