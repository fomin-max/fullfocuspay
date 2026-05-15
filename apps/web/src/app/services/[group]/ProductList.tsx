'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
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
  in_stock?: boolean
  [key: string]: unknown
}

type PriceRange = 'all' | 'lt500' | 'r500' | 'r2000' | 'gt5000'

// All known country/region names — sorted longest first so multi-word matches win
// Add new entries here as needed; the filter picks them up automatically
const KNOWN_REGIONS = [
  'Saudi Arabia', 'South Africa', 'South Korea', 'New Zealand',
  'Hong Kong', 'United Arab Emirates',
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
  'Bolivia', 'Bosnia', 'Brazil', 'Bulgaria', 'Cambodia', 'Canada', 'Chile',
  'China', 'Colombia', 'Costa Rica', 'Croatia', 'Czechia', 'Czech Republic',
  'Denmark', 'Ecuador', 'Egypt', 'Estonia', 'Europe', 'Finland', 'France',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Hungary', 'Iceland',
  'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania',
  'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'Nigeria',
  'Norway', 'Oman', 'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Serbia', 'Singapore',
  'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Taiwan',
  'Thailand', 'Turkey', 'Ukraine', 'Uruguay', 'Venezuela', 'Vietnam',
  'UAE', 'USA', 'UK',
].sort((a, b) => b.length - a.length)

function extractRegion(name: string): string | null {
  for (const region of KNOWN_REGIONS) {
    if (name.includes(region)) return region
  }
  return null
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

function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

function inPriceRange(price: number | null, range: PriceRange): boolean {
  if (range === 'all' || price === null) return true
  if (range === 'lt500') return price < 500
  if (range === 'r500') return price >= 500 && price < 2000
  if (range === 'r2000') return price >= 2000 && price < 5000
  if (range === 'gt5000') return price >= 5000
  return true
}

export function ProductList({ products, group }: { products: Product[]; group: string }) {
  const t = useTranslations('products')

  const types = useMemo(
    () => [...new Set(products.map((p) => p.type).filter(Boolean))] as string[],
    [products],
  )
  const regions = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      const r = extractRegion(productName(p))
      if (r) set.add(r)
    }
    return [...set].sort()
  }, [products])

  const [activeType, setActiveType] = useState(types[0] ?? 'ALL')
  const [priceRange, setPriceRange] = useState<PriceRange>('all')
  const [activeRegion, setActiveRegion] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)

  const PRICE_RANGES: PriceRange[] = ['all', 'lt500', 'r500', 'r2000', 'gt5000']

  const filtered = useMemo(() => {
    let result = products

    if (activeType !== 'ALL' && types.length > 1) {
      result = result.filter((p) => p.type === activeType)
    }
    if (activeRegion !== 'all') {
      result = result.filter((p) => extractRegion(productName(p)) === activeRegion)
    }
    if (priceRange !== 'all') {
      result = result.filter((p) => inPriceRange(productPrice(p), priceRange))
    }
    if (inStockOnly) {
      result = result.filter((p) => p.in_stock !== false)
    }

    // Always sort: in-stock first, then by price ascending
    return [...result].sort((a, b) => {
      const aOut = a.in_stock === false ? 1 : 0
      const bOut = b.in_stock === false ? 1 : 0
      if (aOut !== bOut) return aOut - bOut
      return (productPrice(a) ?? 0) - (productPrice(b) ?? 0)
    })
  }, [products, activeType, types, activeRegion, priceRange, inStockOnly])

  if (products.length === 0) {
    return <div className={s.empty}><p>{t('empty')}</p></div>
  }

  return (
    <>
      {/* Type tabs */}
      {types.length > 1 && (
        <div className={s.tabs}>
          {types.map((type) => (
            <button
              key={type}
              className={`${s.tab} ${activeType === type ? s.tabActive : ''}`}
              onClick={() => setActiveType(type)}
            >
              {t(`types.${type}` as any)}
              <span className={s.tabCount}>
                {products.filter((p) => p.type === type).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className={s.filterBar}>
        {/* Price range */}
        <div className={s.filterGroup}>
          <span className={s.filterLabel}>{t('filters.price')}</span>
          <div className={s.filterChips}>
            {PRICE_RANGES.map((range) => (
              <button
                key={range}
                className={`${s.chip} ${priceRange === range ? s.chipActive : ''}`}
                onClick={() => setPriceRange(range)}
              >
                {t(`filters.${range}` as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Region/country filter */}
        {regions.length > 1 && (
          <div className={s.filterGroup}>
            <span className={s.filterLabel}>{t('filters.country')}</span>
            <select
              className={s.currencySelect}
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
            >
              <option value="all">{t('filters.allCountries')}</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {/* In stock toggle */}
        <label className={s.stockToggle}>
          <input
            type="checkbox"
            className={s.stockCheckbox}
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          <span className={`${s.stockTrack} ${inStockOnly ? s.stockTrackOn : ''}`}>
            <span className={s.stockThumb} />
          </span>
          <span className={s.stockLabel}>{t('filters.inStockOnly')}</span>
        </label>

        <span className={s.resultsCount}>
          {t('filters.results', { count: filtered.length })}
        </span>
      </div>

      {/* Grid */}
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
          const outOfStock = product.in_stock === false

          return (
            <Link
              key={id || name}
              href={outOfStock ? '#' : href}
              className={`${s.card} ${outOfStock ? s.cardDisabled : ''}`}
              aria-disabled={outOfStock}
              onClick={outOfStock ? (e) => e.preventDefault() : undefined}
            >
              <div className={s.cardGlow} />
              <div className={s.cardTop}>
                <span className={s.typeBadge}>{t(`types.${type}` as any)}</span>
                {outOfStock && (
                  <span className={s.outOfStockBadge}>{t('outOfStock')}</span>
                )}
              </div>
              <div className={s.cardName}>{name}</div>
              <div className={s.cardBottom}>
                {price !== null && (
                  <span className={s.cardPrice}>{formatPrice(price)}</span>
                )}
                {!outOfStock && (
                  <span className={s.cardBuy}>
                    {t('buy')}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className={s.empty}>
          <p>{t('empty')}</p>
        </div>
      )}
    </>
  )
}
