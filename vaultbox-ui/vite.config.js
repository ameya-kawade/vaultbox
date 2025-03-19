import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // '/auth': {
      //   target: 'http://localhost:5000',
      //   changeOrigin: true,
      //   secure: false,
      // },
      '/messages': {
        target: 'http://vaultbox',
        changeOrigin: true,
        secure: false,
      },
      '/channels': {
        target: 'http://vaultbox',
        changeOrigin: true,
        secure: false,
      },
      '/chat': {
        target: 'http://vaultbox',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: "debug",
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@chat': path.resolve(__dirname, './src/features/chat'),
      '@login': path.resolve(__dirname, './src/features/login'),
      '@meet': path.resolve(__dirname, './src/features/meeting'),
    },
  },
});