import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import './globals.css'

const grandisExtended = localFont({
  src: [
    { path: '../../public/fonts/GrandisExtended-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/GrandisExtended-Medium.woff2',  weight: '500', style: 'normal' },
    { path: '../../public/fonts/GrandisExtended-Bold.woff2',    weight: '700', style: 'normal' },
  ],
  variable: '--font-grandis',
  display: 'swap',
})

const magistral = localFont({
  src: [
    { path: '../../public/fonts/Magistral-Book.woff2',      weight: '400', style: 'normal' },
    { path: '../../public/fonts/Magistral-Medium.woff2',    weight: '500', style: 'normal' },
    { path: '../../public/fonts/Magistral-Bold.woff2',      weight: '700', style: 'normal' },
    { path: '../../public/fonts/Magistral-ExtraBold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-magistral',
  display: 'swap',
})

const audiowide = localFont({
  src: [
    { path: '../../public/fonts/Audiowide-Regular.ttf', weight: '400', style: 'normal' },
  ],
  variable: '--font-audiowide',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Full Focus Pay — пополнение зарубежных сервисов',
  description: 'Быстрое пополнение Steam, Discord, ChatGPT и других сервисов через СБП. Доставка за 60 секунд.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${grandisExtended.variable} ${magistral.variable} ${audiowide.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
