import { redirect } from 'next/navigation'

export default async function SuccessRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const apiUrl = process.env.API_URL || 'http://localhost:3001'

  // Mark Steam orders as completed — ForeignPay only redirects here on successful payment
  await fetch(`${apiUrl}/api/orders/${id}/complete`, { method: 'POST' }).catch(() => {})

  redirect(`/orders/${id}`)
}
