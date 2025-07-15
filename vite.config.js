import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    hmr: false  // disables hot reload websocket
  }
  // base:"/AryaAI", // Commented out for local development
})
