import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testDashboard() {
  console.log('Testing with ANON key (dashboard uses this)...');
  
  const { data, error } = await supabase
    .from('orders')
    .select('id, external_id, first_name, total_price')
    .limit(5);
    
  if (error) {
    console.log('Error:', error.message, error.code);
  } else {
    console.log('Success! Orders:', data.length);
    data.forEach(o => console.log(`  #${o.external_id} - ${o.first_name} - ${o.total_price}`));
  }
}

testDashboard();
