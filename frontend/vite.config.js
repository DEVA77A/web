import { defineConfig } from 'vite'

// Minimal Vite config without ESM-only plugins to avoid require/ESM loading issues in some
// Node environments. React support still works; HMR may be less feature-rich without plugin.
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
