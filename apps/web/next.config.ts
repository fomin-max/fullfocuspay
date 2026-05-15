import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  transpilePackages: ['@ffp/ui', '@ffp/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'keys.foreignpay.ru' },
      { protocol: 'https', hostname: '**.foreignpay.ru' },
      { protocol: 'https', hostname: '**.cdn.foreignpay.ru' },
    ],
  },
}

export default withNextIntl(nextConfig)
