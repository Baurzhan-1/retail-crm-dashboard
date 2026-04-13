import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RETAILCRM_URL = process.env.RETAILCRM_URL;
const RETAILCRM_API_KEY = process.env.RETAILCRM_API_KEY;

async function uploadOrders() {
  const orders = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock_orders.json'), 'utf-8'));
  
  console.log(`Загружаю ${orders.length} заказов в RetailCRM...`);
  console.log(`URL: ${RETAILCRM_URL}`);

  let successCount = 0;
  let errorCount = 0;

  for (const order of orders) {
    const crmOrder = {
      externalId: `mock-${successCount + errorCount + 1}`,
      firstName: order.firstName,
      lastName: order.lastName,
      phone: order.phone,
      email: order.email,
      status: order.status,
      items: order.items.map(item => ({
        offerName: item.productName,
        quantity: item.quantity,
        initialPrice: item.initialPrice
      })),
      delivery: {
        address: {
          city: order.delivery.address.city,
          text: order.delivery.address.text
        }
      },
      customFields: order.customFields
    };

    try {
      const formData = new URLSearchParams();
      formData.append('order', JSON.stringify(crmOrder));

      const response = await fetch(`${RETAILCRM_URL}api/v5/orders/create`, {
        method: 'POST',
        headers: {
          'X-API-KEY': RETAILCRM_API_KEY
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        successCount++;
        console.log(`✓ ${order.firstName} ${order.lastName} (ID: ${result.id})`);
      } else {
        errorCount++;
        console.log(`✗ ${order.firstName}: ${result.errorMsg}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`✗ ${order.firstName}: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\nРезультат: ${successCount} загружено, ${errorCount} ошибок`);
}

uploadOrders();
