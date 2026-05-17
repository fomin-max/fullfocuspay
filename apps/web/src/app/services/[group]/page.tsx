import { notFound } from 'next/navigation'
import { NavbarServer as Navbar } from '@/components/layout/NavbarServer'
import { ProductList } from './ProductList'
import { ScrollToTop } from '@/components/ScrollToTop'
import Link from 'next/link'
import s from './page.module.css'

const API_URL = process.env.API_URL || 'http://localhost:3001'

async function getProducts(group: string) {
  try {
    const res = await fetch(
      `${API_URL}/api/products?group=${encodeURIComponent(group)}`,
      { next: { revalidate: 300 } },
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.result ?? []
  } catch {
    return []
  }
}

async function getGroupMeta(group: string) {
  try {
    const res = await fetch(`${API_URL}/api/groups`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const data = await res.json()
    const groups: any[] = data.result ?? []
    return groups.find((g) => g.group === group) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params
  return { title: `${decodeURIComponent(group)} — Full Focus Pay` }
}

export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params
  const decoded = decodeURIComponent(group)

  const [products, groupMeta] = await Promise.all([
    getProducts(decoded),
    getGroupMeta(decoded),
  ])

  if (products.length === 0 && !groupMeta) notFound()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pay-bg-0)' }}>
      <ScrollToTop />
      <Navbar />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 40px 80px' }}>

        {/* Breadcrumb */}
        <nav className={s.breadcrumb}>
          <Link href="/services" className={s.breadcrumbLink}>Services</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--pay-fg-4)', flexShrink: 0 }}>
            <path d="m9 18 6-6-6-6"/>
          </svg>
          <span className={s.breadcrumbCurrent}>{decoded}</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: 'var(--pay-fg-1)', letterSpacing: '-0.02em' }}>
            {decoded}
          </h1>
          {groupMeta?.category && (
            <span className={s.categoryBadge}>{groupMeta.category}</span>
          )}
        </div>

        <ProductList products={products} group={decoded} />
      </main>
    </div>
  )
}
