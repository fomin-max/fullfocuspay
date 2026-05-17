'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import s from './CheckoutForm.module.css'

interface FormField {
  name: string
  type: 'text' | 'options' | 'email' | string
  label: string
  options?: Array<{ name?: string; value: string | number; price?: number; product?: string }>
}

interface Product {
  product_id: number | string
  name: string
  price?: number
  retail_price?: number
  in_stock?: boolean
  type: string
  group?: string
  region?: string
}

interface Props {
  product: Product
  topupFields: FormField[]
  group: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function formatPrice(p: number) {
  return `${p.toLocaleString('ru-RU')} ₽`
}

export function CheckoutForm({ product, topupFields, group }: Props) {
  const router = useRouter()
  const t = useTranslations('checkout')
  const tp = useTranslations('products')
  const isVoucher = product.type === 'VOUCHER'
  const price = product.price ?? product.retail_price ?? 0

  const [values, setValues] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({})

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }))
    setFieldErrors((e) => { const next = { ...e }; delete next[name]; return next })
    setApiError('')
  }

  const failField = useCallback((name: string, msg: string) => {
    setFieldErrors({ [name]: msg })
    setTimeout(() => {
      const el = fieldRefs.current[name]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
      }
    }, 30)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setApiError('')

    // Basic validation
    if (isVoucher) {
      const email = values.email?.trim()
      if (!email || !email.includes('@')) {
        failField('email', t('errors.emailRequired'))
        return
      }
    } else {
      for (const field of topupFields) {
        if (field.type === 'text' && !values[field.name]?.trim()) {
          failField(field.name, t('errors.fieldRequired', { field: field.label }))
          return
        }
      }
    }

    setLoading(true)
    try {
      let res: Response
      if (isVoucher) {
        res = await fetch(`${API_URL}/api/orders/voucher`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            productId: String(product.product_id),
            productName: product.name,
            email: values.email.trim(),
            retailPrice: price,
          }),
        })
      } else {
        const formData: Record<string, unknown> = {}
        for (const field of topupFields) {
          formData[field.name] = values[field.name] ?? ''
        }
        res = await fetch(`${API_URL}/api/orders/topup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            productId: String(product.product_id),
            productName: product.name,
            formData,
            retailPrice: price,
          }),
        })
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error?.message || `Error ${res.status}`)
      }

      const data = await res.json()
      const { orderId, payUrl } = data.result

      if (!payUrl) throw new Error('No payment URL returned')

      // Save orderId for after payment redirect
      sessionStorage.setItem('last_order_id', orderId)

      // Redirect to SBP payment
      window.location.href = payUrl
    } catch (e: any) {
      setApiError(e.message || t('errors.generic'))
      setLoading(false)
    }
  }

  const outOfStock = product.in_stock === false

  return (
    <div className={s.layout}>
      {/* Left: form */}
      <div className={s.formSide}>
        {outOfStock && (
          <div className={s.outOfStock}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {tp('outOfStockHint')}
          </div>
        )}

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.section}>
            <div className={s.sectionTitle}>{t('yourDetails')}</div>

            {isVoucher ? (
              <Field
                label={t('email')}
                hint={t('emailHint')}
                name="email"
                type="email"
                placeholder="you@example.com"
                value={values.email ?? ''}
                onChange={(v) => set('email', v)}
                error={fieldErrors.email}
                inputRef={(el) => { fieldRefs.current.email = el }}
              />
            ) : (
              topupFields.map((field) => (
                field.type === 'options' ? (
                  <SelectField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    options={field.options ?? []}
                    value={values[field.name] ?? ''}
                    onChange={(v) => set(field.name, v)}
                    placeholder={t('selectPlaceholder')}
                    error={fieldErrors[field.name]}
                    selectRef={(el) => { fieldRefs.current[field.name] = el }}
                  />
                ) : (
                  <Field
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.name === 'password' ? 'password' : 'text'}
                    placeholder={field.label}
                    value={values[field.name] ?? ''}
                    onChange={(v) => set(field.name, v)}
                    error={fieldErrors[field.name]}
                    inputRef={(el) => { fieldRefs.current[field.name] = el }}
                  />
                )
              ))
            )}
          </div>

          {/* Payment method */}
          <div className={s.section}>
            <div className={s.sectionTitle}>{t('payMethod.title')}</div>

            {/* SBP — active */}
            <div className={`${s.method} ${s.methodSelected}`}>
              <span className={`${s.methodRadio} ${s.methodRadioSelected}`} />
              <span className={s.methodIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                </svg>
              </span>
              <span className={s.methodBody}>
                <span className={s.methodName}>{t('payMethod.sbpName')}</span>
                <span className={s.methodSub}>{t('payMethod.sbpSub')}</span>
              </span>
              <span className={`${s.methodFlag} ${s.methodFlagBloom}`}>{t('payMethod.sbpFlag')}</span>
            </div>

            {/* Card — disabled, coming soon */}
            <div className={`${s.method} ${s.methodDisabled}`}>
              <span className={s.methodRadio} />
              <span className={s.methodIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </span>
              <span className={s.methodBody}>
                <span className={s.methodName}>{t('payMethod.cardName')}</span>
                <span className={s.methodSub}>{t('payMethod.cardSub')}</span>
              </span>
              <span className={s.methodFlag}>{t('payMethod.cardFlag')}</span>
            </div>

            {/* USDT — disabled, coming soon */}
            <div className={`${s.method} ${s.methodDisabled}`}>
              <span className={s.methodRadio} />
              <span className={s.methodIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/><path d="M9 12h6M12 9v6"/>
                </svg>
              </span>
              <span className={s.methodBody}>
                <span className={s.methodName}>{t('payMethod.usdtName')}</span>
                <span className={s.methodSub}>{t('payMethod.usdtSub')}</span>
              </span>
              <span className={s.methodFlag}>{t('payMethod.usdtFlag')}</span>
            </div>
          </div>

          {apiError && (
            <div className={s.error}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          {/* Mobile-only pay button */}
          <button type="submit" className={`${s.payBtn} ${s.payBtnMobile}`} disabled={loading || outOfStock}>
            {loading ? <Spinner /> : null}
            {loading ? t('payBtnLoading') : price ? t('payBtnAmount', { amount: formatPrice(price) }) : t('payBtn')}
          </button>
        </form>
      </div>

      {/* Right: order summary */}
      <div className={s.summarySide}>
        <div className={s.summary}>
          <div className={s.summaryTitle}>{t('orderSummary')}</div>

          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>{product.name}</span>
            <span className={s.summaryValue}>{price ? formatPrice(price) : '—'}</span>
          </div>

          <div className={s.summaryDivider} />

          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>{t('payment')}</span>
            <span className={s.summaryPayMethod}>
              <SbpIcon />
              СБП
            </span>
          </div>

          <div className={s.summaryDivider} />

          <div className={s.summaryTotal}>
            <span className={s.summaryTotalLabel}>{t('total')}</span>
            {price ? (
              <span className={s.summaryTotalAmount}>
                <span className={s.tWhole}>{Math.floor(price).toLocaleString('ru-RU')}</span>
                <span className={s.tFrac}>,{String(Math.round((price % 1) * 100)).padStart(2, '0')}</span>
                <span className={s.tCcy}>₽</span>
              </span>
            ) : (
              <span className={s.tWhole}>—</span>
            )}
          </div>

          <button
            type="submit"
            form="checkout"
            className={s.payBtn}
            disabled={loading || outOfStock}
            onClick={handleSubmit as any}
          >
            {loading ? <Spinner /> : <SbpIcon size={16} />}
            {loading ? t('payBtnLoading') : t('payBtn')}
          </button>

          {/* ETA card */}
          <div className={s.etaCard}>
            <div className={s.etaRow}>
              <div className={s.etaIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>
                </svg>
              </div>
              <div>
                <div className={s.etaTitle}>{t('eta.title')}</div>
                <div className={s.etaSub}>{t('eta.sub')}</div>
              </div>
            </div>
            <div className={s.etaBar}><span className={s.etaFill} /></div>
            <div className={s.etaFoot}>
              <span>{t('eta.start')}</span>
              <span>{t('eta.end')}</span>
            </div>
          </div>

          <p className={s.summaryNote}>{t('disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, hint, name, type, placeholder, value, onChange, error, inputRef,
}: {
  label: string; hint?: string; name: string; type?: string
  placeholder?: string; value: string; onChange: (v: string) => void
  error?: string; inputRef?: (el: HTMLInputElement | null) => void
}) {
  return (
    <div className={s.field}>
      <label htmlFor={name}>
        <span className={s.fieldLabel}>{label}</span>
        {hint && <span className={s.fieldHint}>{hint}</span>}
      </label>
      <input
        id={name}
        ref={inputRef}
        className={`${s.input} ${error ? s.inputError : ''}`}
        name={name}
        type={type ?? 'text'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'off'}
      />
      {error && (
        <span className={s.fieldErrorMsg}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}

function SelectField({
  label, name, options, value, onChange, placeholder, error, selectRef,
}: {
  label: string; name: string
  options: Array<{ name?: string; value: string | number; product?: string }>
  value: string; onChange: (v: string) => void; placeholder: string
  error?: string; selectRef?: (el: HTMLSelectElement | null) => void
}) {
  return (
    <div className={s.field}>
      <label htmlFor={name}>
        <span className={s.fieldLabel}>{label}</span>
      </label>
      <select
        id={name}
        ref={selectRef}
        className={`${s.input} ${s.select} ${error ? s.inputError : ''}`}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.name ?? o.product ?? String(o.value)}
          </option>
        ))}
      </select>
      {error && (
        <span className={s.fieldErrorMsg}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className={s.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}

function SbpIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
    </svg>
  )
}
