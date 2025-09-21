import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  base: './',
  // 缓存配置优化
  cacheDir: resolve(__dirname, '../../../node_modules/.vite/floating'),
  build: {
    outDir: resolve(__dirname, '../../../dist/renderer/floating'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@shared': resolve(__dirname, '../../shared'),
    },
  },
  server: {
    port: 5174,
    host: 'localhost',
    strictPort: true,
    // 强制优化依赖
    force: process.env.CLEAR_CACHE === 'true',
    hmr: {
      port: 5175,
    },
    cors: true,
  },
  // 依赖优化配置
  optimizeDeps: {
    // 强制预构建依赖
    force: process.env.CLEAR_CACHE === 'true',
    // 缓存目录
    cacheDir: resolve(__dirname, '../../../node_modules/.vite/floating/deps'),
    // 包含需要预构建的依赖
    include: [
      'react',
      'react-dom',
      '@mantine/core',
      '@mantine/hooks'
    ],
  },
});