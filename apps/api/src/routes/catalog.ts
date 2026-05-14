import type { FastifyInstance } from 'fastify'
import * as fp from '../services/foreignpay.js'

export async function catalogRoutes(app: FastifyInstance) {
  app.get('/groups', async (req: any, reply: any) => {
    try {
      const { category } = req.query as { category?: string }
      const groups = await fp.getGroups(category)
      return { result: groups }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  app.get('/products', async (req: any, reply: any) => {
    try {
      const { type, currency, group } = req.query as {
        type?: 'TOPUP' | 'VOUCHER'
        currency?: string
        group?: string
      }
      const products = await fp.getProducts(type, currency) as any[]
      const filtered = group
        ? products.filter((p) => p.group === group)
        : products
      return { result: filtered }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  app.get('/products/:id', async (req: any, reply: any) => {
    try {
      const { id } = req.params as { id: string }
      const { type } = req.query as { type: string }
      const product = await fp.getProduct(type, id)
      return { result: product }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  app.get('/group-form', async (req: any, reply: any) => {
    try {
      const { group } = req.query as { group: string }
      if (!group) return reply.code(400).send({ error: { message: 'group is required', code: 400 } })
      const form = await fp.getGroupForm(group)
      return { result: form }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })
}
