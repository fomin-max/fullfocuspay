'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import s from './GroupsGrid.module.css'

interface Group {
  group: string
  icon?: string
  category?: string
}

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

const POPULAR_ORDER = [
  'Steam', 'Discord', 'Roblox', 'Spotify', 'Netflix',
  'PlayStation', 'Epic Games', 'Xbox', 'Riot Games',
  'OpenAI', 'Claude', 'Telegram Stars', 'miHoYo',
]

const CATEGORIES = ['All', 'games', 'business']

function popularityIndex(name: string) {
  const i = POPULAR_ORDER.indexOf(name)
  return i === -1 ? POPULAR_ORDER.length : i
}

export function GroupsGrid({ groups, initialQuery = '' }: { groups: Group[]; initialQuery?: string }) {
  const t = useTranslations('groups')
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState(initialQuery)

  const unique = useMemo(
    () => groups.filter((g, i, arr) => arr.findIndex(x => x.group === g.group) === i),
    [groups],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return unique
      .filter((g) => {
        if (activeCategory !== 'All' && g.category !== activeCategory) return false
        if (q && !g.group.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => popularityIndex(a.group) - popularityIndex(b.group))
  }, [unique, activeCategory, query])

  const catLabel = (cat: string) => {
    if (cat === 'All') return t('all')
    if (cat === 'games') return t('games')
    if (cat === 'business') return t('business')
    return cat
  }

  return (
    <>
      <div className={s.filters}>
        <div className={s.filterLeft}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${s.filterBtn} ${activeCategory === cat ? s.filterBtnActive : ''}`}
            >
              {catLabel(cat)}
            </button>
          ))}
        </div>

        <div className={s.filterRight}>
          <div className={s.searchWrap}>
            <svg className={s.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={s.searchInput}
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className={s.searchClear} onClick={() => setQuery('')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          <span className={s.count}>{t('count', { count: filtered.length })}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={s.empty}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span>{t('noResults', { query })}</span>
        </div>
      ) : (
        <div className={s.grid}>
          {filtered.map((group) => (
            <GroupCard key={group.group} group={group} />
          ))}
        </div>
      )}
    </>
  )
}

function GroupCard({ group }: { group: Group }) {
  const localIcon = SERVICE_ICONS[group.group]
  const [loaded, setLoaded] = useState(false)

  return (
    <Link href={`/services/${encodeURIComponent(group.group)}`} className={s.card}>
      <div className={s.cardGlow} />

      <div className={`${s.iconWrap} ${loaded ? s.iconWrapLoaded : ''}`}>
        {localIcon || group.icon ? (
          <Image
            src={localIcon ?? group.icon!}
            alt={group.group}
            width={40}
            height={40}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <span className={s.iconFallback}>{group.group[0]}</span>
        )}
      </div>

      <span className={s.cardName}>{group.group}</span>

      <span className={s.cardArrow}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </span>
    </Link>
  )
}
