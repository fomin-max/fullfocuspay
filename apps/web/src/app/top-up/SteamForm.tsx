'use client'
import { useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const CHIPS = [500, 1000, 2000, 3000, 5000]

type CheckState = 'idle' | 'checking' | 'found' | 'error'

function SteamIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1b2838"/>
      <path
        d="M20 8C13.373 8 8 13.373 8 20c0 5.49 3.504 10.19 8.435 11.93l3.215-7.7a4.5 4.5 0 1 1 5.96-5.96l7.7-3.214C31.19 11.504 26.49 8 20 8Z"
        fill="url(#steam-grad)"
      />
      <path
        d="M16.65 21.97a3 3 0 1 0 1.23 5.87l-2.89-1.2a2.2 2.2 0 1 1 2.9-2.9l1.2 2.89a3 3 0 0 0-2.44-4.66Z"
        fill="white"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="steam-grad" x1="8" y1="8" x2="33" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00b4ff"/>
          <stop offset="1" stopColor="#1b6b9e"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}

export function SteamForm() {
  const t = useTranslations('topup')

  const [login, setLogin] = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [checkError, setCheckError] = useState('')
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const [selectedChip, setSelectedChip] = useState<number | null>(null)
  const [customAmt, setCustomAmt] = useState('')
  const [amount, setAmount] = useState<number | null>(null)
  const [rate, setRate] = useState<{ net_amount: number; amount: number } | null>(null)
  const [rateLoading, setRateLoading] = useState(false)

  const [payType, setPayType] = useState<'sbp' | 'card'>('sbp')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const checkingRef = useRef(false)

  const fetchRate = useCallback(async (netAmount: number, pt: 'sbp' | 'card') => {
    setRateLoading(true)
    setRate(null)
    try {
      const res = await fetch(`${API}/api/orders/steam/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ netAmount, payType: pt }),
      })
      const data = await res.json()
      if (res.ok && data.result) setRate(data.result)
    } catch { /* non-critical */ }
    setRateLoading(false)
  }, [])

  const checkAccount = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || checkingRef.current) return
    checkingRef.current = true
    setCheckState('checking')
    setCheckError('')
    setTransactionId(null)
    try {
      const res = await fetch(`${API}/api/orders/steam/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamLogin: trimmed }),
      })
      const data = await res.json()
      if (res.ok && data.result?.transactionId) {
        setCheckState('found')
        setTransactionId(data.result.transactionId)
      } else {
        setCheckState('error')
        setCheckError(t('loginNotFound'))
      }
    } catch {
      setCheckState('error')
      setCheckError(t('errorNetwork'))
    } finally {
      checkingRef.current = false
    }
  }, [t])

  const selectChip = (rub: number) => {
    setSelectedChip(rub)
    setCustomAmt('')
    setAmount(rub)
    fetchRate(rub, payType)
  }

  const handleCustomAmt = (v: string) => {
    setCustomAmt(v)
    setSelectedChip(null)
    const n = Number(v)
    if (n >= 100 && n <= 50000) {
      setAmount(n)
      fetchRate(n, payType)
    } else {
      setAmount(null)
      setRate(null)
    }
  }

  const handlePayTypeChange = (pt: 'sbp' | 'card') => {
    setPayType(pt)
    if (amount) fetchRate(amount, pt)
  }

  const handlePay = async () => {
    if (!transactionId || !amount || !rate || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch(`${API}/api/orders/steam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          steamLogin: login.trim(),
          netAmount: amount,
          transactionId,
          currency: 'RUB',
          payType,
        }),
      })
      const data = await res.json()
      if (res.ok && data.result?.payUrl) {
        window.location.href = data.result.payUrl
        return
      }
      setSubmitError(t('errorGeneric'))
    } catch {
      setSubmitError(t('errorNetwork'))
    }
    setSubmitting(false)
  }

  const canPay = checkState === 'found' && amount !== null && rate !== null && !submitting
  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽'
  const rubAmount = rate ? fmt(rate.amount) : null

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <SteamIcon />
        <div>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--pay-font-sans)',
            fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em',
            color: 'var(--pay-fg-1)',
          }}>
            {t('title')}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--pay-fg-3)', marginTop: 2 }}>
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--pay-grad-deep)',
        border: '1px solid var(--pay-border-2)',
        borderRadius: 'var(--pay-radius-xl)',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}>

        {/* Step 1: Login */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 12, fontWeight: 600,
            color: 'var(--pay-fg-3)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            {t('loginLabel')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              value={login}
              onChange={e => {
                setLogin(e.target.value)
                if (checkState !== 'idle') {
                  setCheckState('idle')
                  setTransactionId(null)
                }
              }}
              onBlur={e => checkAccount(e.target.value)}
              placeholder={t('loginPlaceholder')}
              style={{
                width: '100%',
                height: 48,
                background: 'rgba(242,242,247,0.04)',
                border: `1px solid ${checkState === 'found' ? 'rgba(0,255,182,0.4)' : checkState === 'error' ? 'rgba(255,80,80,0.4)' : 'var(--pay-border-2)'}`,
                borderRadius: 'var(--pay-radius-sm)',
                padding: '0 44px 0 16px',
                color: 'var(--pay-fg-1)',
                fontSize: 15,
                fontFamily: 'var(--pay-font-sans)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
            />
            <div style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              color: checkState === 'found' ? 'var(--pay-success)' : checkState === 'error' ? '#ff5050' : 'var(--pay-fg-3)',
            }}>
              {checkState === 'checking' && <Spinner />}
              {checkState === 'found' && <CheckIcon color="var(--pay-success)" />}
              {checkState === 'error' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff5050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
              )}
            </div>
          </div>

          {checkState === 'found' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 8, fontSize: 13, color: 'var(--pay-success)',
            }}>
              <CheckIcon color="var(--pay-success)" />
              {t('loginFound')}: <strong>{login.trim()}</strong>
            </div>
          )}
          {checkState === 'error' && (
            <div style={{ marginTop: 8, fontSize: 13, color: '#ff5050' }}>
              {checkError}
            </div>
          )}
        </div>

        {/* Step 2: Amount (visible after account found) */}
        {checkState === 'found' && (
          <div>
            <label style={{
              display: 'block',
              fontSize: 12, fontWeight: 600,
              color: 'var(--pay-fg-3)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              {t('amountLabel')}
            </label>

            {/* Chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {CHIPS.map(rub => (
                <button
                  key={rub}
                  onClick={() => selectChip(rub)}
                  style={{
                    height: 40, padding: '0 18px',
                    borderRadius: 'var(--pay-radius-sm)',
                    background: selectedChip === rub ? 'var(--pay-brand)' : 'rgba(242,242,247,0.06)',
                    border: `1px solid ${selectedChip === rub ? 'var(--pay-brand-press)' : 'var(--pay-border-2)'}`,
                    color: 'var(--pay-fg-1)',
                    fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--pay-font-sans)',
                    transition: 'background 0.12s, border-color 0.12s',
                    boxShadow: selectedChip === rub ? '0 4px 14px rgba(102,50,250,0.3)' : 'none',
                  }}
                >
                  {new Intl.NumberFormat('ru-RU').format(rub)} ₽
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <input
              value={customAmt}
              onChange={e => handleCustomAmt(e.target.value)}
              placeholder={t('customAmount')}
              type="number"
              min="100"
              max="50000"
              style={{
                width: '100%',
                height: 44,
                background: 'rgba(242,242,247,0.04)',
                border: `1px solid ${customAmt && Number(customAmt) < 100 ? 'rgba(255,80,80,0.4)' : customAmt && amount ? 'rgba(0,255,182,0.3)' : 'var(--pay-border-2)'}`,
                borderRadius: 'var(--pay-radius-sm)',
                padding: '0 16px',
                color: 'var(--pay-fg-1)',
                fontSize: 14,
                fontFamily: 'var(--pay-font-sans)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {customAmt && Number(customAmt) < 100 && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#ff5050' }}>
                {t('minAmount')}
              </div>
            )}

            {/* Rate display */}
            <div style={{ marginTop: 16, minHeight: 48 }}>
              {rateLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--pay-fg-3)', fontSize: 14 }}>
                  <Spinner />
                  {t('rateLoading')}
                </div>
              )}
              {rate && !rateLoading && (
                <div style={{
                  background: 'rgba(102,50,250,0.08)',
                  border: '1px solid rgba(102,50,250,0.2)',
                  borderRadius: 'var(--pay-radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--pay-fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                      Зачислим на Steam
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pay-fg-1)', letterSpacing: '-0.02em', marginTop: 2 }}>
                      {fmt(rate.net_amount)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--pay-fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                      К оплате
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pay-fg-1)', letterSpacing: '-0.02em', marginTop: 2 }}>
                      {rubAmount}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment method */}
        {checkState === 'found' && (
          <div>
            <label style={{
              display: 'block',
              fontSize: 12, fontWeight: 600,
              color: 'var(--pay-fg-3)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              {t('payMethodLabel')}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {([
                { id: 'sbp', label: t('sbpName'), sub: t('sbpSub') },
                { id: 'card', label: t('cardName'), sub: t('cardSub') },
              ] as const).map(({ id, label, sub }) => (
                <button
                  key={id}
                  onClick={() => handlePayTypeChange(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    background: payType === id ? 'rgba(102,50,250,0.1)' : 'rgba(242,242,247,0.04)',
                    border: `1px solid ${payType === id ? 'rgba(102,50,250,0.4)' : 'var(--pay-border-2)'}`,
                    borderRadius: 'var(--pay-radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.12s, background 0.12s',
                    width: '100%',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${payType === id ? 'var(--pay-brand)' : 'var(--pay-border-2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {payType === id && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pay-brand)' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--pay-fg-1)', fontFamily: 'var(--pay-font-sans)' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--pay-fg-3)', marginTop: 2 }}>{sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {checkState === 'found' && (
          <div style={{ height: 1, background: 'var(--pay-border-1)', margin: '0 -32px' }} />
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={!canPay}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 'var(--pay-radius-sm)',
            background: canPay ? 'var(--pay-brand)' : 'rgba(242,242,247,0.06)',
            border: canPay ? '1px solid var(--pay-brand-press)' : '1px solid var(--pay-border-1)',
            color: canPay ? 'var(--pay-fg-1)' : 'var(--pay-fg-3)',
            fontSize: 15, fontWeight: 600,
            fontFamily: 'var(--pay-font-sans)',
            cursor: canPay ? 'pointer' : 'not-allowed',
            transition: 'background 0.12s, box-shadow 0.12s',
            boxShadow: canPay ? '0 6px 20px rgba(102,50,250,0.35)' : 'none',
          }}
        >
          {submitting
            ? t('payBtnLoading')
            : payType === 'card'
              ? (rubAmount ? t('payBtnAmountCard', { amount: rubAmount }) : t('payBtnCard'))
              : (rubAmount ? t('payBtnAmount', { amount: rubAmount }) : t('payBtn'))}
        </button>

        {submitError && (
          <div style={{ fontSize: 13, color: '#ff5050', textAlign: 'center', marginTop: -12 }}>
            {submitError}
          </div>
        )}

        {/* Disclaimer */}
        <p style={{
          margin: 0, fontSize: 12,
          color: 'var(--pay-fg-3)',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          {payType === 'card' ? t('disclaimerCard') : t('disclaimerSbp')}
        </p>
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 24,
        marginTop: 24,
      }}>
        {[t('trust1'), t('trust2'), t('trust3')].map(label => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'var(--pay-fg-3)',
          }}>
            <CheckIcon color="var(--pay-success)" />
            {label}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  )
}
