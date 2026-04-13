import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  const { data, error } = await supabase.rpc('pg_catalog.pg_policies', { 
    tablename: 'orders' 
  }).select('policyname, cmd');
  
  console.log('RLS Policies:', data);
  
  if (!data || data.length === 0) {
    console.log('No RLS policies - enabling RLS...');
    await supabase.rpc('pg_catalog.set_reloption', { 
      relname: 'orders', 
      reloptions: ['row_security=true']
    }).catch(() => console.log('Using raw SQL approach...'));
    
    console.log('Creating public read policy...');
    await supabase.rpc('exec', {
      query: 'CREATE POLICY "Allow anon reads" ON orders FOR SELECT TO anon USING (true);'
    }).catch(e => console.log('Note:', e.message));
  }
})();
