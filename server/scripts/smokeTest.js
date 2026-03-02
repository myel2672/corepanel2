// Simple smoke test script — run after server is up (node >=18)
const jwt = require('jsonwebtoken');
const base = process.env.BASE_URL || 'http://localhost:5000';

function getAdminToken() {
  if (process.env.ADMIN_TOKEN) return process.env.ADMIN_TOKEN;
  const secret = process.env.JWT_SECRET || 'supersecret';
  // create a temporary token (note: not linked to DB user)
  return jwt.sign({ id: 'local-admin', role: 'ADMIN' }, secret, { expiresIn: '7d' });
}

async function run() {
  try {
    const token = getAdminToken();
    console.log('GET /api/products (with token)');
    let r = await fetch(base + '/api/products', { headers: { Authorization: 'Bearer ' + token } });
    console.log('status', r.status);
    try { console.log(await r.json()); } catch(e) { console.log(await r.text()); }

    console.log('\nGET /api/orders (admin)');
    r = await fetch(base + '/api/orders', { headers: { Authorization: 'Bearer ' + token } });
    console.log('status', r.status);
    try { console.log(await r.json()); } catch(e) { console.log(await r.text()); }
  } catch (err) {
    console.error('Smoke test failed', err);
  }
}

run();
