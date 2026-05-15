'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import s from './LocaleSwitcher.module.css'

export function LocaleSwitcher({ locale }: { locale: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  function toggle() {
    const next = locale === 'ru' ? 'en' : 'ru'
    document.cookie = `locale=${next}; path=/; max-age=31536000`
    startTransition(() => router.refresh())
  }

  return (
    <button className={s.btn} onClick={toggle} title="Switch language">
      <span className={locale === 'ru' ? s.active : s.inactive}>RU</span>
      <span className={s.divider}>/</span>
      <span className={locale === 'en' ? s.active : s.inactive}>EN</span>
    </button>
  )
}
