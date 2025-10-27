import dotenv from 'dotenv';
dotenv.config();

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    const mod = await import('node-fetch');
    return mod.default || mod;
  } catch (e) {
    throw new Error('No fetch available. Install node-fetch or use Node 18+');
  }
}

(async () => {
  const fetch = await getFetch();
  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const url = `${base}/api/dailymeals/add`;

  const payload = {
    student_id: process.env.TEST_STUDENT_ID || 'STU002',
    food_id: process.env.TEST_FOOD_ID || 'F1',
    quantity: parseInt(process.env.TEST_QUANTITY || '1', 10),
    date: new Date().toISOString()
  };

  console.log('POST', url);
  console.log('payload', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.ADMIN_JWT ? { Authorization: `Bearer ${process.env.ADMIN_JWT}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log('status', res.status);
    try { console.log('response JSON:', JSON.parse(text)); }
    catch (e) { console.log('response text:', text); }
  } catch (err) {
    console.error('request failed:', err);
  }
})();
