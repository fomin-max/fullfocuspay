# Changelog

## [1.2.0] — 2026-05-17

### Авторизация (Email OTP)
- Новые модели Prisma: `User`, `Session`, `OtpCode`; поле `Order.userId?`
- `POST /api/auth/send-otp` — 6-значный OTP, 10 минут, invalidates предыдущие
- `POST /api/auth/verify-otp` — создаёт DB-сессию, httpOnly cookie `ffp_session`
- `GET /api/auth/me` — текущий пользователь по cookie
- `POST /api/auth/logout` — удаляет сессию
- `linkGuestOrders` — гостевые заказы по email автоматически привязываются к аккаунту при логине
- Страница `/login` — двухшаговая форма: email → 6-значный код
- `NavbarServer` (server component) + обновлённый `Navbar` — кнопка "Войти" для гостей, аватар + dropdown для залогиненных

### История заказов (`/orders`)
- `GET /api/orders/mine` — список заказов залогиненного пользователя
- `GET /api/orders/by-email` — гостевой поиск по email
- Страница `/orders` — для залогиненных список, для гостей форма поиска
- `OrdersList` — карточки с иконкой типа, статус-бейджем, суммой, датой
- `GuestLookup` — поиск заказов по email с подсказкой войти

### Привязка userId при покупке
- `credentials: 'include'` добавлен в SteamForm и CheckoutForm
- Steam, voucher, topup заказы записывают `userId` если пользователь залогинен

### i18n
- СБП → FPS (Faster Payments System) во всех английских текстах
- Hero section обновлён: "Pay with FPS or card"
- Добавлены ключи: `orders.*`, `login.*`, `topup.minAmount`, кнопки по типу оплаты

### Карта для Steam
- Кнопка оплаты динамически меняется: "Оплатить 500 ₽ через СБП" / "Оплатить 500 ₽ картой"
- Секция "Способ оплаты" использует i18n ключи
- Дисклеймер меняется в зависимости от метода
- Валидация минимальной суммы в custom amount поле (< 100₽ → красная граница + подпись)

### Email (Resend)
- Пакет `resend` установлен, lazy import для dev без API key
- Домен fullfocuspay.ru добавлен в Resend (EU регион), DNS записи настроены
- `RESEND_API_KEY` / `RESEND_FROM` в config

### Инфраструктура
- VPS Timeweb Cloud (147.45.183.250, Ubuntu 24.04, СПб)
- Node.js 22, PostgreSQL 16, PM2, nginx установлены
- БД `ffp` создана, пользователь `ffp` настроен

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
