import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function loadOrders() {
  const orders = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock_orders.json'), 'utf-8'));
  
  console.log(`Загружаю ${orders.length} заказов в Supabase...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const order of orders) {
    const totalPrice = order.items.reduce((sum, item) => sum + (item.quantity * item.initialPrice), 0);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        external_id: `mock-${successCount + 1}`,
        first_name: order.firstName,
        last_name: order.lastName,
        phone: order.phone,
        email: order.email,
        status: order.status,
        total_price: totalPrice,
        city: order.delivery.address.city,
        address: order.delivery.address.text,
        utm_source: order.customFields.utm_source
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log(`⏭ Пропущен (уже есть): ${order.firstName} ${order.lastName}`);
        continue;
      }
      errorCount++;
      console.log(`✗ Ошибка: ${order.firstName} ${order.lastName} - ${error.message}`);
      continue;
    }

    for (const item of order.items) {
      await supabase.from('order_items').insert({
        order_id: data.id,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.initialPrice
      });
    }

    await supabase.from('processed_orders').insert({
      external_id: `mock-${successCount + 1}`
    });

    successCount++;
    console.log(`✓ ${order.firstName} ${order.lastName} - ${totalPrice.toLocaleString('ru-RU')} ₸`);
  }

  console.log(`\n✅ Загружено: ${successCount} | Ошибок: ${errorCount}`);
}

loadOrders();
