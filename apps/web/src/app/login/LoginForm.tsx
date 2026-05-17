'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Step = 'email' | 'code'

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}

export function LoginForm() {
  const t = useTranslations('login')
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setStep('code')
    } catch {
      setError(t('errorSend'))
    }
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      })
      if (!res.ok) {
        setError(t('errorCode'))
        setLoading(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError(t('errorGeneric'))
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 52,
    background: 'rgba(242,242,247,0.04)',
    border: '1px solid var(--pay-border-2)',
    borderRadius: 'var(--pay-radius-sm)',
    padding: '0 16px',
    color: 'var(--pay-fg-1)',
    fontSize: 16,
    fontFamily: 'var(--pay-font-sans)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: '100%',
    height: 52,
    borderRadius: 'var(--pay-radius-sm)',
    background: active ? 'var(--pay-brand)' : 'rgba(242,242,247,0.06)',
    border: active ? '1px solid var(--pay-brand-press)' : '1px solid var(--pay-border-1)',
    color: active ? 'var(--pay-fg-1)' : 'var(--pay-fg-3)',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'var(--pay-font-sans)',
    cursor: active ? 'pointer' : 'not-allowed',
    boxShadow: active ? '0 6px 20px rgba(102,50,250,0.35)' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background 0.12s, box-shadow 0.12s',
  })

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--pay-font-sans)',
          fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--pay-fg-1)', margin: '0 0 8px',
        }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--pay-fg-3)', fontSize: 15, margin: 0 }}>
          {t('subtitle')}
        </p>
      </div>

      <div style={{
        background: 'var(--pay-grad-deep)',
        border: '1px solid var(--pay-border-2)',
        borderRadius: 'var(--pay-radius-xl)',
        padding: 32,
      }}>
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--pay-fg-3)', letterSpacing: '0.06em',
                textTransform: 'uppercase', marginBottom: 10,
              }}>
                {t('emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                autoFocus
                required
                style={inputStyle}
              />
            </div>
            {error && <p style={{ margin: 0, fontSize: 13, color: '#ff5050' }}>{error}</p>}
            <button type="submit" disabled={!email || loading} style={btnStyle(!!email && !loading)}>
              {loading ? <Spinner /> : null}
              {loading ? t('sending') : t('sendCode')}
            </button>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--pay-fg-3)', textAlign: 'center', lineHeight: 1.5 }}>
              {t('noPasswordHint')}
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--pay-fg-3)', letterSpacing: '0.06em',
                textTransform: 'uppercase', marginBottom: 10,
              }}>
                {t('codeLabel')}
              </label>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--pay-fg-3)' }}>
                {t('codeSentTo')} <strong style={{ color: 'var(--pay-fg-1)' }}>{email}</strong>
              </p>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoFocus
                inputMode="numeric"
                style={{ ...inputStyle, fontSize: 28, letterSpacing: '0.25em', textAlign: 'center' }}
              />
            </div>
            {error && <p style={{ margin: 0, fontSize: 13, color: '#ff5050' }}>{error}</p>}
            <button type="submit" disabled={code.length !== 6 || loading} style={btnStyle(code.length === 6 && !loading)}>
              {loading ? <Spinner /> : null}
              {loading ? t('verifying') : t('confirm')}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setError('') }}
              style={{
                background: 'none', border: 'none', color: 'var(--pay-fg-3)',
                fontSize: 13, cursor: 'pointer', fontFamily: 'var(--pay-font-sans)',
              }}
            >
              ← {t('changeEmail')}
            </button>
          </form>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
