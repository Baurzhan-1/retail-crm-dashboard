import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const RETAILCRM_URL = process.env.RETAILCRM_URL;
const RETAILCRM_API_KEY = process.env.RETAILCRM_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const NOTIFICATION_THRESHOLD = 50000;

async function sendNotification(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram не настроен. Сообщение:', message);
    return;
  }
  
  const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
  await bot.sendMessage(TELEGRAM_CHAT_ID, message);
}

async function checkNewOrders() {
  const { data: processed } = await supabase
    .from('processed_orders')
    .select('external_id');

  const processedIds = new Set(processed?.map(p => p.external_id) || []);

  try {
    const response = await fetch(`${RETAILCRM_URL}api/v5/orders?limit=50`, {
      headers: { 'X-API-KEY': RETAILCRM_API_KEY }
    });
    
    const data = await response.json();
    const orders = data.orders || [];

    for (const order of orders) {
      const orderId = String(order.id);
      if (processedIds.has(orderId)) continue;

      const totalPrice = order.items?.reduce((sum, item) => {
        return sum + (item.quantity * item.initialPrice);
      }, 0) || 0;

      if (totalPrice >= NOTIFICATION_THRESHOLD) {
        const message = `🔥 КРУПНЫЙ ЗАКАЗ!\n\n` +
          `📋 #${order.id}\n` +
          `👤 ${order.firstName || ''} ${order.lastName || ''}\n` +
          `💰 Сумма: ${totalPrice.toLocaleString('ru-RU')} ₸\n` +
          `📍 ${order.delivery?.address?.city || 'Не указан'}\n` +
          `📱 ${order.phone || 'Не указан'}`;

        await sendNotification(message);
        console.log(`Отправлено уведомление о заказе #${order.id} на сумму ${totalPrice} ₸`);
      }

      await supabase.from('processed_orders').upsert({
        external_id: orderId,
        processed_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Ошибка проверки заказов:', error.message);
  }
}

async function main() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('⚠️ Telegram бот не настроен. Укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env');
    console.log('Запускаю режим синхронизации без уведомлений...');
  } else {
    const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    
    bot.onText(/\/start/, (msg) => {
      bot.sendMessage(msg.chat.id, 'Бот уведомлений запущен! Буду присылать уведомления о крупных заказах (>50,000 ₸)');
    });

    bot.onText(/\/status/, async (msg) => {
      const { count } = await supabase.from('orders').select('*', { count: 'exact' });
      bot.sendMessage(msg.chat.id, `📊 Всего заказов в базе: ${count || 0}`);
    });
    
    console.log('✅ Telegram бот запущен');
  }

  console.log('🔄 Запуск синхронизации...');
  await checkNewOrders();
  
  setInterval(checkNewOrders, 60000);
}

main();
