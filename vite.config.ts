import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize build to prevent esbuild socket errors
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    // Prevent socket errors by configuring esbuild properly
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  server: {
    // Improve dev server stability
    hmr: {
      overlay: true,
    },
    watch: {
      // Reduce file watching overhead
      usePolling: false,
    },
  },
  optimizeDeps: {
    // Optimize dependency pre-bundling
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'react-hot-toast',
    ],
  },
})
