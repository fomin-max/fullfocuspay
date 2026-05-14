const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface Product {
  id?: string
  product_id?: string
  name?: string
  product_name?: string
  type?: 'TOPUP' | 'VOUCHER' | 'ESIM' | 'STEAM' | string
  group?: string
  price?: number
  retail_price?: number
  currency?: string
  description?: string
  [key: string]: unknown
}

export interface Group {
  group: string
  icon?: string
  category?: string
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  getGroups: (category?: string) =>
    request<{ result: Group[] }>(`/api/groups${category ? `?category=${category}` : ''}`),

  getProducts: (params?: { type?: string; group?: string; currency?: string }) => {
    const qs = new URLSearchParams()
    if (params?.type) qs.set('type', params.type)
    if (params?.group) qs.set('group', params.group)
    if (params?.currency) qs.set('currency', params.currency)
    const q = qs.toString()
    return request<{ result: Product[] }>(`/api/products${q ? `?${q}` : ''}`)
  },

  getGroupForm: (group: string) =>
    request<{ result: unknown }>(`/api/group-form?group=${group}`),

  steamCheck: (steamLogin: string) =>
    request<{ result: { transactionId: string } }>('/api/orders/steam/check', {
      method: 'POST',
      body: JSON.stringify({ steamLogin }),
    }),

  steamRate: (netAmount: number) =>
    request<{ result: { net_amount: number; amount: number } }>('/api/orders/steam/rate', {
      method: 'POST',
      body: JSON.stringify({ netAmount }),
    }),

  createSteamOrder: (body: { steamLogin: string; netAmount: number; transactionId: string; currency: string }) =>
    request<{ result: { orderId: string; payUrl: string; qrUrl?: string } }>('/api/orders/steam', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  createVoucherOrder: (body: { productId: string; productName: string; email: string; retailPrice?: number }) =>
    request<{ result: { orderId: string; payUrl: string; qrUrl?: string } }>('/api/orders/voucher', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  createTopupOrder: (body: { productId: string; productName: string; formData: Record<string, unknown>; retailPrice?: number }) =>
    request<{ result: { orderId: string; payUrl: string; qrUrl?: string } }>('/api/orders/topup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getOrder: (id: string) =>
    request<{ result: unknown }>(`/api/orders/${id}`),

  checkOrderStatus: (id: string) =>
    request<{ result: unknown }>(`/api/orders/${id}/check-status`, { method: 'POST' }),
}
