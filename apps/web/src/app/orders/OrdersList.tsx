'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { OrderItem } from './page'

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:          { bg: 'rgba(242,242,247,0.08)', color: 'var(--pay-fg-3)' },
  awaiting_payment: { bg: 'rgba(255,184,0,0.12)',   color: '#f5b800' },
  paid:             { bg: 'rgba(0,200,150,0.12)',    color: '#00c896' },
  processing:       { bg: 'rgba(102,50,250,0.15)',   color: '#a480ff' },
  completed:        { bg: 'rgba(0,255,182,0.1)',     color: 'var(--pay-success)' },
  failed:           { bg: 'rgba(255,80,80,0.1)',     color: '#ff5050' },
  refunded:         { bg: 'rgba(242,242,247,0.08)', color: 'var(--pay-fg-3)' },
  expired:          { bg: 'rgba(255,80,80,0.08)',   color: '#ff7070' },
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('orders')
  const key = `status${status.charAt(0).toUpperCase() + status.slice(1).replace('_payment', '').replace('_', '')}` as any
  const labelMap: Record<string, string> = {
    pending:          t('statusPending'),
    awaiting_payment: t('statusAwaiting'),
    paid:             t('statusPaid'),
    processing:       t('statusProcessing'),
    completed:        t('statusCompleted'),
    failed:           t('statusFailed'),
    refunded:         t('statusRefunded'),
    expired:          t('statusExpired'),
  }
  const { bg, color } = STATUS_COLOR[status] ?? STATUS_COLOR.pending
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: bg, color,
    }}>
      {labelMap[status] ?? status}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmt(n: number) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽'
}

export function OrdersList({ orders }: { orders: OrderItem[] }) {
  const t = useTranslations('orders')

  if (orders.length === 0) {
    return (
      <div>
        <h1 style={{
          fontFamily: 'var(--pay-font-sans)', fontSize: 28, fontWeight: 700,
          letterSpacing: '-0.02em', color: 'var(--pay-fg-1)', margin: '0 0 40px',
        }}>
          {t('title')}
        </h1>
        <div style={{
          background: 'var(--pay-grad-deep)',
          border: '1px solid var(--pay-border-2)',
          borderRadius: 'var(--pay-radius-xl)',
          padding: '64px 32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--pay-fg-1)', marginBottom: 8 }}>
            {t('empty')}
          </div>
          <div style={{ fontSize: 14, color: 'var(--pay-fg-3)' }}>{t('emptyHint')}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--pay-font-sans)', fontSize: 28, fontWeight: 700,
        letterSpacing: '-0.02em', color: 'var(--pay-fg-1)', margin: '0 0 24px',
      }}>
        {t('title')}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orders.map(order => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 16, padding: '16px 20px',
              background: 'var(--pay-grad-deep)',
              border: '1px solid var(--pay-border-2)',
              borderRadius: 'var(--pay-radius-lg)',
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--pay-border-3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--pay-border-2)')}
          >
            {/* Icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: order.productType === 'STEAM'
                ? 'linear-gradient(135deg, #00b4ff22, #1b6b9e22)'
                : 'rgba(102,50,250,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {order.productType === 'STEAM' ? '🎮' : order.productType === 'VOUCHER' ? '🎁' : '⚡'}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--pay-font-sans)', fontSize: 15, fontWeight: 600,
                color: 'var(--pay-fg-1)', marginBottom: 4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {order.productName}
              </div>
              <div style={{ fontSize: 13, color: 'var(--pay-fg-3)' }}>
                {formatDate(order.createdAt)}
              </div>
            </div>

            {/* Status */}
            <StatusBadge status={order.status} />

            {/* Amount */}
            <div style={{
              fontFamily: 'var(--pay-font-sans)', fontSize: 15, fontWeight: 700,
              color: 'var(--pay-fg-1)', flexShrink: 0, textAlign: 'right',
            }}>
              {fmt(order.amount)}
            </div>

            {/* Arrow */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pay-fg-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
