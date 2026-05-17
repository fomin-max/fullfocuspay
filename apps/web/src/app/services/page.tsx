import { getTranslations } from 'next-intl/server'
import { NavbarServer as Navbar } from '@/components/layout/NavbarServer'
import { GroupsGrid } from '@/components/home/GroupsGrid'

async function getGroups() {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:3001'}/api/groups`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.result ?? []
  } catch {
    return []
  }
}

export const metadata = { title: 'Services — Full Focus Pay' }

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const groups = await getGroups()
  const t = await getTranslations('services')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pay-bg-0)' }}>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 40px 80px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: 'var(--pay-fg-1)' }}>
          {t('title')}
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 15, color: 'var(--pay-fg-3)' }}>
          {t('subtitle', { count: groups.length })}
        </p>
        <GroupsGrid groups={groups} initialQuery={q ?? ''} />
      </main>
    </div>
  )
}
