import { config } from '../config.js'

const BASE_URL = config.foreignPay.baseUrl
const TOKEN = config.foreignPay.token
const STEAM_URL = config.foreignPay.steamUrl
const STEAM_SBP_TOKEN = config.foreignPay.steamSbpToken
const STEAM_CARD_TOKEN = config.foreignPay.steamCardToken

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

async function steamRequest<T>(path: string, body: Record<string, unknown>, payType: 'sbp' | 'card' = 'sbp'): Promise<T> {
  const token = payType === 'card' ? STEAM_CARD_TOKEN : STEAM_SBP_TOKEN
  const res = await fetch(`${STEAM_URL}/${path}`, {
    method: 'POST',
    headers: {
      'X-Partner-ID': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ForeignPay Steam error ${res.status}: ${text}`)
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

// Proxy for purchases (topup/voucher token)
function proxy<T>(path: string, data: Record<string, unknown>) {
  return request<T>('POST', '/webhook/proxy-request-post', { path, request: data })
}

// Steam flow (foreign.foreignpay.ru, X-Partner-ID auth)
export function steamCheck(steamUsername: string) {
  return steamRequest<{ status: string; transactionId?: string; message?: string }>(
    'steam/check',
    { steamUsername },
  )
}

export function steamPay(params: {
  steamUsername: string
  netAmount: number
  amount: number
  currency: string
  transactionId: string
  successUrl: string
  orderId: string
  payType: 'sbp' | 'card'
}) {
  return steamRequest<{ payUrl?: string; sbpTransactionUuid?: string; message?: string }>(
    'steam/pay',
    {
      steamUsername: params.steamUsername,
      netAmount: params.netAmount,
      amount: params.amount,
      currency: params.currency,
      transactionId: params.transactionId,
      successUrl: params.successUrl,
      orderId: params.orderId,
      directSuccess: false,
    },
    params.payType,
  )
}

export function calculateSteamAmount(netAmount: number, payType: 'sbp' | 'card'): number {
  const foreignPercent = payType === 'card'
    ? config.foreignPay.foreignPercentCard
    : config.foreignPay.foreignPercentSbp
  const ourPercent = config.payment.ourPercent
  const markup = Math.round(netAmount * (foreignPercent + ourPercent) / 100)
  return netAmount + markup
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
  }).then(r => r.json()) as Promise<{ status?: string; sbp_uuid?: string }>
}

export function getProductInfo(transactionId: string) {
  return request<unknown>('POST', '/webhook/product/information', { transaction_id: transactionId })
}
