'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { LocaleSwitcher } from './LocaleSwitcher'
import s from './Navbar.module.css'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type AuthUser = { id: string; email: string; name: string | null }

function LogoWordmark() {
  return (
    <svg viewBox="0 0 260 48" height="36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Full Focus Pay">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FFB6"/>
          <stop offset="1" stopColor="#6632FA"/>
        </linearGradient>
      </defs>
      {/* Mark */}
      <rect x="0" y="2" width="44" height="44" rx="10" fill="url(#logo-grad)"/>
      <path d="M10 16h24M10 24h16M10 32h10" stroke="#080223" strokeWidth="4" strokeLinecap="square"/>
      <circle cx="36" cy="32" r="3" fill="#080223"/>
      {/* Text */}
      <text x="54" y="30" fontFamily="Audiowide, system-ui, sans-serif" fontSize="20" letterSpacing="0.03em" fill="#F2F2F7">
        full focus
      </text>
      <text x="55" y="44" fontFamily="Manrope, system-ui, sans-serif" fontSize="9" letterSpacing="0.30em" fontWeight="700" fill="#6632FA">
        PAY
      </text>
    </svg>
  )
}

export function Navbar({ user }: { user?: AuthUser | null }) {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const NAV_LINKS = [
    { href: '/', label: t('dashboard') },
    { href: '/top-up', label: t('topup') },
    { href: '/services', label: t('services') },
    { href: '/orders', label: t('orders') },
    { href: '/help', label: t('help') },
  ]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    router.refresh()
  }

  const userInitial = user ? (user.name?.[0] ?? user.email[0]).toUpperCase() : null

  return (
    <header className={s.nav}>
      {/* Brand */}
      <Link href="/" className={s.brand}>
        <LogoWordmark />
      </Link>

      {/* Nav links */}
      <nav className={s.navLinks}>
        {NAV_LINKS.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`${s.navLink} ${active ? s.navLinkActive : ''}`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className={s.spacer} />

      {/* Search */}

      <div className={s.searchWrap}>
        <span className={s.searchIcon}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          className={s.searchInput}
          placeholder={t('search')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const q = (e.target as HTMLInputElement).value.trim()
              if (q) window.location.href = `/services?q=${encodeURIComponent(q)}`
            }
          }}
        />
      </div>

      <LocaleSwitcher locale={locale} />

      {/* Account */}
      {user ? (
        <div className={s.accountBtn} ref={dropdownRef} onClick={() => setDropdownOpen((v) => !v)}>
          <div className={s.accountAvatar}>{userInitial}</div>
          <span className={s.accountName}>{user.name ?? user.email.split('@')[0]}</span>
          <span className={`${s.chevron} ${dropdownOpen ? s.chevronOpen : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </span>

          {dropdownOpen && (
            <div className={s.dropdown} onClick={(e) => e.stopPropagation()}>
              <Link href="/orders" className={s.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect width="6" height="4" x="9" y="3" rx="1"/></svg>
                {t('myOrders')}
              </Link>
              <Link href="/help" className={s.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                {t('helpSupport')}
              </Link>
              <div className={s.dropdownDivider} />
              <button className={`${s.dropdownItem} ${s.dropdownDanger}`} onClick={handleLogout}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                {t('signOut')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className={s.loginBtn}>
          {t('signIn')}
        </Link>
      )}
    </header>
  )
}
