import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      // Forward /api/* to the production Vercel functions during local dev
      // so /api/budget, /api/announcements, /api/notifications, etc. work.
      '/api': {
        target: 'https://app.zpc.finance',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
