import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { healthRouter } from './routes/v1/health.js'
import { walletRouter } from './routes/v1/wallet.js'
import { paymentsRouter } from './routes/v1/payments.js'

// Environment interface for Cloudflare Workers bindings
export interface Env {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
  ENVIRONMENT?: string
}

// Create Hono app with typing for Cloudflare Workers bindings
const app = new Hono<{ Bindings: Env }>()

// Security headers (equivalent to Helmet)
app.use('*', async (c, next) => {
  // Add security headers
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  await next()
})

// CORS middleware
const allowedOrigins =
  ENVIRONMENT === 'production'
    ? ['https://tap2wallet.com', 'https://app.tap2wallet.com']
    : ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:8081']

app.use(
  '*',
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)

// Request logging
app.use('*', logger())

// Health check (no auth required)
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'tap2-wallet-api',
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API v1 routes
app.route('/api/v1', healthRouter)
app.route('/api/v1/wallet', walletRouter)
app.route('/api/v1/payments', paymentsRouter)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', status: 404 }, 404)
})

// Global error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json(
    {
      error: ENVIRONMENT === 'production' ? 'Internal Server Error' : err.message,
      status: 500,
    },
    500
  )
})

// Export for Cloudflare Workers
export default app

// Export for Cloudflare Pages Functions (if needed)
export const fetch = app.fetch
