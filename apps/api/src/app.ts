import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import { config } from './config.js'
import { catalogRoutes } from './routes/catalog.js'
import { orderRoutes } from './routes/orders.js'
import { authRoutes } from './routes/auth.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  })

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || origin === config.frontUrl) return cb(null, true)
      cb(new Error('Not allowed by CORS'), false)
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })

  await app.register(cookie)

  await app.register(catalogRoutes, { prefix: '/api' })
  await app.register(orderRoutes, { prefix: '/api' })
  await app.register(authRoutes, { prefix: '/api' })

  app.get('/health', async () => ({ ok: true }))

  return app
}
