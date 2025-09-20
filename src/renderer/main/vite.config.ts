import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  base: './',
  // 缓存配置优化
  cacheDir: resolve(__dirname, '../../../node_modules/.vite/main'),
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
    // 强制优化依赖
    force: process.env.CLEAR_CACHE === 'true',
    hmr: {
      port: 3001,
      host: 'localhost',
      protocol: 'ws',
      overlay: true,
    },
    cors: true,
  },
  // 依赖优化配置
  optimizeDeps: {
    // 强制预构建依赖
    force: process.env.CLEAR_CACHE === 'true',
    // 缓存目录
    cacheDir: resolve(__dirname, '../../../node_modules/.vite/main/deps'),
    // 包含需要预构建的依赖
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/notifications'
    ],
  },
});