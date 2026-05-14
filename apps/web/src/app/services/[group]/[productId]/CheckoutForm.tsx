'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const isVoucher = product.type === 'VOUCHER'
  const price = product.price ?? product.retail_price ?? 0

  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Basic validation
    if (isVoucher) {
      const email = values.email?.trim()
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address')
        return
      }
    } else {
      for (const field of topupFields) {
        if (field.type === 'text' && !values[field.name]?.trim()) {
          setError(`Please fill in: ${field.label}`)
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
      setError(e.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const outOfStock = product.in_stock === false

  return (
    <div className={s.layout}>
      {/* Left: form */}
      <div className={s.formSide}>
        <div className={s.productHeader}>
          <div className={s.productMeta}>
            <span className={s.typeBadge}>{isVoucher ? 'Gift card / Key' : 'Top-up'}</span>
            {product.region && <span className={s.regionBadge}>{product.region}</span>}
          </div>
          <h1 className={s.productName}>{product.name}</h1>
          {outOfStock && (
            <div className={s.outOfStock}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Out of stock — may still process
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.section}>
            <div className={s.sectionTitle}>Your details</div>

            {isVoucher ? (
              <Field
                label="Email"
                hint="We'll send the key to this address if needed"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={values.email ?? ''}
                onChange={(v) => set('email', v)}
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
                  />
                )
              ))
            )}
          </div>

          {error && (
            <div className={s.error}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Mobile-only pay button */}
          <button type="submit" className={`${s.payBtn} ${s.payBtnMobile}`} disabled={loading}>
            {loading ? <Spinner /> : null}
            {loading ? 'Processing…' : `Pay ${price ? formatPrice(price) : ''} with СБП`}
          </button>
        </form>
      </div>

      {/* Right: order summary */}
      <div className={s.summarySide}>
        <div className={s.summary}>
          <div className={s.summaryTitle}>Order summary</div>

          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>{product.name}</span>
            <span className={s.summaryValue}>{price ? formatPrice(price) : '—'}</span>
          </div>

          <div className={s.summaryDivider} />

          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>Payment</span>
            <span className={s.summaryPayMethod}>
              <SbpIcon />
              СБП
            </span>
          </div>

          <div className={s.summaryDivider} />

          <div className={s.summaryTotal}>
            <span>Total</span>
            <span className={s.summaryTotalAmount}>{price ? formatPrice(price) : '—'}</span>
          </div>

          <button
            type="submit"
            form="checkout"
            className={s.payBtn}
            disabled={loading}
            onClick={handleSubmit as any}
          >
            {loading ? <Spinner /> : <SbpIcon size={16} />}
            {loading ? 'Processing…' : 'Pay with СБП'}
          </button>

          <p className={s.summaryNote}>
            You will be redirected to your bank app to confirm the payment. Delivery in under 60 seconds.
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, hint, name, type, placeholder, value, onChange,
}: {
  label: string; hint?: string; name: string; type?: string
  placeholder?: string; value: string; onChange: (v: string) => void
}) {
  return (
    <label className={s.field}>
      <span className={s.fieldLabel}>{label}</span>
      {hint && <span className={s.fieldHint}>{hint}</span>}
      <input
        className={s.input}
        name={name}
        type={type ?? 'text'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'off'}
      />
    </label>
  )
}

function SelectField({
  label, name, options, value, onChange,
}: {
  label: string; name: string
  options: Array<{ name?: string; value: string | number; product?: string }>
  value: string; onChange: (v: string) => void
}) {
  return (
    <label className={s.field}>
      <span className={s.fieldLabel}>{label}</span>
      <select
        className={`${s.input} ${s.select}`}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.name ?? o.product ?? String(o.value)}
          </option>
        ))}
      </select>
    </label>
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
