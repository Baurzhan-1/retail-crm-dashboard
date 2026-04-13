import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const RETAILCRM_URL = process.env.RETAILCRM_URL;
const RETAILCRM_API_KEY = process.env.RETAILCRM_API_KEY;

(async () => {
  console.log('Testing order with items...');
  
  const orderWithItems = {
    externalId: 'test-items-1',
    firstName: 'Тест',
    lastName: 'Тестов',
    phone: '+77001234567',
    status: 'new',
    items: [
      { offerName: 'Тестовый товар 1', quantity: 2, initialPrice: 15000 }
    ]
  };
  
  const params = new URLSearchParams();
  params.append('order', JSON.stringify(orderWithItems));
  
  const response = await fetch(`${RETAILCRM_URL}api/v5/orders/create`, {
    method: 'POST',
    headers: { 'X-API-KEY': RETAILCRM_API_KEY },
    body: params
  });
  
  const result = await response.json();
  if (result.success) {
    console.log(`✓ SUCCESS: Order ID ${result.id}`);
    console.log(`  Sum: ${result.order?.summ}`);
  } else {
    console.log(`✗ Error: ${JSON.stringify(result)}`);
  }
})();
