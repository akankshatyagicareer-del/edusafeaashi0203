import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://your-api-url',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    'process.env': {},
  },
});
