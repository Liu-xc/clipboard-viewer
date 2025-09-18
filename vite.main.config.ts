import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'src/renderer/main'),
  base: './',
  build: {
    outDir: path.join(__dirname, 'dist/renderer/main'),
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron']
    }
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src/renderer/main/src'),
      '@shared': path.join(__dirname, 'src/shared')
    }
  },
  server: {
    port: 3000,
    strictPort: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});