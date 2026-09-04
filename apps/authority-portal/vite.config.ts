import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@civic/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
    },
  },
  server: {
    port: 3003,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/backend-health': {
        target: 'http://localhost:4000',
        rewrite: (p) => p.replace(/^\/backend-health/, '/health'),
        changeOrigin: true,
      },
      '/vision-api': {
        target: 'http://localhost:3000',
        rewrite: (p) => p.replace(/^\/vision-api/, '/api'),
        changeOrigin: true,
      },
    },
  },
});
