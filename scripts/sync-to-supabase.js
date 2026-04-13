import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const RETAILCRM_URL = process.env.RETAILCRM_URL;
const RETAILCRM_API_KEY = process.env.RETAILCRM_API_KEY;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function initTables() {
  const { error } = await supabase.rpc('exec', {
    query: `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        external_id TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        email TEXT,
        status TEXT DEFAULT 'new',
        total_price DECIMAL(12, 2),
        city TEXT,
        address TEXT,
        utm_source TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_name TEXT,
        quantity INTEGER,
        price DECIMAL(12, 2)
      );

      CREATE TABLE IF NOT EXISTS processed_orders (
        external_id TEXT PRIMARY KEY,
        processed_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (error) {
    console.log('Примечание:', error.message);
  }
}

async function fetchOrdersFromRetailCRM() {
  const allOrders = [];
  let page = 1;
  const limit = 50;
  
  while (true) {
    const response = await fetch(`${RETAILCRM_URL}api/v5/orders?limit=${limit}&page=${page}`, {
      headers: {
        'X-API-KEY': RETAILCRM_API_KEY
      }
    });
    
    const data = await response.json();
    const orders = data.orders || [];
    
    if (orders.length === 0) break;
    
    allOrders.push(...orders);
    
    if (orders.length < limit) break;
    page++;
  }
  
  return allOrders;
}

async function syncOrders() {
  console.log('Начинаю синхронизацию RetailCRM → Supabase...');
  console.log(`URL: ${RETAILCRM_URL}`);
  
  await initTables();
  
  const orders = await fetchOrdersFromRetailCRM();
  console.log(`Получено ${orders.length} заказов из RetailCRM`);

  let syncedCount = 0;
  let skippedCount = 0;

  for (const order of orders) {
    const { data: existing } = await supabase
      .from('processed_orders')
      .select('external_id')
      .eq('external_id', String(order.id))
      .single();

    if (existing) {
      skippedCount++;
      continue;
    }

    const totalPrice = order.items?.reduce((sum, item) => {
      return sum + (item.quantity * item.initialPrice);
    }, 0) || 0;

    const customer = order.customer || {};

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .upsert({
        external_id: String(order.id),
        first_name: order.firstName || customer.firstName,
        last_name: order.lastName || customer.lastName,
        phone: order.phone || customer.phone,
        email: order.email || customer.email,
        status: order.status,
        total_price: totalPrice,
        city: order.delivery?.address?.city,
        address: order.delivery?.address?.text,
        utm_source: order.customFields?.utm_source,
        updated_at: new Date().toISOString()
      }, { onConflict: 'external_id' })
      .select()
      .single();

    if (orderError) {
      console.log(`✗ Ошибка сохранения заказа ${order.id}:`, orderError.message);
      continue;
    }

    if (order.items && order.items.length > 0) {
      await supabase.from('order_items').delete().eq('order_id', orderData.id);
      
      const items = order.items.map(item => ({
        order_id: orderData.id,
        product_name: item.offerName || item.productName,
        quantity: item.quantity,
        price: item.initialPrice
      }));
      
      await supabase.from('order_items').insert(items);
    }

    await supabase.from('processed_orders').upsert({
      external_id: String(order.id),
      processed_at: new Date().toISOString()
    });

    syncedCount++;
    console.log(`✓ Синхронизирован заказ #${order.id} (${totalPrice} ₸)`);
  }

  console.log(`\nСинхронизация завершена: ${syncedCount} новых, ${skippedCount} пропущено`);
}

syncOrders();
