import { getTranslations } from 'next-intl/server'
import { NavbarServer as Navbar } from '@/components/layout/NavbarServer'
import { GroupsGrid } from '@/components/home/GroupsGrid'

async function getGroups() {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:3001'}/api/groups`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.result ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const groups = await getGroups()
  const t = await getTranslations('home')

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(70% 50% at 85% -10%, rgba(102,50,250,0.18) 0%, rgba(8,2,35,0) 60%),
        radial-gradient(50% 40% at 0% 0%, rgba(0,255,182,0.07) 0%, rgba(8,2,35,0) 55%),
        var(--pay-bg-0)
      `,
    }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 40px 80px' }}>

        {/* Hero */}
        <section style={{
          position: 'relative',
          background: 'var(--pay-grad-deep)',
          border: '1px solid var(--pay-border-2)',
          borderRadius: 'var(--pay-radius-xl)',
          padding: '40px 48px',
          overflow: 'hidden',
          marginBottom: 48,
        }}>
          {/* Bloom glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              radial-gradient(60% 80% at 90% 20%, rgba(102,50,250,0.4) 0%, transparent 60%),
              radial-gradient(30% 50% at 100% 100%, rgba(0,255,182,0.15) 0%, transparent 60%)
            `,
          }} />
          {/* Grid texture */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(242,242,247,0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(242,242,247,0.035) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            WebkitMaskImage: 'radial-gradient(70% 70% at 20% 40%, black 0%, transparent 70%)',
            maskImage: 'radial-gradient(70% 70% at 20% 40%, black 0%, transparent 70%)',
          }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
            <div>
              {/* Live pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 28, padding: '0 12px 0 10px',
                borderRadius: 'var(--pay-radius-full)',
                background: 'var(--pay-success-subtle)',
                border: '1px solid rgba(0,255,182,0.22)',
                color: 'var(--pay-success)',
                fontSize: 11, fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--pay-success)',
                  animation: 'pulse-dot 1.8s ease infinite',
                  display: 'inline-block',
                }} />
                {t('live')}
              </div>

              <h1 style={{
                margin: 0,
                fontFamily: 'var(--pay-font-sans)',
                fontSize: 52, lineHeight: 1.0,
                letterSpacing: '-0.02em', fontWeight: 700,
                color: 'var(--pay-fg-1)',
              }}>
                {t('headline').split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </h1>
              <p style={{
                margin: '16px 0 0',
                color: 'var(--pay-fg-2)', fontSize: 16, lineHeight: 1.5,
                maxWidth: 420,
              }}>
                {t('subline', { count: groups.length > 0 ? groups.length : 100 })}
              </p>

              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <a href="/top-up" style={{
                  height: 44, padding: '0 20px',
                  borderRadius: 'var(--pay-radius-sm)',
                  background: 'var(--pay-brand)',
                  color: 'var(--pay-fg-1)',
                  fontFamily: 'var(--pay-font-sans)',
                  fontSize: 14, fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 0 0 1px var(--pay-brand-press) inset, 0 6px 20px rgba(102,50,250,0.35)',
                }}>
                  {t('topupSteam')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
                <a href="/services" style={{
                  height: 44, padding: '0 20px',
                  borderRadius: 'var(--pay-radius-sm)',
                  background: 'rgba(242,242,247,0.04)',
                  color: 'var(--pay-fg-1)',
                  border: '1px solid var(--pay-border-2)',
                  fontFamily: 'var(--pay-font-sans)',
                  fontSize: 14, fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center',
                }}>
                  {t('browse')}
                </a>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200 }}>
              {[
                { value: groups.length > 0 ? `${groups.length}+` : '100+', label: t('stats.services') },
                { value: '42 sec', label: t('stats.delivery') },
                { value: '98.4%', label: t('stats.successRate') },
              ].map(({ value, label }) => (
                <div key={label} style={{
                  background: 'rgba(242,242,247,0.04)',
                  border: '1px solid var(--pay-border-1)',
                  borderRadius: 'var(--pay-radius-md)',
                  padding: '14px 20px',
                }}>
                  <div style={{
                    fontFamily: 'var(--pay-font-sans)',
                    fontSize: 28, fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--pay-fg-1)',
                  }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--pay-fg-3)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Groups grid */}
        <section id="popular">
          <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: 'var(--pay-fg-1)' }}>
            {t('allServices')}
          </h2>
          <GroupsGrid groups={groups} />
        </section>

      </main>
    </div>
  )
}
