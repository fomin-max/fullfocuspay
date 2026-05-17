import { getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NavbarServer as Navbar } from '@/components/layout/NavbarServer'
import { OrdersList } from './OrdersList'
import { GuestLookup } from './GuestLookup'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function generateMetadata() {
  const t = await getTranslations('orders')
  return { title: `${t('title')} — Full Focus Pay` }
}

export type OrderItem = {
  id: string
  productName: string
  productType: string
  status: string
  amount: number
  userAmount: number
  currency: string
  paymentMethod: string
  createdAt: string
  email: string | null
  steamLogin: string | null
}

export default async function OrdersPage() {
  const user = await getUser()

  let orders: OrderItem[] = []

  if (user) {
    const cookieStore = await cookies()
    const session = cookieStore.get('ffp_session')
    const res = await fetch(`${API}/api/orders/mine`, {
      headers: { Cookie: `ffp_session=${session?.value}` },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      orders = data.result ?? []
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pay-bg-0)' }}>
      <Navbar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '60px 40px 80px' }}>
        {user ? (
          <OrdersList orders={orders} />
        ) : (
          <GuestLookup />
        )}
      </main>
    </div>
  )
}
