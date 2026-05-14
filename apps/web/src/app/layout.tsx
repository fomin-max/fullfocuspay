import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Full Focus Pay — пополнение зарубежных сервисов',
  description: 'Быстрое пополнение Steam, Discord, ChatGPT и других сервисов через СБП. Доставка за 60 секунд.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
