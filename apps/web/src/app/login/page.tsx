import { getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export async function generateMetadata() {
  const t = await getTranslations('login')
  return { title: `${t('title')} — Full Focus Pay` }
}

export default async function LoginPage() {
  const user = await getUser()
  if (user) redirect('/')

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(50% 40% at 50% -10%, rgba(102,50,250,0.15) 0%, rgba(8,2,35,0) 60%),
        var(--pay-bg-0)
      `,
      display: 'flex',
      alignItems: 'center',
      paddingBottom: 80,
    }}>
      <main style={{ width: '100%', padding: '60px 20px' }}>
        <LoginForm />
      </main>
    </div>
  )
}
