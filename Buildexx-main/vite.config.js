import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Only proxy the specific API routes we know exist on the backend
      // and explicitly exclude file-like paths if possible, but easier to just whitelist
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api/images': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      // If there are other backend controllers like PropertyController, proxy them too
      '/api/users': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/admin': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/enquiries': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/payments': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/withdrawals': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/properties': { target: 'http://localhost:8081', changeOrigin: true },
    }
  }
})