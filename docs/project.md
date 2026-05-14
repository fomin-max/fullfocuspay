---
name: project-fullfocuspay
description: "Full Focus Pay — магазин цифровых товаров с оплатой через СБП. Контекст проекта, API, архитектура."
metadata: 
  node_type: memory
  type: project
  originSessionId: 31fb434c-02d8-4b35-82b5-cb39f5a613ff
---

# Full Focus Pay

Новый проект. Платёжный сервис для пополнения зарубежных сервисов и покупки цифровых товаров через СБП.

**Старый `foreign.foreignpay.ru` НЕ нужен** — весь функционал (включая Steam) покрыт новым API `keys.foreignpay.ru`.

---

## Единый API: keys.foreignpay.ru

**Auth:** `Authorization: Bearer <token>`
**Тестовый токен:** `d1a2bfde-a2aa-4ade-9611-59f72f7838ec`

### Каталог

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/webhook/v2/merchant/get-products` | GET | Все продукты. Query: `type=TOPUP/VOUCHER`, `currency=RUB/USD` |
| `/webhook/v2/merchant/get-product` | GET | Продукт по ID. Query: `type`, `product_id` |
| `/webhook/v2/merchant/get-groups` | GET | Группы (витрина). Query: `category=games/business` |
| `/webhook/v2/merchant/get-group-form` | GET | Форма группы с динамическими полями. Query: `group=Steam` |

`get-group-form` возвращает `topup_fields` и `voucher_fields` — динамические поля для каждого сервиса (text, number, password, options, hidden). Это ключ к универсальной форме.

### Покупки (все через `POST /webhook/proxy-request-post`)

**Steam (особый случай — три шага):**
- path `/steam/check` → `{ steamUsername }` → возвращает `transactionId`
- path `/steam/get-rate` → `{ net_amount }` → возвращает `{ net_amount, amount }` (сумма к оплате)
- path `/steam/v2/pay` → `{ net_amount, transactionId, successUrl }` → возвращает `sbp_url`, `qr_url`

**TOPUP (пополнение аккаунтов — Roblox, PUBG, Mobile Legends и др.):**
- path `/topup/check` → динамические поля из `get-group-form` + `success_url`, `product_id`, `order_id`, `retail_price` → возвращает `sbp_url`, `qr_url`, `sbp_uuid`
- path `/topup/deposit` → то же без оплаты (с баланса мерчанта)

**VOUCHER (подарочные карты, ключи):**
- path `/voucher/buy` → `{ product_id, email, success_url, retail_price, order_id }` → возвращает `sbp_url`, `qr_url`, `sbp_uuid`
- path `/voucher/deposit` → `{ product_id, email }` → возвращает `key` (код сразу)

**eSIM:**
- path `/esim-trip/buy` → `{ product_id, email, success_url, retail_price, package, days }`

### Статусы и информация

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `acquiring.foreignpay.ru/webhook/check_transaction` | POST | Статус транзакции по `transaction_uuid` (sbp_uuid). Статусы: Expired, Paid, Pending и др. |
| `/webhook/v2/merchant/topup/status` | POST | Статус TOPUP по `transaction_id`. Статусы: SUCCESS, Ready_to_sent, ORDER_SENT, PENDING, REFUNDED |
| `/webhook/v2/merchant/topup/check-account` | POST | Проверка аккаунта TOPUP (PUBG, ML и др.) |
| `/webhook/product/information` | POST | Инфо о купленном товаре по `transaction_id`. Типы: eSIM, redeem-ссылка, vcard (карта с реквизитами), voucher (код) |
| `/webhook/v2/merchant/send-key` | POST | Повторная отправка ваучера по `sbp_uuid` |
| `acquiring.foreignpay.ru/webhook/deposit-merchant-instructions` | POST | HTML-инструкции для мерчанта по `transaction_id` |

---

## Типы продуктов

- **TOPUP** — пополнение аккаунта (Steam, Roblox, PUBG, Mobile Legends и т.д.)
- **VOUCHER** — подарочные карты, коды активации (Visa prepaid, ChatGPT Plus и т.д.)
- **eSIM** — SIM-карты для роуминга

---

## Архитектура фронтенда

1. **Главная** — grid карточек групп (из `get-groups`) с иконками
2. **Страница группы** — список продуктов + динамическая форма (из `get-group-form`)
3. **Флоу оплаты:**
   - Steam: check → get-rate → pay → sbp_url
   - TOPUP: topup/check → sbp_url
   - VOUCHER: voucher/buy → sbp_url
   - eSIM: esim-trip/buy → sbp_url
4. **Страница успеха** — показ информации о купленном товаре (`product/information`)

---

## Стек
- **Бэкенд**: Fastify + TypeScript + MongoDB
- **Фронтенд**: React Router v7 / Next.js (уточняется) + Tailwind CSS v4
- **Дизайн**: современный минималистичный, тёмная тема (делается в Claude Design)
- **Деплой**: Docker, российский хостинг
