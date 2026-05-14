'use client'
import { useState } from 'react'
import Link from 'next/link'
import s from './ProductList.module.css'

interface Product {
  id?: string
  product_id?: string
  name?: string
  product_name?: string
  type?: string
  group?: string
  price?: number
  retail_price?: number
  currency?: string
  description?: string
  [key: string]: unknown
}

function productId(p: Product): string {
  return String(p.id ?? p.product_id ?? '')
}

function productName(p: Product): string {
  return String(p.name ?? p.product_name ?? 'Unknown product')
}

function productPrice(p: Product): number | null {
  const v = p.price ?? p.retail_price
  return typeof v === 'number' ? v : null
}

function formatPrice(price: number, currency = 'RUB'): string {
  if (currency === 'RUB') return `${price.toLocaleString('ru-RU')} ₽`
  if (currency === 'USD') return `$${price.toFixed(2)}`
  return `${price} ${currency}`
}

const TYPE_LABELS: Record<string, string> = {
  VOUCHER: 'Gift card / Key',
  TOPUP: 'Top-up',
  ESIM: 'eSIM',
  STEAM: 'Steam',
}

export function ProductList({ products, group }: { products: Product[]; group: string }) {
  const types = [...new Set(products.map((p) => p.type).filter(Boolean))] as string[]
  const [activeType, setActiveType] = useState(types[0] ?? 'ALL')

  const filtered = activeType === 'ALL' || types.length <= 1
    ? products
    : products.filter((p) => p.type === activeType)

  if (products.length === 0) {
    return (
      <div className={s.empty}>
        <p>No products available for this service.</p>
      </div>
    )
  }

  return (
    <>
      {types.length > 1 && (
        <div className={s.tabs}>
          {types.map((t) => (
            <button
              key={t}
              className={`${s.tab} ${activeType === t ? s.tabActive : ''}`}
              onClick={() => setActiveType(t)}
            >
              {TYPE_LABELS[t] ?? t}
              <span className={s.tabCount}>
                {products.filter((p) => p.type === t).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className={s.grid}>
        {filtered.map((product) => {
          const id = productId(product)
          const name = productName(product)
          const price = productPrice(product)
          const currency = String(product.currency ?? 'RUB')
          const type = String(product.type ?? '')
          const href = id
            ? `/services/${encodeURIComponent(group)}/${encodeURIComponent(id)}?type=${type}`
            : '#'

          return (
            <Link key={id || name} href={href} className={s.card}>
              <div className={s.cardGlow} />
              <div className={s.cardTop}>
                <span className={s.typeBadge}>{TYPE_LABELS[type] ?? type}</span>
              </div>
              <div className={s.cardName}>{name}</div>
              {price !== null && (
                <div className={s.cardPrice}>{formatPrice(price, currency)}</div>
              )}
              <div className={s.cardBuy}>
                Buy
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
