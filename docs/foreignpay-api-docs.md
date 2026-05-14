# Документация для подключения цифровых товаров (TOP UP/Voucher)

### **Описание запросов в Notion для мерчантов**

Все запросы требуют передачу идентификатора клиента (токена)

```jsx
Authorization: Bearer ${ваш токен}
```

- `Тестовый токен:` d1a2bfde-a2aa-4ade-9611-59f72f7838ec (для topup / ваучеров)

### **1.1 Список всех продуктов**

**URL:** `GET [https://keys.foreignpay.ru/webhook/v2/merchant/get-products](https://keys.foreignpay.ru/webhook/v2/merchant/get-products)`

**Параметры запроса (query):**

- `type`: “TOPUP” / “VOUCHER” (необязательно)
- `currency`: “RUB” / “USD” (необязательно, по умолчанию RUB)

**Описание:**

Этот запрос используется для получения списка продуктов, доступных в системе.

- **Пример ответа:**
    
    ```json
    [
      {
        "product_id": 746,
        "name": "Arena Breakout - 310 Bonds (Global)",
        "price": 591.07,
        "in_stock": true,
        "type": "TOPUP",
        "group": "Arena Breakout",
        "region": "Любой"
      },
      {
        "product_id": 749,
        "name": "Arena Breakout - 3200 Bonds (Global)",
        "price": 5922.81,
        "in_stock": true,
        "type": "VOUCHER",
        "group": "Arena Breakout",
        "region": "Любой"
      },
      {
        "product_id": 750,
        "name": "Arena Breakout - 6500 Bonds (Global)",
        "price": 11846.97,
        "in_stock": true,
        "type": "VOUCHER",
        "group": "Arena Breakout",
        "region": "Любой"
      }
    ]
    ```
    
- Ошибки:
    
     Invalid token (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid token"
    }
    ```
    
    Send both parameters: 'type' and 'product_id' (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Send both parameters: 'type' and 'product_id'"
    }
    ```
    

### **1.2 Получить продукт по id**

**URL:** `GET [https://keys.foreignpay.ru/webhook/v2/merchant/get-product](https://keys.foreignpay.ru/webhook/v2/merchant/get-products)`

**Параметры запроса (query):**

- `type` - “TOPUP” / “VOUCHER” (обязательно)
- `product_id` - берется из карточки товара или списка товаров  (обязательно)
- **Пример ответа:**
    
    ```json
    {
        "product_id": 1247,
        "name": "PUBG Mobile - 60 Unknown Cash",
        "price": 118.39,
        "in_stock": true,
        "type": "TOPUP",
        "group": "PUBG Mobile",
        "region": "Любой"
    }
    ```
    
- Ошибки:
    
     Invalid token (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid token"
    }
    ```
    

### **2. Список групп продуктов**

URL: `GET [https://keys.foreignpay.ru/webhook/v2/merchant/get-groups](https://keys.foreignpay.ru/webhook/v2/merchant/get-groups)`

**Параметры запроса (query):**

- `category`: “business” / “games” (необязательно)

**Описание:**

Этот запрос используется для получения списка групп товаров (витрина карточек).

- **Пример ответа:**
    
    ```json
    [
      {
        "icon": "https://s3.api.foreignpay.ru/products-images/icon_xbox.png",
        "category": "games",
        "group": "Xbox"
      },
      {
        "icon": "https://s3.api.foreignpay.ru/products-images/icon_valorant.png",
        "category": "games",
        "group": "Valorant"
      },
      {
        "icon": "https://s3.api.foreignpay.ru/products-images/icon_twitch.png",
        "category": "business",
        "group": "Twitch"
      },
      {
        "icon": "https://s3.api.foreignpay.ru/products-images/icon_steam.png",
        "category": "games",
        "group": "Steam"
      }
    ]
    ```
    
- Ошибки:
    
     Invalid token (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid token"
    }
    ```
    

### **3. Список продуктов в группе**

**URL:** [`GET](https://keys.foreignpay.ru/webhook/v2/merchant/get-group-form) https://keys.foreignpay.ru/webhook/v2/merchant/get-group-form`

**Параметры запроса (query):**

- **`group`** - группа товаров  (обязательно)

**Описание:**

Этот запрос используется для получения списка товаров, с иконками и категориями, обязательными полями формы, объединенных одной группой.

- **Пример ответа:**
    
    ```json
    {
      "image": "https://s3.api.foreignpay.ru/products-images/image_roblox.png",
      "icon": "https://s3.api.foreignpay.ru/products-images/icon_roblox.png",
      "group": "Roblox",
      "category": "games",
      "short_info": "Ваучер для пополнения баланса аккаунта",
      "forms": {
        "topup_fields": [
          {
            "name": "account",
            "type": "text",
            "label": "Ваш Login"
          },
          {
            "name": "password",
            "type": "text",
            "label": "Пароль"
          },
          {
            "name": "nickname",
            "type": "text",
            "label": "Nickname в игре"
          },
          {
            "name": "backupcode",
            "type": "text",
            "label": "Backup code (который еще не использовали)"
          },
          {
            "name": "region",
            "type": "options",
            "label": "Регион",
            "options": [
              {
                "name": "Любой",
                "value": "Any"
              }
            ]
          },
          {
            "name": "product_id",
            "type": "options",
            "options": [
              {
                "value": 5830,
                "product": "800 Robux",
                "price": 1405,
                "region": "Любой",
                "name_prefix": "800 Robux",
                "type": "TOPUP"
              }
            ]
          }
        ],
        "voucher_fields": [
          {
            "name": "region",
            "type": "options",
            "label": "Регион",
            "options": [
              {
                "name": "Европа",
                "value": "Europe"
              },
              {
                "name": "США",
                "value": "America"
              }
            ]
          },
          {
            "name": "email",
            "label": "Email",
            "type": "text"
          },
          {
            "name": "product_id",
            "type": "options",
            "label": "Товары",
            "options": [
              {
                "value": 470,
                "product": "Roblox 10 AUD AU",
                "price": 1070,
                "region": "Европа",
                "name_prefix": "Roblox",
                "type": "VOUCHER"
              },
              {
                "value": 147,
                "product": "Gift Card 10 USD",
                "price": 1320,
                "region": "США",
                "name_prefix": "Roblox",
                "type": "VOUCHER"
              }
            ]
          }
        ]
      }
    }
    ```
    
- Ошибки:
    
     Invalid token (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid token"
    }
    ```
    
- Доп. Инфо:
    
    product.type:
    
    - VOUCHER (ваучеры)
    - TOPUP (пополнение аккаунтов)
    
    field.type:
    
    - options
    - text
    - number
    - float
    - password
    - hidden

### 4.1 Пополнение Steam-аккаунтов (group = Steam, type = TOPUP)

Выполняется в два действия. Сначала отправляется запрос на проверку существования аккаунта. Если существует, то вернется id запроса. Затем полученный id нужно вставить в запрос получения ссылки на оплату. Как только оплата будет произведена - аккаунт автоматически пополнится

### **4.1.1 Проверка аккаунта:**

URL: `POST https://keys.foreignpay.ru/webhook/proxy-request-post`

Параметры запроса (body):

- `path` -  /steam/check
- `request` -
    - `steamUsername` - steam username

Пример запроса:

- Пример запроса**:**
    
    ```json
    {
    		"path": "/steam/check",
    		"request": {
    				"steamUsername": "nwaps123"
        }
    }
    ```
    
- Пример ответа:
    
    ```json
    {
        "status": "success",
        "message": "Аккаунт Steam успешно найден",
        "steamUsername": "nwaps123",
        "transactionId": "9140bde5-2633-4f32-a686-96d6d6735bae"
    }
    ```
    

### **4.1.2 Пополнение проверенного аккаунта:**

URL: `POST https://keys.foreignpay.ru/webhook/proxy-request-post`

Параметры запроса (body):

- `path` -  /steam/pay
- `request` -
    - `net_amount` - сумма пополнения
    - `transactionId` - id транзакции из 4.4.1
    - `successUrl` - URL редиректа после завершения оплаты
- Пример запроса**:**
    
    ```json
    {
    		"path": "/steam/v2/pay",
    		"request": {
    		    "net_amount": 1000,
    		    "transactionId": "9140bde5-2633-4f32-a686-96d6d6735bae",
    		    "successUrl": "https://vk.foreignpay.ru/success?userId=0ed72fb2-150b-497d-9337-7f6448479e60&utm_source=&utm_medium=&utm_campaign=&utm_content=&app="
        }
    }
    ```
    
- Пример ответа:
    
    ```json
    {
    		"status": "success",
        "message": "Аккаунт Steam успешно найден",
        "steamUsername": "nwaps123",
        "transactionId": "9140bde5-2633-4f32-a686-96d6d6735bae"
    }
    ```
    

### 4.1.3 Получить сумму к оплате по сумме пополнения

URL: `POST https://keys.foreignpay.ru/webhook/proxy-request-post`

Параметры запроса (body):

- `path` -  /steam/get-rate
- `request` -
    - `net_amount` - сумма пополнения аккаунта
    - Пример запроса:
        
        ```json
        {
        	"path": "/steam/get-rate",
        	"request": {
            "net_amount": 1000
          }
        }
        ```
        
    - Пример ответа:
        
        ```json
        {
          "net_amount": 1000,
          "amount": 1087
        }
        ```
        

### **4.2 Покупка Ваучера (type = VOUCHER)**

URL: `POST https://keys.foreignpay.ru/webhook/proxy-request-post`

**Параметры запроса (body):**

- `path` -  /voucher/buy
- `request` -
    - `product_id` - берется из карточки товара или списка товаров
    - `email`**-** почта покупателя, на которую отправляется ваучер с кодом и инструкцией
    - **`success_url`-** URL редиректа после завершения оплаты
    - `retail_price или retail_percent` - своя цена/наценка (необязательно)
    - `order_id` - ваш внутренний номер заказа (необязательно, придёт в колбеке при оплате товара)
    - `retail_price`(необязательно) - принудительная установка финальной цены оплаты для клиента. Дает возможность изменить сумму к оплате клиенту в бОльшую сторону, увеличив собственную маржу мерчанта. Разница между минимальной ценой и установленной будет начислена к депозиту мерчанта.
- Пример запроса:
    
    ```json
    {
    		"path": "/voucher/buy",
    		"request": {
    			"product_id": 0,
    	    "success_url": "https://vk.com",
    	    "email": "user@mail.ru",
    	    "retail_price": 1600,
    	    "order_id": "you_order_number"
    		}
    }
    ```
    
- Пример ответа:
    
    ```json
    {
        "status": true,
        "sbp_uuid": "c1d48631-461d-43cf-9ec7-838eed8b2319",
        "qr_url": "https://qr.nspk.ru/BD20001RE1VR8KTS9GPP1KU8AGAT2628?type=02&bank=100000000013&sum=150000&cur=RUB&crc=D306",
        "sbp_url": "https://paydigital.shop/payment/c1d48631-461d-43cf-9ec7-838eed8b2319",
        "product": "Visa Prepaid Card USA 10usd",
        "product_id": 0,
        "merchant_price_rub": 1480.71,
        "retail_price_rub": 1600,
        "order_id": "you_order_number"
    }
    ```
    
- Ошибки:
    
     Invalid token (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid token"
    }
    ```
    
    Product not found (404)
    
    ```json
    {
    	"status": false,
    	"comment": "Product not found"
    }
    ```
    
    Retail price less than product price (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Retail price less than product price"
    }
    ```
    

### **4.2.1 Повторная отправка ваучера**

URL: `POST [https://keys.foreignpay.ru/webhook/v2/merchant/send-key](https://keys.foreignpay.ru/webhook/v2/merchants/send-key-repeat)`

Параметры запроса (body):

- `sbp_uuid` - sbp_uuid из пункта 4.2

**Описание:**

Этот запрос используется для повторной отправки ваучера в случае, если не удалось отправить заказ с 1-ого раза. 

- Пример запроса**:**
    
    ```json
    {
        "sbp_uuid": "111111-f98e-47bc-80b7-222222222"
    }
    ```
    
- Пример ответа:
    
    ```json
    {
        "key": "https://redeem.yourdigitalreward.com/activate-code/",
        "product": "ChatGPT Plus - 1 Month",
        "product_id": 172,
        "retail_price_rub": 2830
    }
    ```
    

### **4.2.2  Покупка Ваучера через депозит (type = VOUCHER)**

URL: `POST [https://keys.foreignpay.ru/webhook/proxy-request-post](https://keys.foreignpay.ru/webhook/proxy-request-post)`

Параметры запроса (body):

- `path` -  /voucher/deposit
- `request` -
    - `product_id`  - id продукта,
    - `email`  - email клиента
- Пример запроса**:**
    
    ```json
    {
        "path": "/voucher/deposit",
        "request": {
            "product_id": 0,
            "email": "test@mail.com"
        }
    }
    ```
    
- Пример ответа:
    
    Ваучер / карта-ссылка:
    
    ```json
    {
        "status": true,
        "key": "123",
        "product": "Visa cards",
        "product_id": 0,
        "merchant_price": 0.05,
        "transaction_id": "e2e4dd79-e1a4-48b0-8762-7a3c37ba826c"
    }
    ```
    
    Карта с реквизитами:
    
    ```json
    {
      "status": true,
      "key": "baxity17/0000007206810000",
      "product": "ChatGPT Plus - 1 Month",
      "product_id": 172,
      "merchant_price": 34.5,
      "transaction_id": "a32cac36-6305-4477-a349-85c68f5aced3",
      "activation_url": "baxity17/0000007206810000",
      "card_number": "0000007206810000",
      "cvc": "012",
      "exp_date": "12/28"
    } 
    ```
    
- Ошибки:
    
     Invalid token (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid token"
    }
    ```
    
    Incuffient balance (500)
    
    ```json
    {
      "status": false,
      "comment": "Incuffient balance"
    } 
    ```
    
    Product not found (404)
    
    ```json
    {
    	"status": false,
    	"comment": "Product not found"
    }
    ```
    

### **4.3 Пополнение аккаунта TOPUP (type = TOPUP)**

**URL:** `POST https://keys.foreignpay.ru/webhook/proxy-request-post`

Параметры запроса (body):

- `path` -  /topup/check
- `request` -
    - **`success_url`** - URL редиректа после завершения оплаты
    - `retail_price` - своя цена (необязательно)
    - `поля из пункта 3`  - **“Список продуктов в группе” в topup_fields**
    - `order_id`  - ваш внутренний номер заказа (необязательно, придёт в колбеке при оплате товара, если используется наш эквайринг)
    - `retail_price`(необязательно) - принудительная установка финальной цены оплаты для клиента. Дает возможность изменить сумму к оплате клиенту в бОльшую сторону, увеличив собственную маржу мерчанта. Разница между минимальной ценой и установленной будет начислена к депозиту мерчанта.
- Пример запроса**:**
    
    ```json
    {
        "path": "/topup/check",
        "request": {
            "account": "9913131412",
            "password": "123",
            "nickname": "Robloxer",
            "backupcode": "123-123",
            "region": "Any",
            "product_id": "5830",
            "success_url": "https://vk-gilt.vercel.app/success?utm_campaign=&utm_content=&utm_source=&utm_medium=&userId=52226270953&app=",
            "order_id": "you_order_number"
        }
    }
    ```
    
- Пример ответа:
    
    ```json
    {
      "status": true,
      "sbp_uuid":"df49baad-76b7-4d2c-9dca-ad35decb8c3a",
      "qr_url": "https://qr.nspk.ru/BD20007OUNID0V0K9D3A3N4NAGHB10SC?type=02&bank=100000000013&sum=11597&cur=RUB&crc=C87A",
      "sbp_url": "https://paydigital.shop/payment/df49baad-76b7-4d2c-9dca-ad35decb8c3a",
      "product": "PUBG Mobile - 60 Unknown Cash",
      "product_id": 5830,
      "merchant_price_rub": 115.97,
      "retail_price_rub": 115.97,
      "order_id": "you_order_number"
    }
    ```
    
- Ошибки:
    
     Invalid token (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid token"
    }
    ```
    
    Account Not Found (404) валидция аккаунтов PUBG Mobile и Mobile Legends
    
    ```json
    {
      "status": false,
      "comment": "Account Not Found"
    }
    ```
    
    Product not found (404)
    
    ```json
    {
    	"status": false,
    	"comment": "Product not found"
    }
    ```
    
    Retail price less than product price (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Retail price less than product price"
    }
    ```
    

### **4.3.1 Пополнение аккаунта TOPUP через депозит (type = TOPUP)**

**URL:** `POST https://keys.foreignpay.ru/webhook/proxy-request-post`

Параметры запроса (body):

- `path` -  /topup/deposit
- `request` -
    - **`success_url`** - URL редиректа после завершения оплаты
    - `поля из пункта 3`  - **“Список продуктов в группе” в topup_fields**
- Пример запроса**:**
    
    ```json
    {
        "path": "/topup/deposit",
        "request": {
            "account": "9913131412",
            "password": "123",
            "nickname": "Robloxer",
            "backupcode": "123-123",
            "region": "Any",
            "product_id": "5830",
            "success_url": "https://vk-gilt.vercel.app/success?utm_campaign=&utm_content=&utm_source=&utm_medium=&userId=52226270953&app="
        }
    }
    ```
    
- Пример ответа:
    
    ```json
    {
      "status": true,
      "product": "Mobile Legends - 22 Diamonds Top Up",
      "product_id": 1910,
      "merchant_price": 60,
      "transaction_id": "b065c2d7-72ae-48d7-a2b3-27257377d803"
    }
    ```
    
- Ошибки:
    
     Invalid token (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid token"
    }
    ```
    
    Product not found (404)
    
    ```json
    {
    	"status": false,
    	"comment": "Product not found"
    }
    ```
    
    Retail price less than product price (500)
    
    ```json
    {
      "status": false,
      "comment": "Incuffient balance"
    } 
    ```
    

### **4.3.2 Статус TOPUP ордера**

**URL:** `POST https://keys.foreignpay.ru/webhook/v2/merchant/topup/status`

Параметры запроса (body):

- `transaction_id` -  id операции топап
- Пример запроса**:**
    
    ```json
    {
        "transaction_id": "bf65459b-7276-40b9-a7c3-caa69b403bf7"
    }
    ```
    
- Пример ответа:
    
    ```json
    {
        "operation_id": "80e25aff-9661-4f82-a12c-53b244079b22",
        "status": "SUCCESS",
        "product_id": 1899
    }
    ```
    
- Ошибки:
    
     Invalid token (500)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid token"
    }
    ```
    
    Invalid transaction(400)
    
    ```json
    {
    	"status": false,
    	"comment": "Invalid transaction"
    }
    ```
    
- Доп. Инфо:
    
    Статусы топап заказа:
    
    - SUCCESS - заказ выполнен успешно
    - Ready_to_sent / ORDER_SENT / PENDING - заказ в процессе на нашей стороне
    - REFUNDED -  заказ завершился с ошибкой

### **4.3.3 Проверка аккаунта TOPUP**

**URL:** `POST https://keys.foreignpay.ru/webhook/v2/merchant/topup/check-account`

Параметры запроса (body):

- `product_id` - id товара
- `поля из пункта 3`  - **“Список продуктов в группе” в topup_fields**
- Пример запроса**:**
    
    ```json
    {
        "account": "123",
        "product_id": 1247,
        "region": "Europe",
        "server_id": "5050"
    }
    ```
    
- Пример ответа:
    
    ```json
    
    {
    	"status": true,
    	"comment": "successful"
    }
    ```
    
- Ошибки:
    
    Account not found (404)
    
    ```json
    {
      "status": false,
      "comment": "Account not found"
    }
    ```
    
    Game not found(404)
    
    ```json
    {
      "status": false,
      "comment": "Game not found"
    }
    ```
    

### **4.4 Покупка eSIM**

URL: `POST https://keys.foreignpay.ru/webhook/proxy-request-post`

**Параметры запроса (body):**

- `path` -  /esim-trip/buy
- `request` -
    - `product_id: 500`
    - `email`**-** почта покупателя, на которую отправляется ваучер с кодом и инструкцией, если не указана - содержимое вернется в ответе на запрос
    - **`success_url`-** URL редиректа после завершения оплаты (не обязательно)
    - `retail_price или retail_percent` - цена, предъявляемая клиенту к оплате за продукт Если не указана - сформируется платежная ссылка на закупочную стоимость для мерчанта (не обязательно). Может указываться для увеличения цены выше базовой по инициативе мерчанта (например, для увеличения прибыли). `retail_price`  - сумма к оплате клиенту. `retail_percent` - процент доп.наценки для клиента
    - `package`**- название покупаемого продукта**
    - `order_id`   - ваш внутренний номер заказа (необязательно, придёт в колбеке при оплате товара)
    `days` - количество дней (для покупки безлимитный продуктов

[Остальные запросы по eSIM, в т.ч список продуктов и прайс](https://www.notion.so/1b94c6189648801d8c86d776f2e300e3?pvs=21)

### **5. Проверка статуса транзакции**

URL: `POST [https://acquiring.foreignpay.ru/webhook/check_transaction](https://acquiring.foreignpay.ru/webhook/deposit-merchant-instructions)`

Параметры запроса (body):

- `transaction_uuid`  - id транзакции (sbp_uuid)
- Пример запроса**:**
    
    ```json
    {
      "transaction_uuid": "0560e549-efec-4150-9604-daaca7513025"
    }
    ```
    
- Пример ответа:
    
    ```json
    {
        "amount": "1518",
        "transaction_date": "2024-11-07T18:43:45.947Z",
        "status": "Expired",
        "last_updated": "2024-11-07T19:14:23.197Z",
        "sbp_uuid": "0560e549-efec-4150-9604-daaca7513025",
        "description": "Оплата Steam",
        "success_url": "https://www.oplata.info/resultpage?puid=14D6B19D-BD23-483E-B6AD-DB9FDD0C930A",
        "usdt_amount": null,
        "mosrate": null,
        "order_number": null,
        "currency": "RUB",
        "webhook_receive_status": null,
        "webhook_fail_reason": null
    }
    ```
    
- Ошибки:
    
    Empty required fields (404)
    
    ```json
    {
      "status": false,
      "comment": "Empty required fields"
    }
    ```
    
    Not found (404)
    
    ```json
    {
      "status": false,
      "comment": "transaction with uuid 0560e549 not found"
    }
    ```
    

### **5.1 Информация о купленном товаре**

URL: `POST https://keys.foreignpay.ru/webhook/product/information`

**Параметры запроса (body):**

- `transaction_id` - id транзакции (sbp_uuid)
- Пример запроса**:**
    
    ```json
    {
        "transaction_id": "bf65459b-7276-40b9-a7c3-caa69b403bf7"
    }
    ```
    
- Пример ответа:
    - eSIM
    
    ```json
      {
        "status": true,
        "data": {
          "operator": "SampleTel",
          "networks": "Sample Mobile (4G)",
          "country_ru": "Примерландия",
          "inet_limit": "5 GB",
          "validity": 15,
          "sim_iccid": "8999000000000000000",
          "esim_activation": {
            "android": {
              "lpa_code": "LPA:1$sample.server.com$AAAAA-BBBBB-CCCCC-DDDDD"
            },
            "ios": {
              "sm_dp_address": "sample.server.com",
              "activation_code": "AAAAA-BBBBB-CCCCC-DDDDD"
            }
          },
          "qrcode_url": "https://example.com/qr?expires=1234567890&id=111111&signature=abcdef123456",
          "img": "https://example.com/images/sample_country",
          "product_group": "esim",
          "support_bot": "https://t.me/sampleSupportBot"
        }
      }
    ```
    
    - Карта-ссылка
    
    ```json
     {
        "data": {
          "activation_url": "http://www.exampleprepaid.com/redeem",
          "product_group": "redeem",
          "instruction": "Инструкция по активации ваучера:\n1. Подключите VPN к США и перейдите по ссылке ваучера.\n2. Нажмите “Activate your reward”.\n3. На открывшейся странице заполните поля:\n   Country – United States;\n   First Name – Test;\n   Last Name – User;\n   Street address – 123 Example St #101;\n   City – Sample City;\n   State – California;\n   ZIP Code – 90001;\n   Phone Number – 1234567890;\n   Email Address – testuser@example.com;\n4. Поставьте галочки напротив “I have read…” и нажмите “Activate”.\n5. Ваучер активирован. Сохраните данные карты.\n6. Проверьте почту для ссылки с деталями карты.\n\nИнструкция по оплате:\n1. Включите VPN (США).\n2. Выберите тариф на сайте.\n3. Введите реквизиты ваучера.\n4. Подтвердите пополнение аккаунта и укажите адрес:\n   Country – United States;\n   First Name – Test;\n   Last Name – User;\n   Street address – 123 Example St #101;\n   City – Sample City;\n   State – California;\n   ZIP Code – 90001;\n5. Примите условия и нажмите «Оплатить».\n6. Готово! Платная версия активирована.",
          "message": "Используйте этот тестовый код для активации ваучера на демонстрационном сайте. Для тестирования используйте почту с доменом example.com и VPN с США.",
          "activation_code": "ABCDE12345FGH",
          "product_name": "SampleService Pro",
          "short_desc": "Тестовый ваучер для сервиса",
          "support_bot": "https://t.me/SampleSupportBot"
        },
        "status": true
      }
    ```
    
    - Карта-креды
    
    ```json
      {
        "data": {
          "activation_url": "https://wanttopay.cloud/api/company-card/55da06ed-1266-41f2-af25-e29116c9eaec",
          "card_number": "4513650028753000",
          "cvc": "835",
          "exp_date": "10/26",
          "card_holder": "Любое (Латиницей)",
          "address": "США, Орегон, 192 Marks str., 97730",
          "product_group": "vcard",
          "instruction": "Инструкция:\n1. Включите VPN США на вашем устройстве.\n2. Войдите в свой аккаунт и перейдите к странице оплаты.\n3. Выберите тариф, который вас интересует.\n4. Введите реквизиты карты.\n5. Подтвердите пополнение аккаунта и укажите адрес:\n   Country – USA;\n   State/Region – Oregon;\n   District – Wanchai;\n   Address – 192 Marks str.;\n   Address 2 – 192 Marks str.;\n   ZIP Code – 97730;\n6. Примите соглашение и нажмите «Оплатить». Поздравляем! Теперь у вас платная версия с большими возможностями!\n",
          "message": "Обязательно используйте непрозрачный VPN при оплате данными реквизитами.\n\nРекомендации к оплате: Используйте для оплаты Google Chrome во вкладке Инкогнито. Не пытайтесь провести оплату, если ваше местоположение не настроено под США. В противном случае ваша карта может быть заблокирована. Если платеж не был принят системой, перед повторной попыткой оплаты убедитесь, что все условия для оплаты выполнены. Попробуйте сменить устройство, почистить кэш/куки вашего браузера. Не совершайте множественные попытки оплаты с отрицательным результатом.",
          "product_name": "Perplexity Pro 1 месяц",
          "short_desc": "Ваучер для оплаты сервиса",
          "support_bot": "https://t.me/PaydigitalShopSupport_bot"
        },
        "status": true
      }
    ```
    
    - Ваучер
    
    ```json
      {
        "data": {
          "voucher": "XXXX-YYYY-ZZZZ",
          "product_group": "voucher",
          "instruction": "\n\t1.\tОткройте магазин SampleStore и войдите в свой профиль;\n\t2.\tВыберите пункт «Активация кода» в меню;\n\t3.\tВведите 12-значный тестовый код и нажмите «Подтвердить»;\n\t4.\tСредства или бонусы будут добавлены в ваш аккаунт.\n\n\t1.\tПерейдите в раздел SampleStore и откройте меню с помощью кнопки;\n\t2.\tВыберите «Дополнительно» > «Активация кода»;\n\t3.\tВведите 12-значный тестовый код и нажмите «Активировать»;\n\t4.\tБонусы будут добавлены к вашей учетной записи;\n\t5.\tГотово! Код успешно активирован.\n",
          "message": "Используйте этот тестовый код для активации вашего ваучера на демонстрационной платформе.",
          "product_name": "SampleStore Gift Card 750",
          "short_desc": "Тестовый ваучер для пополнения баланса",
          "support_bot": "https://t.me/SampleSupportBot"
        },
        "status": true
      }
    ```
    
- Ошибки:
    
    Не указан параметр transaction_id в теле запроса (**400**)
    
    ```json
    {
      "status": false,
      "comment": "transaction_id not provided"
    }
    ```
    
    Недействительный токен авторизации (**401**)
    
    ```json
    {
      "status": false,
      "comment": "Invalid token"
    }
    ```
    
    Переданный transaction_id не найден в системе (404)
    
    ```json
    {
      "status": false,
      "comment": "transaction_id is not correct"
    }
    ```
    
    Продукт по указанному transaction_id отсутствует. (404)
    
    ```json
    {
      "status": false,
      "comment": "No such products"
    }
    ```
    

### **6. Получение HTML-инструкций для мерчантов**

URL: [`POST](https://acquiring.foreignpay.ru/webhook/deposit-merchant-instructions) https://acquiring.foreignpay.ru/webhook/deposit-merchant-instructions`

Параметры запроса (body):

- `transaction_id`  - идентификатор заказа (uuid)
- Пример запроса**:**
    
    ```json
    {
      "transaction_id": "c3f9e5b8-8a2f-4f31-9c6e-2b0b4f6d9e7a"
    }
    ```
    
- Пример ответа:
    
    ```json
    {
      "html": "<div>готовый html-код</div>"
    }
    ```
    
- Ошибки:
    
    Invalid token (500)
    
    ```json
    {
      "status": false,
      "comment": "Invalid token"
    }
    ```
    
    Order_id is empty (500)
    
    ```json
    {
      "status": false,
      "comment": "transaction_id is empty"
    }
    ```
    
    Order was not found (404)
    
    ```json
    {
      "status": false,
      "comment": "Order was not found"
    }
    ```