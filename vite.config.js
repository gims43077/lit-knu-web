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
