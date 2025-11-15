import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
          // Also proxy root API endpoints
          '/commands': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
          '/execute': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
          '/docs': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
          '/openapi.json': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
          '/files': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
