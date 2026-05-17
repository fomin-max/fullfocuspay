import { getTranslations } from 'next-intl/server'
import { NavbarServer as Navbar } from '@/components/layout/NavbarServer'
import { SteamForm } from './SteamForm'

export async function generateMetadata() {
  const t = await getTranslations('topup')
  return { title: `${t('title')} — Full Focus Pay` }
}

export default async function TopUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(50% 40% at 50% -10%, rgba(102,50,250,0.15) 0%, rgba(8,2,35,0) 60%),
        var(--pay-bg-0)
      `,
    }}>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 40px 80px' }}>
        <SteamForm />
      </main>
    </div>
  )
}
