import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        credentials: true,
      },
      // FIX: without this, the Socket.IO client (Messagepage.jsx) falls
      // back to window.location.origin in dev (since VITE_API_URL isn't
      // set locally), which points at the Vite dev server itself -- and
      // Vite doesn't speak Socket.IO. The /api proxy above only covers
      // plain HTTP fetch calls, not the websocket upgrade Socket.IO needs,
      // so it needs its own entry with ws: true.
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    }
  }
})