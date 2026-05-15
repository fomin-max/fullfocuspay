'use client'
import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import s from './OrderStatus.module.css'

interface Order {
  id: string
  productName: string
  status: string
  payUrl?: string
  userAmount?: number
  resultKey?: string
  resultType?: string
  resultUrl?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const TERMINAL = ['completed', 'failed', 'refunded', 'expired']

export function OrderStatus({ orderId }: { orderId: string }) {
  const t = useTranslations('order')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/check-status`, { method: 'POST' })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()
      setOrder(data.result)
      return data.result
    } catch (e: any) {
      setError(e.message)
      return null
    }
  }, [orderId])

  // Initial load + polling
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    async function tick() {
      const o = await poll()
      if (o && !TERMINAL.includes(o.status)) {
        timer = setTimeout(tick, 3000)
      }
    }

    tick()
    return () => clearTimeout(timer)
  }, [poll])

  function copyKey() {
    if (!order?.resultKey) return
    navigator.clipboard.writeText(order.resultKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (error) {
    return (
      <div className={s.card}>
        <div className={s.iconWrap} style={{ background: 'var(--pay-danger-subtle)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--pay-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 className={s.title}>{t('errorTitle')}</h2>
        <p className={s.sub}>{error}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className={s.card}>
        <div className={`${s.iconWrap} ${s.shimmer}`} />
        <div className={`${s.bone} ${s.boneTitle}`} />
        <div className={`${s.bone} ${s.boneSub}`} />
      </div>
    )
  }

  const { status, productName, payUrl, userAmount, resultKey, resultUrl } = order

  // Waiting for payment
  if (status === 'awaiting_payment' || status === 'pending') {
    return (
      <div className={s.card}>
        <div className={s.iconWrap}>
          <PulseRing />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--pay-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
          </svg>
        </div>
        <h2 className={s.title}>{t('waitingTitle')}</h2>
        <p className={s.sub}>
          {productName && <strong>{productName}</strong>}
          {userAmount ? ` · ${userAmount.toLocaleString('ru-RU')} ₽` : ''}
        </p>
        <p className={s.hint}>{t('waitingHint')}</p>

        {payUrl && (
          <a href={payUrl} className={s.payBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
            {t('openPayment')}
          </a>
        )}
        <div className={s.statusRow}>
          <span className={s.dot} />
          <span className={s.statusText}>{t('waitingStatus')}</span>
        </div>
      </div>
    )
  }

  // Completed
  if (status === 'completed') {
    return (
      <div className={s.card}>
        <div className={s.iconWrap} style={{ background: 'var(--pay-success-subtle)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--pay-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className={s.title}>{t('successTitle')}</h2>
        <p className={s.sub}>{productName}</p>

        {resultKey && (
          <div className={s.keyBox}>
            <div className={s.keyLabel}>{t('yourCode')}</div>
            <div className={s.keyRow}>
              <code className={s.keyCode}>{resultKey}</code>
              <button className={s.copyBtn} onClick={copyKey}>
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pay-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                )}
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        )}

        {resultUrl && (
          <a href={resultUrl} target="_blank" rel="noopener noreferrer" className={s.payBtn}>
            {t('redeemCode')}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        )}
      </div>
    )
  }

  // Expired
  if (status === 'expired') {
    return (
      <div className={s.card}>
        <div className={s.iconWrap} style={{ background: 'var(--pay-warning-subtle)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--pay-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h2 className={s.title}>{t('expiredTitle')}</h2>
        <p className={s.sub}>{t('expiredSub')}</p>
        <a href="/services" className={s.payBtn}>{t('browseServices')}</a>
      </div>
    )
  }

  // Failed
  return (
    <div className={s.card}>
      <div className={s.iconWrap} style={{ background: 'var(--pay-danger-subtle)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--pay-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h2 className={s.title}>{t('failedTitle')}</h2>
      <p className={s.sub}>{t('failedSub')}</p>
      <a href="/services" className={s.payBtn}>{t('tryAgain')}</a>
    </div>
  )
}

function PulseRing() {
  return <span className={s.pulseRing} />
}
