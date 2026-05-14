---
name: stack-decisions
description: "Финальные решения по стеку, архитектуре и инфраструктуре Full Focus Pay"
metadata: 
  node_type: memory
  type: project
  originSessionId: 31fb434c-02d8-4b35-82b5-cb39f5a613ff
---

# Стек и ключевые решения

## Монорепо (Turborepo)

```
apps/
  landing/   ← Astro (SEO-лендинг, статический)
  web/       ← Next.js 15 App Router (основное приложение)
  api/       ← Fastify + TypeScript (бэкенд)
packages/
  types/     ← общие TypeScript типы (шаринг между api/web/landing)
  ui/        ← shadcn/ui компоненты (шаринг между web/landing)
```

## Фронтенд (apps/web — Next.js 15)
- **Next.js 15** App Router + Server Actions
- **Tailwind CSS v4**
- **shadcn/ui** — компоненты
- **TanStack Query** — кэш каталога продуктов (редко меняется)
- **Zustand** — состояние формы оплаты, UI-стейт
- **Zod** — валидация форм на клиенте

## Лендинг (apps/landing — Astro)
- **Astro** — статическая генерация, минимум JS
- **Tailwind CSS v4** — единый стиль с основным приложением
- Может использовать React-компоненты (islands) где нужна интерактивность
- Цель: отличный Core Web Vitals, хорошая индексация Google

## Бэкенд (apps/api — Fastify)
- **Fastify + TypeScript**
- **Prisma ORM** — типобезопасная работа с БД, автогенерация типов
- **Zod** — валидация входящих запросов
- **PostgreSQL** — основная БД

## База данных
- **PostgreSQL** (Docker-контейнер)
- Выбор обоснован: заказы/транзакции — реляционные данные, удобная аналитика, лёгкая миграция на Supabase если понадобится
- **Не MongoDB** — несмотря на старый проект, для платёжных данных PostgreSQL лучше

## Инфраструктура
- **VPS в РФ** — Timeweb Cloud / Selectel / Beget (~800 ₽/мес, 2 vCPU / 4GB / 50GB)
- **Docker Compose** — все сервисы в одном файле, поднимается одной командой
- **Nginx** — reverse proxy, раздача статики
- **Let's Encrypt / Certbot** — SSL бесплатно
- Бэкапы PostgreSQL: cron + pg_dump

```yaml
# docker-compose структура
services:
  nginx
  web       (Next.js)
  landing   (Astro, статика через nginx)
  api       (Fastify)
  postgres
```

## Почему self-hosted, не Supabase
- Full Focus Hub (другой проект) на Supabase имеет проблемы с доступностью из РФ — часть провайдеров блокирует соединение
- Полная независимость от внешних сервисов
- Расходы минимальны (только VPS)

---

# Базовый план реализации

## Фаза 1 — Инициализация
- [ ] Создать монорепо Turborepo
- [ ] Настроить apps/api (Fastify + Prisma + PostgreSQL)
- [ ] Настроить apps/web (Next.js 15 + shadcn/ui + Tailwind)
- [ ] Настроить apps/landing (Astro + Tailwind)
- [ ] Настроить packages/types и packages/ui
- [ ] Docker Compose для локальной разработки

## Фаза 2 — Бэкенд (API-интеграция)
- [ ] Prisma схема: orders, transactions
- [ ] Сервис ForeignPayClient (обёртка над keys.foreignpay.ru)
- [ ] Эндпоинты каталога: группы, продукты, форма группы
- [ ] Эндпоинт Steam: check → get-rate → pay
- [ ] Эндпоинт TOPUP: check-account → topup/check
- [ ] Эндпоинт VOUCHER: voucher/buy
- [ ] Эндпоинт eSIM: esim-trip/buy
- [ ] Проверка статуса транзакции
- [ ] Получение информации о купленном товаре

## Фаза 3 — Основное приложение (web)
- [ ] Главная: grid групп сервисов (из get-groups)
- [ ] Страница группы: список продуктов + динамическая форма
- [ ] Флоу оплаты: отображение QR / ссылки СБП
- [ ] Страница успеха: показ ключа/ваучера/инструкций
- [ ] Polling статуса транзакции

## Фаза 4 — Лендинг
- [ ] Главная страница с описанием сервиса
- [ ] SEO-метатеги, sitemap, robots.txt
- [ ] Интеграция с основным приложением (CTA → web)

## Фаза 5 — Деплой
- [ ] Docker Compose для production
- [ ] Nginx конфиг
- [ ] SSL через Certbot
- [ ] CI/CD (GitHub Actions → VPS)

---

# Дизайн
- Направление: современный минималистичный, тёмная тема
- Разрабатывается в Claude Design (соседний диалог)
- Реализация начнётся после получения макетов
