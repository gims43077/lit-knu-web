import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'azure-api-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/')) return next()

          const targetUrl = 'https://yellow-plant-0de446a00.2.azurestaticapps.net' + req.url
          try {
            const headers = { ...req.headers, host: 'yellow-plant-0de446a00.2.azurestaticapps.net' }
            delete headers['content-length']
            const fetchOpts = {
              method: req.method,
              headers,
            }
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
              const chunks = []
              for await (const chunk of req) chunks.push(chunk)
              if (chunks.length > 0) {
                fetchOpts.body = Buffer.concat(chunks)
              }
            }
            const proxyRes = await fetch(targetUrl, fetchOpts)
            if (req.url.startsWith('/api/milestones') && proxyRes.status === 404) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  success: true,
                  count: 6,
                  data: [
                    { count: 30, title: '30 달성', icon: '🌱', badge: '30 달성', reward: '커피 기프티콘', color: 'mint' },
                    { count: 50, title: '50 달성', icon: '🌿', badge: '50 달성', reward: '편의점 기프티콘', color: 'amber' },
                    { count: 100, title: '100 달성', icon: '🪴', badge: '100 달성', reward: '케익 기프티콘', color: 'pink' },
                    { count: 150, title: '150 달성', icon: '🌳', badge: '150 달성', reward: '치킨 기프티콘', color: 'orange' },
                    { count: 200, title: '200 달성', icon: '🍎', badge: '200 달성', reward: '자격증 응시비 지원', color: 'violet' },
                    { count: 250, title: '250 달성', icon: '👑', badge: '250 달성', reward: 'MSA 달성', color: 'gold' },
                  ],
                  source: 'dev-fallback',
                })
              )
              return
            }
            res.statusCode = proxyRes.status
            proxyRes.headers.forEach((val, key) => {
              if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
                res.setHeader(key, val)
              }
            })
            const buf = await proxyRes.arrayBuffer()
            res.end(Buffer.from(buf))
          } catch (err) {
            console.error('[Vite Azure Proxy Error]:', err.message)
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
      },
    },
  ],
})
