import type { NextConfig } from 'next'

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

export default nextConfig
