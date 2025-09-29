import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://edusafe-i71e.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Base path for production - important for Vercel
  base: './',
  define: {
    'process.env': {}
  }
})