'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { OrdersList } from './OrdersList'
import type { OrderItem } from './page'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function GuestLookup() {
  const t = useTranslations('orders')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<OrderItem[] | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/orders/by-email?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      setOrders(data.result ?? [])
    } catch {
      setOrders([])
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--pay-font-sans)', fontSize: 28, fontWeight: 700,
        letterSpacing: '-0.02em', color: 'var(--pay-fg-1)', margin: '0 0 8px',
      }}>
        {t('titleGuest')}
      </h1>
      <p style={{ margin: '0 0 32px', fontSize: 15, color: 'var(--pay-fg-3)' }}>
        {t('loginPrompt')}{' '}
        <Link href="/login" style={{ color: 'var(--pay-brand-light)', textDecoration: 'none', fontWeight: 600 }}>
          {t('signIn')}
        </Link>
      </p>

      <div style={{
        background: 'var(--pay-grad-deep)',
        border: '1px solid var(--pay-border-2)',
        borderRadius: 'var(--pay-radius-xl)',
        padding: 28,
        marginBottom: 32,
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: 'var(--pay-fg-3)', letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: 10,
            }}>
              {t('lookupLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('lookupPlaceholder')}
              required
              style={{
                width: '100%',
                height: 48,
                background: 'rgba(242,242,247,0.04)',
                border: '1px solid var(--pay-border-2)',
                borderRadius: 'var(--pay-radius-sm)',
                padding: '0 16px',
                color: 'var(--pay-fg-1)',
                fontSize: 15,
                fontFamily: 'var(--pay-font-sans)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!email || loading}
            style={{
              alignSelf: 'flex-end',
              height: 48, padding: '0 24px',
              borderRadius: 'var(--pay-radius-sm)',
              background: email && !loading ? 'var(--pay-brand)' : 'rgba(242,242,247,0.06)',
              border: email && !loading ? '1px solid var(--pay-brand-press)' : '1px solid var(--pay-border-1)',
              color: email && !loading ? 'var(--pay-fg-1)' : 'var(--pay-fg-3)',
              fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--pay-font-sans)',
              cursor: email && !loading ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
              boxShadow: email && !loading ? '0 4px 14px rgba(102,50,250,0.3)' : 'none',
            }}
          >
            {loading ? t('lookupLoading') : t('lookupBtn')}
          </button>
        </form>
      </div>

      {orders !== null && (
        orders.length === 0 ? (
          <div style={{
            background: 'var(--pay-grad-deep)',
            border: '1px solid var(--pay-border-2)',
            borderRadius: 'var(--pay-radius-xl)',
            padding: '48px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--pay-fg-1)', marginBottom: 8 }}>
              {t('emptyGuest')}
            </div>
            <div style={{ fontSize: 14, color: 'var(--pay-fg-3)' }}>{t('emptyGuestHint')}</div>
          </div>
        ) : (
          <OrdersList orders={orders} />
        )
      )}
    </div>
  )
}
