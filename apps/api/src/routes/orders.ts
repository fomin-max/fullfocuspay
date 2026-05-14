import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'
import * as fp from '../services/foreignpay.js'
import { config } from '../config.js'

const SUCCESS_URL = (orderId: string) =>
  `${config.frontUrl}/orders/${orderId}/success`

export async function orderRoutes(app: FastifyInstance) {

  // Steam: check account (old direct top-up flow)
  app.post('/orders/steam/check', async (req: any, reply: any) => {
    try {
      const { steamLogin } = req.body as { steamLogin: string }
      if (!steamLogin) return reply.code(400).send({ error: { message: 'steamLogin required', code: 400 } })
      const check = await fp.steamCheck(steamLogin)
      if (check.status !== 'success' || !check.transactionId) {
        return reply.code(400).send({ error: { message: check.message || 'Steam account not found', code: 400 } })
      }
      return { result: { transactionId: check.transactionId } }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  // Steam: get rate
  app.post('/orders/steam/rate', async (req: any, reply: any) => {
    try {
      const { netAmount } = req.body as { netAmount: number }
      const rate = await fp.steamGetRate(netAmount)
      return { result: rate }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  // Steam direct top-up: create order & pay
  app.post('/orders/steam', async (req: any, reply: any) => {
    try {
      const { steamLogin, netAmount, transactionId, currency } = req.body as {
        steamLogin: string
        netAmount: number
        transactionId: string
        currency: string
      }

      const order = await prisma.order.create({
        data: {
          productId: 'steam-topup',
          productName: 'Steam Wallet',
          productType: 'STEAM',
          userAmount: netAmount,
          amount: netAmount,
          currency: currency || 'RUB',
          paymentMethod: 'sbp',
          status: 'pending',
          steamLogin,
        },
      })

      const pay = await fp.steamPay({
        netAmount,
        transactionId,
        successUrl: SUCCESS_URL(order.id),
      })

      if (!pay.sbp_url) {
        await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } })
        return reply.code(500).send({ error: { message: pay.message || 'Payment init failed', code: 500 } })
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { payUrl: pay.sbp_url, status: 'awaiting_payment' },
      })

      return { result: { orderId: order.id, payUrl: pay.sbp_url, qrUrl: pay.qr_url } }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  // Voucher: create order & pay
  app.post('/orders/voucher', async (req: any, reply: any) => {
    try {
      const { productId, productName, email, retailPrice, currency } = req.body as {
        productId: string
        productName: string
        email: string
        retailPrice?: number
        currency?: string
      }

      if (!productId || !productName || !email) {
        return reply.code(400).send({ error: { message: 'productId, productName, email required', code: 400 } })
      }

      const order = await prisma.order.create({
        data: {
          productId: String(productId),
          productName,
          productType: 'VOUCHER',
          userAmount: retailPrice || 0,
          amount: retailPrice || 0,
          currency: currency || 'RUB',
          paymentMethod: 'sbp',
          status: 'pending',
          email,
        },
      })

      const buy = await fp.voucherBuy({
        productId: String(productId),
        email,
        successUrl: SUCCESS_URL(order.id),
        retailPrice,
        orderId: order.id,
      })

      if (!buy.status || !buy.sbp_url) {
        await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } })
        return reply.code(500).send({ error: { message: buy.message || 'Payment init failed', code: 500 } })
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          payUrl: buy.sbp_url,
          transactionUuid: buy.sbp_uuid,
          status: 'awaiting_payment',
        },
      })

      return { result: { orderId: order.id, payUrl: buy.sbp_url, qrUrl: buy.qr_url } }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  // Topup: create order & pay
  app.post('/orders/topup', async (req: any, reply: any) => {
    try {
      const { productId, productName, formData, retailPrice, currency } = req.body as {
        productId: string
        productName: string
        formData: Record<string, unknown>
        retailPrice?: number
        currency?: string
      }

      if (!productId || !productName || !formData) {
        return reply.code(400).send({ error: { message: 'productId, productName, formData required', code: 400 } })
      }

      const order = await prisma.order.create({
        data: {
          productId: String(productId),
          productName,
          productType: 'TOPUP',
          userAmount: retailPrice || 0,
          amount: retailPrice || 0,
          currency: currency || 'RUB',
          paymentMethod: 'sbp',
          status: 'pending',
        },
      })

      const pay = await fp.topupCheck({
        ...formData,
        product_id: productId,
        order_id: order.id,
        success_url: SUCCESS_URL(order.id),
        ...(retailPrice ? { retail_price: retailPrice } : {}),
      })

      if (!pay.status || !pay.sbp_url) {
        await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } })
        return reply.code(500).send({ error: { message: pay.message || 'Payment init failed', code: 500 } })
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          payUrl: pay.sbp_url,
          transactionUuid: pay.sbp_uuid,
          status: 'awaiting_payment',
        },
      })

      return { result: { orderId: order.id, payUrl: pay.sbp_url, qrUrl: pay.qr_url } }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  // Get order
  app.get('/orders/:id', async (req: any, reply: any) => {
    try {
      const { id } = req.params as { id: string }
      const order = await prisma.order.findUnique({ where: { id } })
      if (!order) return reply.code(404).send({ error: { message: 'Order not found', code: 404 } })
      return { result: order }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  // Poll payment status + fetch result when paid
  app.post('/orders/:id/check-status', async (req: any, reply: any) => {
    try {
      const { id } = req.params as { id: string }
      const order = await prisma.order.findUnique({ where: { id } })
      if (!order) return reply.code(404).send({ error: { message: 'Order not found', code: 404 } })

      // Already in terminal state — no need to poll
      if (['completed', 'failed', 'refunded', 'expired'].includes(order.status)) {
        return { result: order }
      }

      if (order.transactionUuid) {
        const txStatus = await fp.checkTransaction(order.transactionUuid)

        if (txStatus?.status === 'Paid' && order.status !== 'completed') {
          // Fetch the actual product (key/code/instructions)
          let resultData: { resultKey?: string; resultType?: string; resultUrl?: string } = {}
          try {
            const info: any = await fp.getProductInfo(order.transactionUuid)
            resultData = {
              resultType: info?.type || 'voucher',
              resultKey: info?.key || info?.code,
              resultUrl: info?.redeem_url || info?.url,
            }
          } catch {
            // product info not critical — order still marked completed
          }

          await prisma.order.update({
            where: { id },
            data: { status: 'completed', ...resultData },
          })
        } else if (txStatus?.status === 'Expired') {
          await prisma.order.update({ where: { id }, data: { status: 'expired' } })
        }
      }

      const updated = await prisma.order.findUnique({ where: { id } })
      return { result: updated }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })

  // Get order result (called from success page)
  app.get('/orders/:id/result', async (req: any, reply: any) => {
    try {
      const { id } = req.params as { id: string }
      const order = await prisma.order.findUnique({ where: { id } })
      if (!order) return reply.code(404).send({ error: { message: 'Order not found', code: 404 } })

      // If completed and we have the key — return it
      if (order.status === 'completed' && order.resultKey) {
        return {
          result: {
            status: order.status,
            productName: order.productName,
            resultKey: order.resultKey,
            resultType: order.resultType,
            resultUrl: order.resultUrl,
          },
        }
      }

      // If paid but no key yet — try fetching product info
      if ((order.status === 'paid' || order.status === 'completed') && order.transactionUuid) {
        try {
          const info: any = await fp.getProductInfo(order.transactionUuid)
          const resultKey = info?.key || info?.code
          const resultType = info?.type || 'voucher'
          const resultUrl = info?.redeem_url || info?.url

          await prisma.order.update({
            where: { id },
            data: { status: 'completed', resultKey, resultType, resultUrl },
          })

          return {
            result: {
              status: 'completed',
              productName: order.productName,
              resultKey,
              resultType,
              resultUrl,
            },
          }
        } catch {
          // key not ready yet
        }
      }

      return { result: { status: order.status, productName: order.productName } }
    } catch (e: any) {
      return reply.code(500).send({ error: { message: e.message, code: 500 } })
    }
  })
}
