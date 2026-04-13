import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

(async () => {
  console.log('Testing REST API...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id,first_name,total_price&limit=5`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Data:', data);
})();
