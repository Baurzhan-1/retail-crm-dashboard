import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

(async () => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log(`Заказов в базе: ${orders.length}`);
    console.log('Последние 5:');
    orders.slice(0, 5).forEach(o => {
      console.log(`  #${o.external_id} - ${o.first_name} ${o.last_name} - ${o.total_price} ₸`);
    });
  }
})();
