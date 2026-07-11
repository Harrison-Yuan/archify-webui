import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          // 设置代理超时 120s，适配 LLM 请求
          ;(proxy as any).proxyTimeout = 120_000
          ;(proxy as any).timeout = 120_000
          proxy.on('error', (err, req, res) => {
            console.error('[proxy error]', err.message)
            if (!res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(504, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Gateway timeout' }))
            }
          })
        }
      }
    }
  }
})
