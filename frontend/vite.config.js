import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/blog/',
  server: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/blog/, to: '/blog/index.html' }
      ]
    }
  }
})