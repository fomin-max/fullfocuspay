import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { NavbarServer as Navbar } from '@/components/layout/NavbarServer'
import { CheckoutForm } from './CheckoutForm'
import { ScrollToTop } from '@/components/ScrollToTop'
import s from './page.module.css'

const API_URL = process.env.API_URL || 'http://localhost:3001'

const SERVICE_ICONS: Record<string, string> = {
  'Steam': '/assets/services/steam.svg',
  'Discord': '/assets/services/discord.svg',
  'Epic Games': '/assets/services/epic.svg',
  'Spotify': '/assets/services/spotify.svg',
  'Netflix': '/assets/services/netflix.svg',
  'PlayStation': '/assets/services/playstation.svg',
  'Roblox': '/assets/services/roblox.svg',
  'Xbox': '/assets/services/xbox.svg',
  'Riot Games': '/assets/services/riot.svg',
  'OpenAI': '/assets/services/openai.svg',
  'Claude': '/assets/services/claude.svg',
  'miHoYo': '/assets/services/mihoyo.svg',
}

async function getProduct(id: string, type: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(id)}?type=${type}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.result ?? null
  } catch {
    return null
  }
}

async function getGroupForm(group: string) {
  try {
    const res = await fetch(`${API_URL}/api/group-form?group=${encodeURIComponent(group)}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.result ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ group: string; productId: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { productId } = await params
  const { type = 'VOUCHER' } = await searchParams
  const product = await getProduct(decodeURIComponent(productId), type)
  return { title: product ? `${product.name} — Full Focus Pay` : 'Product — Full Focus Pay' }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ group: string; productId: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { group, productId } = await params
  const { type = 'VOUCHER' } = await searchParams
  const decodedGroup = decodeURIComponent(group)
  const decodedId = decodeURIComponent(productId)

  const [product, groupForm, t, tn] = await Promise.all([
    getProduct(decodedId, type),
    getGroupForm(decodedGroup),
    getTranslations('checkout'),
    getTranslations('nav'),
  ])

  if (!product) notFound()

  const topupFields: any[] = (groupForm?.forms?.topup_fields ?? []).filter((f: any) => {
    if (f.name === 'product_id') return false
    if (f.type === 'options' && f.options?.length <= 1) return false
    return true
  })

  const logo = SERVICE_ICONS[decodedGroup]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pay-bg-0)' }}>
      <ScrollToTop />
      <Navbar />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 40px 80px' }}>

        {/* Page head: breadcrumb + checkout steps */}
        <div className={s.pageHead}>
          <nav className={s.breadcrumb}>
            <Link href="/services" className={s.breadcrumbLink}>{tn('services')}</Link>
            <span className={s.sep}>/</span>
            <Link href={`/services/${encodeURIComponent(decodedGroup)}`} className={s.breadcrumbLink}>
              {decodedGroup}
            </Link>
            <span className={s.sep}>/</span>
            <span className={s.breadcrumbCurrent}>{product.name}</span>
          </nav>

          <ol className={s.steps}>
            <li className={`${s.step} ${s.stepDone}`}>
              <span className={s.stepDot}>✓</span>
              {t('steps.service')}
            </li>
            <li className={`${s.step} ${s.stepActive}`}>
              <span className={s.stepDot}>2</span>
              {t('steps.payment')}
            </li>
            <li className={s.step}>
              <span className={s.stepDot}>3</span>
              {t('steps.confirm')}
            </li>
          </ol>
        </div>

        {/* Service header */}
        <header className={s.svcHeader}>
          <div className={s.svcHeaderGlow} />

          {/* Always render logo slot to keep grid columns stable */}
          <div className={s.svcLogo}>
            {logo ? (
              <Image src={logo} alt={decodedGroup} width={72} height={72} style={{ objectFit: 'contain' }} />
            ) : (
              <span className={s.svcLogoFallback}>{decodedGroup[0]}</span>
            )}
          </div>

          <div className={s.svcMeta}>
            <div className={s.svcBadges}>
              <span className={s.typeBadge}>{type === 'VOUCHER' ? 'Gift card / Key' : 'Top-up'}</span>
              {product.region && product.region.length < 30 && (
                <span className={s.regionBadge}>{product.region}</span>
              )}
            </div>
            <h1 className={s.svcTitle}>{product.name}</h1>
            <div className={s.svcTags}>
              <span className={s.tag}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>
                </svg>
                {t('tags.instant')}
              </span>
              <span className={s.tag}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-3Z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                {t('tags.secure')}
              </span>
            </div>
          </div>

          <div className={s.svcAside}>
            <div className={s.asideRow}>
              <span>{t('aside.status')}</span>
              <span className={product.in_stock === false ? s.asideMonoWarn : s.asideMono}>
                {product.in_stock === false ? (
                  t('aside.outOfStock')
                ) : (
                  <><span className={s.liveDot} />{t('aside.inStock')}</>
                )}
              </span>
            </div>
            <div className={s.asideDivider} />
            <div className={s.asideRow}>
              <span>{t('aside.payment')}</span>
              <span className={s.asideMono}>{t('aside.paymentValue')}</span>
            </div>
          </div>
        </header>

        <CheckoutForm
          product={product}
          topupFields={type === 'TOPUP' ? topupFields : []}
          group={decodedGroup}
        />
      </main>
    </div>
  )
}
