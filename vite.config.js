import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase SDK into its own cached chunk
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Split other large vendor deps
          vendor: ['react', 'react-dom', 'framer-motion'],
          charts: ['recharts'],
        }
      }
    }
  }
})
