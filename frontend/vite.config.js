import { defineConfig } from 'vite'

// Minimal Vite config without ESM-only plugins to avoid require/ESM loading issues in some
// Node environments. React support still works; HMR may be less feature-rich without plugin.
export default defineConfig({
  // Use root-relative base for Vercel deployments. Remove the GitHub Pages base '/web/'.
  base: '/',
  server: {
    // bind to all interfaces (0.0.0.0) so localhost and network addresses work reliably
    host: '0.0.0.0',
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
