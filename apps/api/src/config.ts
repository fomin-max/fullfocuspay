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
  },
  payment: {
    ourPercent: Number(process.env.OUR_PERCENT) || 5,
  },
}
