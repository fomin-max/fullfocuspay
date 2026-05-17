import { config as dotenvConfig } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenvConfig({ path: resolve(__dirname, '../.env') })

export const config = {
  port: Number(process.env.PORT) || 3001,
  frontUrl: process.env.FRONT_URL || 'http://localhost:3000',
  foreignPay: {
    baseUrl: process.env.FOREIGNPAY_URL || 'https://keys.foreignpay.ru',
    token: process.env.FOREIGNPAY_TOKEN || '',
    steamUrl: process.env.FOREIGNPAY_STEAM_URL || 'https://foreign.foreignpay.ru',
    steamSbpToken: process.env.FOREIGNPAY_STEAM_SBP_TOKEN || '',
    steamCardToken: process.env.FOREIGNPAY_STEAM_CARD_TOKEN || '',
    foreignPercentSbp: Number(process.env.FOREIGN_PERCENT_SBP) || 5.5,
    foreignPercentCard: Number(process.env.FOREIGN_PERCENT_CARD) || 7,
  },
  payment: {
    ourPercent: Number(process.env.OUR_PERCENT) || 5,
  },
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFrom: process.env.RESEND_FROM || 'Full Focus Pay <noreply@fullfocuspay.ru>',
}
