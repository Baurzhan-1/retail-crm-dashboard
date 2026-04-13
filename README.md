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
npm run upload-to-retailcrm
```

## Шаг 4: Синхронизация с Supabase

```bash
npm run sync-to-supabase
```

## Шаг 5: Деплой дашборда на Vercel

```bash
cd dashboard
npx vercel
```

Обновите `SUPABASE_URL` и `SUPABASE_ANON_KEY` в `dashboard/index.html`.

## Шаг 6: Запуск Telegram-бота

```bash
npm run telegram-bot
```

Бот будет проверять новые заказы каждую минуту и отправлять уведомления при сумме > 50,000 ₸.

## Команды бота
- `/start` - Запуск бота
- `/status` - Статистика заказов
