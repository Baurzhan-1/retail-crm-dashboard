import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  const { data, error } = await supabase.rpc('pg_catalog.pg_tables', { 
    schemaname: 'public' 
  }).select('tablename');
  
  console.log('Tables:', data?.map(t => t.tablename));
  
  const { data: cols, error: colErr } = await supabase
    .from('orders')
    .select()
    .limit(1);
    
  console.log('Orders columns:', cols ? Object.keys(cols[0] || {}) : colErr?.message);
  
  console.log('Total orders:', (await supabase.from('orders').select('*', { count: 'exact' })).count);
})();
