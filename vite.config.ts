import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split React ecosystem into separate chunks
            if (id.includes('react-dom')) {
              return 'react-dom-vendor';
            }
            if (id.includes('react-router')) {
              return 'react-router-vendor';
            }
            if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-router')) {
              return 'react-vendor';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Utilities
            if (id.includes('date-fns') || id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            // State management
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            // All other dependencies
            return 'vendor';
          }
        },
      },
    },
  },
})
