import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setupRLS() {
  console.log('Setting up RLS policies...');
  
  const policies = [
    {
      table: 'orders',
      sql: `DROP POLICY IF EXISTS "Allow anon reads" ON orders; CREATE POLICY "Allow anon reads" ON orders FOR SELECT TO anon USING (true);`
    },
    {
      table: 'order_items', 
      sql: `DROP POLICY IF EXISTS "Allow anon reads" ON order_items; CREATE POLICY "Allow anon reads" ON order_items FOR SELECT TO anon USING (true);`
    },
    {
      table: 'processed_orders',
      sql: `DROP POLICY IF EXISTS "Allow anon reads" ON processed_orders; CREATE POLICY "Allow anon reads" ON processed_orders FOR SELECT TO anon USING (true);`
    }
  ];

  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec', { query: policy.sql });
      if (error) {
        console.log(`Error on ${policy.table}:`, error.message);
      } else {
        console.log(`✓ ${policy.table}`);
      }
    } catch (e) {
      console.log(`Error on ${policy.table}:`, e.message);
    }
  }

  console.log('\nTesting public access...');
  const { data, error } = await supabase.from('orders').select('id').limit(1);
  console.log(error ? `Error: ${error.message}` : '✓ Public access OK');
}

setupRLS();
