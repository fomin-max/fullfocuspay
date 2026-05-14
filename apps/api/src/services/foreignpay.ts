import { config } from '../config.js'

const BASE_URL = config.foreignPay.baseUrl
const TOKEN = config.foreignPay.token

async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ForeignPay error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

// Catalog
export function getProducts(type?: 'TOPUP' | 'VOUCHER', currency?: string) {
  const params: Record<string, string> = {}
  if (type) params.type = type
  if (currency) params.currency = currency
  return request<unknown[]>('GET', '/webhook/v2/merchant/get-products', undefined, params)
}

export function getProduct(type: string, productId: string) {
  return request<unknown>('GET', '/webhook/v2/merchant/get-product', undefined, {
    type,
    product_id: productId,
  })
}

export function getGroups(category?: string) {
  const params: Record<string, string> = {}
  if (category) params.category = category
  return request<unknown[]>('GET', '/webhook/v2/merchant/get-groups', undefined, params)
}

export function getGroupForm(group: string) {
  return request<unknown>('GET', '/webhook/v2/merchant/get-group-form', undefined, { group })
}

// Proxy for purchases
function proxy<T>(path: string, data: Record<string, unknown>) {
  return request<T>('POST', '/webhook/proxy-request-post', { path, request: data })
}

// Steam flow
export function steamCheck(steamUsername: string) {
  return proxy<{ status: string; transactionId?: string; message?: string }>(
    '/steam/check',
    { steamUsername },
  )
}

export function steamGetRate(netAmount: number) {
  return proxy<{ net_amount: number; amount: number }>(
    '/steam/get-rate',
    { net_amount: netAmount },
  )
}

export function steamPay(params: {
  netAmount: number
  transactionId: string
  successUrl: string
}) {
  return proxy<{ sbp_url?: string; qr_url?: string; message?: string }>(
    '/steam/v2/pay',
    {
      net_amount: params.netAmount,
      transactionId: params.transactionId,
      successUrl: params.successUrl,
    },
  )
}

// Voucher flow
export function voucherBuy(params: {
  productId: string
  email: string
  successUrl: string
  retailPrice?: number
  orderId: string
}) {
  return proxy<{ status: boolean; sbp_url?: string; qr_url?: string; sbp_uuid?: string; message?: string }>(
    '/voucher/buy',
    {
      product_id: params.productId,
      email: params.email,
      success_url: params.successUrl,
      order_id: params.orderId,
      ...(params.retailPrice ? { retail_price: params.retailPrice } : {}),
    },
  )
}

// Topup flow
export function topupCheck(params: Record<string, unknown>) {
  return proxy<{ status: boolean; sbp_url?: string; qr_url?: string; sbp_uuid?: string; message?: string }>(
    '/topup/check',
    params,
  )
}

// Status checks
export function checkTransaction(transactionUuid: string) {
  return fetch(`https://acquiring.foreignpay.ru/webhook/check_transaction`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transaction_uuid: transactionUuid }),
  }).then(r => r.json())
}

export function getProductInfo(transactionId: string) {
  return request<unknown>('POST', '/webhook/product/information', { transaction_id: transactionId })
}
