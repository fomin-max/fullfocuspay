import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { CheckoutForm } from './CheckoutForm'
import Link from 'next/link'
import s from './page.module.css'

const API_URL = process.env.API_URL || 'http://localhost:3001'

async function getProduct(id: string, type: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(id)}?type=${type}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.result ?? null
  } catch {
    return null
  }
}

async function getGroupForm(group: string) {
  try {
    const res = await fetch(`${API_URL}/api/group-form?group=${encodeURIComponent(group)}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.result ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ group: string; productId: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { productId } = await params
  const { type = 'VOUCHER' } = await searchParams
  const product = await getProduct(decodeURIComponent(productId), type)
  return { title: product ? `${product.name} — Full Focus Pay` : 'Product — Full Focus Pay' }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ group: string; productId: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { group, productId } = await params
  const { type = 'VOUCHER' } = await searchParams
  const decodedGroup = decodeURIComponent(group)
  const decodedId = decodeURIComponent(productId)

  const [product, groupForm] = await Promise.all([
    getProduct(decodedId, type),
    getGroupForm(decodedGroup),
  ])

  if (!product) notFound()

  // Build form fields for TOPUP (skip product_id, skip region with 1 option)
  const topupFields: any[] = (groupForm?.forms?.topup_fields ?? []).filter((f: any) => {
    if (f.name === 'product_id') return false
    if (f.type === 'options' && f.options?.length <= 1) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pay-bg-0)' }}>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 40px 80px' }}>

        {/* Breadcrumb */}
        <nav className={s.breadcrumb}>
          <Link href="/services" className={s.breadcrumbLink}>Services</Link>
          <span className={s.sep}>/</span>
          <Link href={`/services/${encodeURIComponent(decodedGroup)}`} className={s.breadcrumbLink}>
            {decodedGroup}
          </Link>
          <span className={s.sep}>/</span>
          <span className={s.breadcrumbCurrent}>{product.name}</span>
        </nav>

        <CheckoutForm
          product={product}
          topupFields={type === 'TOPUP' ? topupFields : []}
          group={decodedGroup}
        />
      </main>
    </div>
  )
}
