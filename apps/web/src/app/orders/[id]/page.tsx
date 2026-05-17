import { NavbarServer as Navbar } from '@/components/layout/NavbarServer'
import { OrderStatus } from './OrderStatus'

export const metadata = { title: 'Order — Full Focus Pay' }

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div style={{ minHeight: '100vh', background: 'var(--pay-bg-0)' }}>
      <Navbar />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '60px 40px 80px' }}>
        <OrderStatus orderId={id} />
      </main>
    </div>
  )
}
