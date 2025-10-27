import dotenv from 'dotenv';
dotenv.config();

const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  // dynamic import if node doesn't have global fetch
  try {
    const mod = await import('node-fetch');
    return mod.default || mod;
  } catch (e) {
    throw new Error('No fetch available. Install node-fetch or use Node 18+');
  }
}

async function run() {
  const fetch = await getFetch();
  const url = `${base}/api/payments/generate`;

  const payload = {
    student_id: 'STU002',
    month: '2025-09',
    // leave total_food_price out to let the server compute from DailyMeal
    mess_service_charge: 1200,
    variable_expenses: 180
  };

  console.log('POST', url);
  console.log('payload', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // add Authorization header if needed, e.g. 'Authorization': `Bearer ${process.env.ADMIN_JWT}`
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log('status', res.status);
    try {
      console.log('response JSON:', JSON.parse(text));
    } catch (e) {
      console.log('response text:', text);
    }
  } catch (err) {
    console.error('request failed:', err);
  }
}

run();
