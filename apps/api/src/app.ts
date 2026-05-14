import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './config.js'
import { catalogRoutes } from './routes/catalog.js'
import { orderRoutes } from './routes/orders.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  })

  await app.register(cors, {
    origin: config.frontUrl,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })

  await app.register(catalogRoutes, { prefix: '/api' })
  await app.register(orderRoutes, { prefix: '/api' })

  app.get('/health', async () => ({ ok: true }))

  return app
}
