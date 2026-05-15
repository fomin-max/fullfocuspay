# Changelog

## [1.0.0] — 2026-05-15

Первый публичный релиз Full Focus Pay.

### Backend (apps/api)

- Fastify + Prisma + PostgreSQL монолит на порту 3001
- Интеграция с keys.foreignpay.ru через Bearer-токен
- `GET /api/groups` — список групп сервисов (110+)
- `GET /api/products` — каталог с фильтрацией по типу и группе
- `GET /api/products/:id` — карточка продукта
- `GET /api/group-form` — динамическая форма топапа для группы
- `POST /api/orders/voucher` — создание заказа на ваучер/ключ
- `POST /api/orders/topup` — создание заказа на топап
- `POST /api/orders/steam` — прямое пополнение Steam (логин + сумма в USD)
- `GET /api/orders/:id` — статус заказа
- `POST /api/orders/:id/check-status` — polling статуса + сохранение ключа при оплате
- `GET /api/orders/:id/result` — результат (ключ/код) для success-страницы
- Prisma-схема: модель Order с полями productType, status, transactionUuid, resultKey

### Frontend (apps/web)

- Next.js 15 App Router, CSS Modules, next-intl (RU/EN)
- Шрифты по брендбуку: Grandis Extended, Magistral, Audiowide — через next/font/local
- **Главная страница** — hero с live-статусом, статистика, список сервисов
- **`/services`** — все 110+ сервисов с поиском, категориями, сортировкой по популярности
- **`/services/[group]`** — список продуктов группы с фильтрами (тип, цена, страна, наличие)
- **`/services/[group]/[productId]`** — страница продукта:
  - Сервис-хедер с логотипом, бейджами, тегами, aside-статистикой
  - Форма оплаты: динамические поля, inline-валидация с auto-scroll, inline ошибки
  - Методы оплаты: СБП (активен), Карта и USDT (coming soon)
  - Summary с разбивкой суммы и ETA-карточкой
- **`/orders/[id]`** — статус заказа с polling, анимацией ожидания, отображением ключа
- **`/orders/[id]/success`** — страница после редиректа с СБП
- Navbar: поиск (Enter → `/services?q=`), account dropdown, переключатель RU/EN
- ScrollToTop при переходе на страницу продукта
