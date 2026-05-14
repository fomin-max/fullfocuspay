'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
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

const CATEGORIES = ['All', 'games', 'business']

export function GroupsGrid({ groups }: { groups: Group[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  // Deduplicate by group name
  const unique = groups.filter((g, i, arr) => arr.findIndex(x => x.group === g.group) === i)

  const filtered = activeCategory === 'All'
    ? unique
    : unique.filter((g) => g.category === activeCategory)

  return (
    <>
      <div className={s.filters}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`${s.filterBtn} ${activeCategory === cat ? s.filterBtnActive : ''}`}
          >
            {cat === 'All' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <span className={s.count}>{filtered.length} services</span>
      </div>

      <div className={s.grid}>
        {filtered.map((group) => (
          <GroupCard key={group.group} group={group} />
        ))}
      </div>
    </>
  )
}

function GroupCard({ group }: { group: Group }) {
  const localIcon = SERVICE_ICONS[group.group]

  return (
    <Link href={`/services/${encodeURIComponent(group.group)}`} className={s.card}>
      <div className={s.cardGlow} />

      <div className={s.iconWrap}>
        {localIcon ? (
          <Image src={localIcon} alt={group.group} width={40} height={40} style={{ objectFit: 'contain' }} />
        ) : group.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={group.icon} alt={group.group} width={40} height={40} style={{ objectFit: 'contain' }} />
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
