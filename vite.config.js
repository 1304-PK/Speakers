import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:6001',
        ws: true
      }
    }
  }
})
