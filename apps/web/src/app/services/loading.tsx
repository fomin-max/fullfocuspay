import s from './loading.module.css'

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--pay-bg-0)' }}>
      <div style={{ height: 64, borderBottom: '1px solid var(--pay-border-1)' }} />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 40px 80px' }}>
        <div className={`${s.bone} ${s.boneTitle}`} style={{ marginBottom: 8 }} />
        <div className={`${s.bone} ${s.boneSubtitle}`} style={{ marginBottom: 32 }} />

        {/* Filter pills */}
        <div className={s.row} style={{ marginBottom: 20 }}>
          {[80, 72, 88].map((w) => (
            <div key={w} className={`${s.bone} ${s.bonePill}`} style={{ width: w }} />
          ))}
        </div>

        {/* Service cards grid */}
        <div className={s.grid}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className={s.card}>
              <div className={`${s.bone} ${s.boneIcon}`} />
              <div className={`${s.bone} ${s.boneCardName}`} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
