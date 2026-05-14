import s from './loading.module.css'

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--pay-bg-0)' }}>
      {/* Navbar placeholder */}
      <div style={{ height: 64, borderBottom: '1px solid var(--pay-border-1)' }} />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 40px 80px' }}>
        {/* Breadcrumb skeleton */}
        <div className={s.row} style={{ marginBottom: 28 }}>
          <div className={`${s.bone} ${s.boneText}`} style={{ width: 56 }} />
          <div className={`${s.bone} ${s.boneText}`} style={{ width: 8 }} />
          <div className={`${s.bone} ${s.boneText}`} style={{ width: 80 }} />
        </div>

        {/* Title skeleton */}
        <div style={{ marginBottom: 36 }}>
          <div className={`${s.bone} ${s.boneTitle}`} />
          <div className={`${s.bone} ${s.boneBadge}`} style={{ marginTop: 12 }} />
        </div>

        {/* Product cards skeleton */}
        <div className={s.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={s.card}>
              <div className={`${s.bone} ${s.boneBadge}`} />
              <div className={`${s.bone} ${s.boneCardTitle}`} />
              <div className={`${s.bone} ${s.boneCardTitle}`} style={{ width: '60%' }} />
              <div className={`${s.bone} ${s.bonePrice}`} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
