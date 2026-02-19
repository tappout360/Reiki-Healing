import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    host: '0.0.0.0',
  },
  build: {
    // Performance: split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-toast': ['react-hot-toast'],
        }
      }
    },
    // Use built-in esbuild minifier (no extra install needed)
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    // Target modern browsers for smaller output
    target: 'es2020',
  },
  // Strip console.log in production via esbuild
  esbuild: {
    drop: ['console', 'debugger'],
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'react-hot-toast']
  }
})
