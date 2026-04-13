# RetailCRM Integration Project

## Обзор
Проект для интеграции RetailCRM с Supabase и Telegram-уведомлениями.

## Структура
```
├── mock_orders.json      # 50 тестовых заказов
├── package.json          # Зависимости Node.js
├── .env.example          # Пример переменных окружения
├── scripts/
│   ├── upload-to-retailcrm.js   # Загрузка заказов в RetailCRM
│   ├── sync-to-supabase.js      # Синхронизация RetailCRM → Supabase
│   └── telegram-bot.js           # Telegram бот для уведомлений
└── dashboard/
    └── index.html        # Дашборд с графиками
```

## Шаг 1: Регистрация аккаунтов

### 1.1 RetailCRM (демо)
1. Перейдите на https://www.retailcrm.kz
2. Нажмите "Попробовать бесплатно"
3. Создайте демо-аккаунт

### 1.2 Supabase
1. Перейдите на https://supabase.com
2. Создайте бесплатный проект
3. Скопируйте URL и anon key из Settings → API

### 1.3 Vercel
1. Перейдите на https://vercel.com
2. Зарегистрируйтесь через GitHub
3. Создайте новый проект

### 1.4 Telegram Bot
1. Откройте @BotFather в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям и сохраните токен
4. Начните диалог с ботом и получите ваш Chat ID через @userinfobot

## Шаг 2: Установка

```bash
cd retail-crm-project
npm install
cp .env.example .env
```

Заполните `.env` реальными значениями из ваших аккаунтов.

## Шаг 3: Загрузка заказов в RetailCRM

```bash
npm run upload
```

## Шаг 4: Синхронизация с Supabase

```bash
npm run sync
```

## Шаг 5: Деплой дашборда на Vercel

```bash
cd dashboard
npx vercel
```

## Шаг 6: Запуск Telegram-бота

```bash
npm run bot
```

Бот будет проверять новые заказы каждую минуту и отправлять уведомления при сумме > 50,000 ₸.

## Команды бота
- `/start` - Запуск бота
- `/status` - Статистика заказов

---

## Промты для создания проекта

Если бы я создавал этот проект с нуля, я бы использовал следующие промты:

### Этап 1: Настройка проекта

```
Создай Node.js проект с ES modules для интеграции RetailCRM с Supabase.
Зависимости: dotenv, node-fetch, @supabase/supabase-js, node-telegram-bot-api
```

### Этап 2: Структура и переменные

```
Создай файл .env.example с переменными:
- RETAILCRM_URL, RETAILCRM_API_KEY
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
- TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

Создай README.md с инструкцией по настройке каждого сервиса
```

### Этап 3: Скрипт загрузки в RetailCRM

```
Напиши скрипт upload-to-retailcrm.js который:
- Читает mock_orders.json
- Для каждого заказа создаёт заказ в RetailCRM через POST /api/v5/orders/create
- Использует form-data для отправки (URLSearchParams)
- Формат: { externalId, firstName, lastName, phone, status, items: [{offerName, quantity, initialPrice}], delivery: {address: {city, text}} }
```

### Этап 4: Скрипт синхронизации в Supabase

```
Напиши скрипт sync-to-supabase.js который:
- Получает все заказы из RetailCRM (GET /api/v5/orders?limit=50)
- Создаёт таблицы: orders, order_items, processed_orders
- Синхронизирует новые заказы в Supabase
- Пропускает уже обработанные (processed_orders)
```

### Этап 5: Дашборд

```
Создай dashboard/index.html с:
- Подключением Supabase (@supabase/supabase-js)
- Chart.js для графиков
- 4 карточки статистики (всего заказов, сумма, средний чек, города)
- График продаж по городам (bar chart)
- График UTM источников (doughnut chart)
- Таблица последних заказов
```

### Этап 6: Telegram бот

```
Напиши telegram-bot.js который:
- Проверяет новые заказы каждую минуту
- Отправляет уведомление если сумма > 50000₸
- Формат сообщения: номер заказа, имя клиента, сумма, город, телефон
- Команды /start и /status
```

### Этап 7: Деплой

```
Как задеплоить dashboard на Vercel:
1. cd dashboard
2. npx vercel --prod
3. Настроить environment variables в Vercel Dashboard
```

---

**Главное правило:** описывай конкретную ошибку и проси исправить. AI хорошо понимает "выдает ошибку 404 при запросе к Supabase" лучше чем "не работает".
