import { redirect } from 'next/navigation'

// ForeignPay redirects to /orders/[id]/success — forward to the order page
export default async function SuccessRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/orders/${id}`)
}
