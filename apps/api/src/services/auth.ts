import { randomBytes } from 'crypto'
import { prisma } from '../lib/prisma.js'
import { config } from '../config.js'

const SESSION_TTL_DAYS = 30
const OTP_TTL_MINUTES = 10

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOtp(email: string, code: string): Promise<void> {
  if (!config.resendApiKey) {
    console.log(`[DEV] OTP for ${email}: ${code}`)
    return
  }
  const { Resend } = await import('resend')
  const resend = new Resend(config.resendApiKey)
  await resend.emails.send({
    from: config.resendFrom,
    to: email,
    subject: `Ваш код входа: ${code}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:400px;margin:0 auto;padding:32px">
        <h2 style="margin:0 0 8px">Full Focus Pay</h2>
        <p style="color:#666;margin:0 0 24px">Код для входа</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:0.15em;padding:24px;background:#f5f5f5;border-radius:8px;text-align:center">${code}</div>
        <p style="color:#999;font-size:13px;margin:16px 0 0">Код действует ${OTP_TTL_MINUTES} минут. Не передавайте его никому.</p>
      </div>
    `,
  })
}

export async function saveOtp(email: string, code: string): Promise<void> {
  // Invalidate previous unused codes for this email
  await prisma.otpCode.updateMany({
    where: { email, used: false },
    data: { used: true },
  })
  await prisma.otpCode.create({
    data: {
      email,
      code,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  })
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: { email, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })
  if (!otp) return false
  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })
  return true
}

export async function upsertUser(email: string): Promise<{ id: string; email: string; name: string | null }> {
  return prisma.user.upsert({
    where: { email },
    create: { email },
    update: {},
  })
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  })
  return token
}

export async function getSessionUser(token: string): Promise<{ id: string; email: string; name: string | null } | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session || session.expiresAt < new Date()) return null
  return session.user
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } })
}

// Link guest orders (by email) to a newly logged-in user
export async function linkGuestOrders(email: string, userId: string): Promise<void> {
  await prisma.order.updateMany({
    where: { email, userId: null },
    data: { userId },
  })
}
