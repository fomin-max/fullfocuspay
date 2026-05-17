import type { FastifyInstance } from 'fastify'
import * as auth from '../services/auth.js'

const COOKIE_NAME = 'ffp_session'
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60,
  secure: process.env.NODE_ENV === 'production',
}

function getToken(req: any): string | undefined {
  return req.cookies?.[COOKIE_NAME]
}

export async function authRoutes(app: FastifyInstance) {

  // Send OTP
  app.post('/auth/send-otp', async (req: any, reply: any) => {
    const { email } = req.body as { email?: string }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.code(400).send({ error: { message: 'Valid email required', code: 400 } })
    }
    const code = auth.generateOtp()
    await auth.saveOtp(email.toLowerCase(), code)
    await auth.sendOtp(email.toLowerCase(), code)
    return { result: { sent: true } }
  })

  // Verify OTP → create session
  app.post('/auth/verify-otp', async (req: any, reply: any) => {
    const { email, code } = req.body as { email?: string; code?: string }
    if (!email || !code) {
      return reply.code(400).send({ error: { message: 'email and code required', code: 400 } })
    }
    const valid = await auth.verifyOtp(email.toLowerCase(), code.trim())
    if (!valid) {
      return reply.code(400).send({ error: { message: 'Invalid or expired code', code: 400 } })
    }
    const user = await auth.upsertUser(email.toLowerCase())
    await auth.linkGuestOrders(email.toLowerCase(), user.id)
    const token = await auth.createSession(user.id)
    reply.setCookie(COOKIE_NAME, token, COOKIE_OPTS)
    return { result: { user: { id: user.id, email: user.email, name: user.name } } }
  })

  // Get current user
  app.get('/auth/me', async (req: any, reply: any) => {
    const token = getToken(req)
    if (!token) return reply.code(401).send({ error: { message: 'Not authenticated', code: 401 } })
    const user = await auth.getSessionUser(token)
    if (!user) return reply.code(401).send({ error: { message: 'Session expired', code: 401 } })
    return { result: { user: { id: user.id, email: user.email, name: user.name } } }
  })

  // Logout
  app.post('/auth/logout', async (req: any, reply: any) => {
    const token = getToken(req)
    if (token) await auth.deleteSession(token)
    reply.clearCookie(COOKIE_NAME, { path: '/' })
    return { result: { ok: true } }
  })
}
