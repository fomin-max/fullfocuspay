# Full Focus Pay

Сервис для пополнения зарубежных цифровых и игровых сервисов через СБП (Система быстрых платежей).

Steam · Discord · Roblox · Spotify · Netflix · PlayStation и 100+ других сервисов.

---

## Архитектура

Монорепо на Turborepo:

```
fullfocuspay/
├── apps/
│   ├── api/        Fastify + Prisma + PostgreSQL (порт 3001)
│   └── web/        Next.js 15 App Router (порт 3000)
├── packages/
│   └── types/      Общие TypeScript-типы
└── docker-compose.yml
```

**Провайдер платежей:** [keys.foreignpay.ru](https://keys.foreignpay.ru)

---

## Быстрый старт

### Требования

- Node.js 20+
- Docker (для PostgreSQL)
- npm 10+

### 1. Клонировать и установить зависимости

```bash
git clone <repo>
cd fullfocuspay
npm install
```

### 2. Запустить PostgreSQL

```bash
docker compose up -d
```

### 3. Настроить переменные окружения

```bash
cp apps/api/.env.example apps/api/.env
```

Заполнить `apps/api/.env`:

```env
PORT=3001
FRONT_URL=http://localhost:3000
DATABASE_URL=postgresql://ffp:ffp@localhost:5432/ffp
FOREIGNPAY_URL=https://keys.foreignpay.ru
FOREIGNPAY_TOKEN=<ваш токен>
OUR_PERCENT=5
```

Для `apps/web` создать `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
```

### 4. Применить схему БД

```bash
cd apps/api && npx prisma db push
cd ../..
```

### 5. Запустить

```bash
# В двух терминалах:
npx tsx apps/api/src/index.ts        # API на :3001
cd apps/web && npx next dev -p 3000  # Web на :3000
```

---

## Переменные окружения

### apps/api/.env

| Переменная | Описание | Пример |
|------------|----------|--------|
| `PORT` | Порт API-сервера | `3001` |
| `FRONT_URL` | URL фронтенда (для success_url в СБП) | `https://fullfocuspay.ru` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://ffp:ffp@localhost:5432/ffp` |
| `FOREIGNPAY_URL` | Базовый URL ForeignPay API | `https://keys.foreignpay.ru` |
| `FOREIGNPAY_TOKEN` | Bearer-токен ForeignPay | — |
| `OUR_PERCENT` | Наценка в % | `5` |

### apps/web/.env.local

| Переменная | Описание |
|------------|----------|
| `NEXT_PUBLIC_API_URL` | URL API для клиентских запросов (браузер) |
| `API_URL` | URL API для серверных запросов (SSR) |

---

## API

Базовый URL: `http://localhost:3001`

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/groups` | Список групп сервисов |
| GET | `/api/products` | Каталог продуктов (`?type=VOUCHER&group=Steam`) |
| GET | `/api/products/:id` | Продукт по ID (`?type=VOUCHER`) |
| GET | `/api/group-form` | Форма топапа для группы (`?group=Steam`) |
| POST | `/api/orders/voucher` | Создать заказ ваучера |
| POST | `/api/orders/topup` | Создать заказ топапа |
| GET | `/api/orders/:id` | Получить заказ |
| POST | `/api/orders/:id/check-status` | Проверить статус оплаты |
| GET | `/api/orders/:id/result` | Получить ключ/код после оплаты |

---

## Стек

| Слой | Технология |
|------|-----------|
| Backend | Fastify v5, Prisma ORM, PostgreSQL |
| Frontend | Next.js 15 (App Router), CSS Modules |
| i18n | next-intl (RU/EN, cookie-based) |
| Шрифты | Grandis Extended, Magistral, Audiowide (localFont) |
| Платежи | ForeignPay (СБП) |
| Инфра | Docker Compose, Turborepo |

---

## Деплой

На VPS с Docker:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Nginx проксирует:
- `fullfocuspay.ru` → Next.js (порт 3000)
- `api.fullfocuspay.ru` → Fastify (порт 3001)

**Важно:** `FRONT_URL` в `.env` должен содержать прод-домен — ForeignPay использует его для success_url при оплате.

---

## Changelog

См. [CHANGELOG.md](./CHANGELOG.md)
